import { create } from "zustand";
import { v4 as uuid } from "uuid";
import { peerManager } from "@/lib/webrtc/peerManager";
import { getAllRooms, saveRoom } from "@/lib/db/roomRepo";
import { loadRoomMessages, persistMessage } from "@/lib/db/messageRepo";
import { isUserBlocked } from "@/lib/db/blocklist";
import { upsertKnownUser } from "@/lib/db/userRepo";
import { decryptMessage, encryptMessage, generateSessionKey } from "@/lib/crypto/keys";
import { addToQueue, flushQueue, registerSendHandler } from "@/lib/sync/queueManager";
import { useSettingsStore } from "@/store/settingsStore";
import { chunkString } from "@/lib/utils/file";
import { FILE_CHUNK_SIZE, SAVED_MESSAGES_ID } from "@/lib/utils/constants";
import type { Room } from "@/types/room.types";
import type { ChatMessage, Reaction } from "@/types/message.types";
import type { UserProfile } from "@/types/user.types";
import type {
  ChatChunkPayload,
  HelloPayload,
  ReactionPayload,
  ReadReceiptPayload,
  RoomInvitePayload,
  WireMessage,
} from "@/types/wire.types";

interface IncomingTransfer {
  chunks: string[];
  total: number;
  meta: ChatChunkPayload["meta"];
}

interface ChatState {
  rooms: Room[];
  messages: Record<string, ChatMessage[]>;
  currentRoomId: string | null;
  onlineStatus: Record<string, boolean>;
  typingUsers: Record<string, string[]>;
  knownUsers: Record<string, UserProfile>;
  initialized: boolean;
  transfers: Record<string, IncomingTransfer>;

  init: (me: UserProfile) => Promise<void>;
  setCurrentRoom: (id: string | null) => void;
  createDirectRoom: (peerId: string, hintName?: string) => Promise<Room>;
  createGroupRoom: (name: string, memberIds: string[]) => Promise<Room>;
  sendText: (roomId: string, content: string, replyTo?: ChatMessage | null) => Promise<void>;
  sendFile: (
    roomId: string,
    file: { name: string; size: number; mime: string; data: string },
    type: "file" | "voice",
    durationSec?: number,
  ) => Promise<void>;
  forwardMessage: (message: ChatMessage, targetRoomIds: string[]) => Promise<void>;
  editMessage: (roomId: string, messageId: string, newContent: string) => Promise<void>;
  deleteMessage: (roomId: string, messageId: string) => Promise<void>;
  addReaction: (roomId: string, messageId: string, emoji: string) => Promise<void>;
  togglePinMessage: (roomId: string, messageId: string) => Promise<void>;
  togglePinRoom: (roomId: string) => Promise<void>;
  toggleFavoriteRoom: (roomId: string) => Promise<void>;
  markRoomRead: (roomId: string) => Promise<void>;
  setTyping: (roomId: string, peerId: string, isTyping: boolean) => void;
  sendTypingSignal: (roomId: string, isTyping: boolean) => void;
}

function otherMembers(room: Room, myId: string): string[] {
  return room.members.filter((m) => m !== myId);
}

function directRoomId(a: string, b: string): string {
  return `dm_${[a, b].sort().join("_")}`;
}

let currentUserId = "";

export const useChatStore = create<ChatState>((set, get) => ({
  rooms: [],
  messages: {},
  currentRoomId: null,
  onlineStatus: {},
  typingUsers: {},
  knownUsers: {},
  initialized: false,
  transfers: {},

  init: async (me) => {
    currentUserId = me.id;

    // Ensure the "Saved Messages" self-chat always exists.
    const existingRooms = await getAllRooms();
    let savedRoom = existingRooms.find((r) => r.id === SAVED_MESSAGES_ID);
    if (!savedRoom) {
      savedRoom = {
        id: SAVED_MESSAGES_ID,
        name: "Saved Messages",
        type: "saved",
        members: [me.id],
        unreadCount: 0,
        isPinned: true,
        isFavorite: false,
        createdAt: Date.now(),
      };
      await saveRoom(savedRoom);
      existingRooms.unshift(savedRoom);
    }

    const messagesByRoom: Record<string, ChatMessage[]> = {};
    for (const room of existingRooms) {
      messagesByRoom[room.id] = await loadRoomMessages(room.id);
    }

    set({ rooms: existingRooms, messages: messagesByRoom, initialized: true });

    // Wire up realtime + queue plumbing exactly once.
    peerManager.on("data", ({ message, fromPeerId }) => handleIncoming(message, fromPeerId, set, get));
    peerManager.on("peer-connected", ({ peerId }) => {
      set((s) => ({ onlineStatus: { ...s.onlineStatus, [peerId]: true } }));
      // Say hello / re-announce our profile whenever a link comes up.
      peerManager.send(peerId, {
        kind: "hello",
        fromId: me.id,
        payload: { id: me.id, displayName: me.displayName, bio: me.bio, avatar: me.avatar } as HelloPayload,
      });
    });
    peerManager.on("peer-disconnected", ({ peerId }) => {
      set((s) => ({ onlineStatus: { ...s.onlineStatus, [peerId]: false } }));
    });

    registerSendHandler(async (message) => {
      const room = get().rooms.find((r) => r.id === message.roomId);
      if (!room) return false;
      const targets = otherMembers(room, currentUserId);
      if (targets.length === 0) return true; // saved messages - nothing to deliver
      const allReachable = targets.every((id) => peerManager.isConnected(id));
      if (!allReachable) return false;
      await deliverMessage(message, targets);
      return true;
    });

    window.addEventListener("online", () => flushQueue());
    flushQueue();
  },

  setCurrentRoom: (id) => set({ currentRoomId: id }),

  createDirectRoom: async (peerId, hintName) => {
    const me = currentUserId;
    const id = directRoomId(me, peerId);
    const existing = get().rooms.find((r) => r.id === id);
    if (existing) return existing;

    const room: Room = {
      id,
      name: hintName || peerId,
      type: "direct",
      members: [me, peerId],
      unreadCount: 0,
      isPinned: false,
      isFavorite: false,
      createdAt: Date.now(),
    };
    await saveRoom(room);
    set((s) => ({ rooms: [room, ...s.rooms], messages: { ...s.messages, [id]: [] } }));

    peerManager.connectTo(peerId);
    const invite: RoomInvitePayload = {
      id: room.id,
      name: room.name,
      type: "direct",
      members: room.members,
      createdAt: room.createdAt,
    };
    peerManager.send(peerId, { kind: "room-invite", fromId: me, payload: invite });
    return room;
  },

  createGroupRoom: async (name, memberIds) => {
    const me = currentUserId;
    const room: Room = {
      id: uuid(),
      name,
      type: "group",
      members: [me, ...memberIds],
      unreadCount: 0,
      isPinned: false,
      isFavorite: false,
      createdAt: Date.now(),
    };
    await saveRoom(room);
    set((s) => ({ rooms: [room, ...s.rooms], messages: { ...s.messages, [room.id]: [] } }));

    const invite: RoomInvitePayload = {
      id: room.id,
      name: room.name,
      type: "group",
      members: room.members,
      avatar: room.avatar,
      createdAt: room.createdAt,
    };
    memberIds.forEach((id) => {
      peerManager.connectTo(id);
      peerManager.send(id, { kind: "room-invite", fromId: me, payload: invite });
    });
    return room;
  },

  sendText: async (roomId, content, replyTo) => {
    const message: ChatMessage = {
      id: uuid(),
      roomId,
      senderId: currentUserId,
      senderName: get().knownUsers[currentUserId]?.displayName,
      content,
      type: "text",
      replyTo: replyTo?.id,
      replyPreview: replyTo ? (replyTo.isDeleted ? "Deleted message" : replyTo.content.slice(0, 120)) : undefined,
      reactions: [],
      isEdited: false,
      isDeleted: false,
      isPinned: false,
      readBy: [currentUserId],
      timestamp: Date.now(),
      status: "sending",
    };
    await pushOutgoingMessage(message, set, get);
  },

  sendFile: async (roomId, file, type, durationSec) => {
    const message: ChatMessage = {
      id: uuid(),
      roomId,
      senderId: currentUserId,
      senderName: get().knownUsers[currentUserId]?.displayName,
      content: type === "voice" ? "🎤 Voice message" : `📎 ${file.name}`,
      type,
      fileData: file,
      durationSec,
      reactions: [],
      isEdited: false,
      isDeleted: false,
      isPinned: false,
      readBy: [currentUserId],
      timestamp: Date.now(),
      status: "sending",
    };
    await pushOutgoingMessage(message, set, get);
  },

  forwardMessage: async (message, targetRoomIds) => {
    for (const roomId of targetRoomIds) {
      const forwarded: ChatMessage = {
        ...message,
        id: uuid(),
        roomId,
        senderId: currentUserId,
        senderName: get().knownUsers[currentUserId]?.displayName,
        forwardedFrom: message.senderName || message.senderId,
        replyTo: undefined,
        replyPreview: undefined,
        reactions: [],
        isEdited: false,
        isPinned: false,
        readBy: [currentUserId],
        timestamp: Date.now(),
        status: "sending",
      };
      await pushOutgoingMessage(forwarded, set, get);
    }
  },

  editMessage: async (roomId, messageId, newContent) => {
    updateLocalMessage(set, roomId, messageId, (m) => ({ ...m, content: newContent, isEdited: true }));
    const updated = get().messages[roomId]?.find((m) => m.id === messageId);
    if (updated) await persistMessage(updated);

    const room = get().rooms.find((r) => r.id === roomId);
    if (room) {
      const key = await generateSessionKey(roomId);
      const cipher = await encryptMessage(newContent, key);
      peerManager.broadcast(otherMembers(room, currentUserId), {
        kind: "edit",
        roomId,
        fromId: currentUserId,
        payload: { messageId, content: cipher },
      });
    }
  },

  deleteMessage: async (roomId, messageId) => {
    updateLocalMessage(set, roomId, messageId, (m) => ({ ...m, isDeleted: true, content: "" }));
    const updated = get().messages[roomId]?.find((m) => m.id === messageId);
    if (updated) await persistMessage(updated);

    const room = get().rooms.find((r) => r.id === roomId);
    if (room) {
      peerManager.broadcast(otherMembers(room, currentUserId), {
        kind: "delete",
        roomId,
        fromId: currentUserId,
        payload: { messageId },
      });
    }
  },

  addReaction: async (roomId, messageId, emoji) => {
    const reaction: Reaction = { emoji, userId: currentUserId };
    updateLocalMessage(set, roomId, messageId, (m) => ({
      ...m,
      reactions: [...m.reactions.filter((r) => r.userId !== currentUserId), reaction],
    }));
    const updated = get().messages[roomId]?.find((m) => m.id === messageId);
    if (updated) await persistMessage(updated);

    const room = get().rooms.find((r) => r.id === roomId);
    if (room) {
      const payload: ReactionPayload = { messageId, reaction };
      peerManager.broadcast(otherMembers(room, currentUserId), {
        kind: "reaction",
        roomId,
        fromId: currentUserId,
        payload,
      });
    }
  },

  togglePinMessage: async (roomId, messageId) => {
    updateLocalMessage(set, roomId, messageId, (m) => ({ ...m, isPinned: !m.isPinned }));
    const updated = get().messages[roomId]?.find((m) => m.id === messageId);
    if (updated) {
      await persistMessage(updated);
      const room = get().rooms.find((r) => r.id === roomId);
      if (room) {
        peerManager.broadcast(otherMembers(room, currentUserId), {
          kind: "pin",
          roomId,
          fromId: currentUserId,
          payload: { messageId, isPinned: updated.isPinned },
        });
      }
    }
  },

  togglePinRoom: async (roomId) => {
    const room = get().rooms.find((r) => r.id === roomId);
    if (!room) return;
    const updatedRoom = { ...room, isPinned: !room.isPinned };
    await saveRoom(updatedRoom);
    set((s) => ({ rooms: s.rooms.map((r) => (r.id === roomId ? updatedRoom : r)) }));
  },

  toggleFavoriteRoom: async (roomId) => {
    const room = get().rooms.find((r) => r.id === roomId);
    if (!room) return;
    const updatedRoom = { ...room, isFavorite: !room.isFavorite };
    await saveRoom(updatedRoom);
    set((s) => ({ rooms: s.rooms.map((r) => (r.id === roomId ? updatedRoom : r)) }));
  },

  markRoomRead: async (roomId) => {
    const room = get().rooms.find((r) => r.id === roomId);
    if (room && room.unreadCount !== 0) {
      const updatedRoom = { ...room, unreadCount: 0 };
      await saveRoom(updatedRoom);
      set((s) => ({ rooms: s.rooms.map((r) => (r.id === roomId ? updatedRoom : r)) }));
    }

    const unreadIds =
      get().messages[roomId]?.filter((m) => m.senderId !== currentUserId && !m.readBy.includes(currentUserId)).map((m) => m.id) ?? [];
    if (unreadIds.length === 0) return;

    set((s) => ({
      messages: {
        ...s.messages,
        [roomId]: s.messages[roomId].map((m) =>
          unreadIds.includes(m.id) ? { ...m, readBy: [...m.readBy, currentUserId] } : m,
        ),
      },
    }));

    if (room && useSettingsStore.getState().readReceipts) {
      const payload: ReadReceiptPayload = { roomId, messageIds: unreadIds, readerId: currentUserId };
      peerManager.broadcast(otherMembers(room, currentUserId), {
        kind: "read-receipt",
        roomId,
        fromId: currentUserId,
        payload,
      });
    }
  },

  setTyping: (roomId, peerId, isTyping) => {
    set((s) => {
      const current = new Set(s.typingUsers[roomId] ?? []);
      if (isTyping) current.add(peerId);
      else current.delete(peerId);
      return { typingUsers: { ...s.typingUsers, [roomId]: Array.from(current) } };
    });
  },

  sendTypingSignal: (roomId, isTyping) => {
    const room = get().rooms.find((r) => r.id === roomId);
    if (!room) return;
    peerManager.broadcast(otherMembers(room, currentUserId), {
      kind: "typing",
      roomId,
      fromId: currentUserId,
      payload: { isTyping },
    });
  },
}));

function updateLocalMessage(
  set: (fn: (s: ChatState) => Partial<ChatState>) => void,
  roomId: string,
  messageId: string,
  updater: (m: ChatMessage) => ChatMessage,
) {
  set((s) => ({
    messages: {
      ...s.messages,
      [roomId]: (s.messages[roomId] ?? []).map((m) => (m.id === messageId ? updater(m) : m)),
    },
  }));
}

async function pushOutgoingMessage(
  message: ChatMessage,
  set: (fn: (s: ChatState) => Partial<ChatState>) => void,
  get: () => ChatState,
) {
  // Optimistic local echo + local persistence first (offline-first).
  set((s) => ({
    messages: { ...s.messages, [message.roomId]: [...(s.messages[message.roomId] ?? []), message] },
  }));
  await persistMessage(message);
  await touchRoomPreview(message, set, get);

  const room = get().rooms.find((r) => r.id === message.roomId);
  const targets = room ? otherMembers(room, currentUserId) : [];

  if (targets.length === 0) {
    // Saved Messages - purely local, mark as sent immediately.
    updateLocalMessage(set, message.roomId, message.id, (m) => ({ ...m, status: "sent" }));
    return;
  }

  if (!navigator.onLine || !targets.every((id) => peerManager.isConnected(id))) {
    await addToQueue(message);
    updateLocalMessage(set, message.roomId, message.id, (m) => ({ ...m, status: "pending" }));
    return;
  }

  try {
    await deliverMessage(message, targets);
    updateLocalMessage(set, message.roomId, message.id, (m) => ({ ...m, status: "sent" }));
  } catch {
    await addToQueue(message);
    updateLocalMessage(set, message.roomId, message.id, (m) => ({ ...m, status: "pending" }));
  }
}

async function touchRoomPreview(
  message: ChatMessage,
  set: (fn: (s: ChatState) => Partial<ChatState>) => void,
  get: () => ChatState,
) {
  const room = get().rooms.find((r) => r.id === message.roomId);
  if (!room) return;
  const preview = message.type === "text" ? message.content : message.content;
  const updatedRoom: Room = { ...room, lastMessage: preview, lastMessageTime: message.timestamp };
  await saveRoom(updatedRoom);
  set((s) => ({ rooms: s.rooms.map((r) => (r.id === room.id ? updatedRoom : r)) }));
}

/** Encrypts + sends (chunked for files) a message to a set of target peers. */
async function deliverMessage(message: ChatMessage, targets: string[]) {
  const key = await generateSessionKey(message.roomId);

  if (message.type === "text") {
    const cipher = await encryptMessage(message.content, key);
    const wire: WireMessage = {
      kind: "chat",
      roomId: message.roomId,
      fromId: message.senderId,
      payload: { ...message, content: cipher },
    };
    peerManager.broadcast(targets, wire);
    return;
  }

  // File / voice: encrypt the whole base64 payload, then stream it in chunks.
  const raw = message.fileData?.data ?? "";
  const cipherBlob = await encryptMessage(raw, key);
  const chunks = chunkString(cipherBlob, FILE_CHUNK_SIZE);
  const transferId = message.id;

  chunks.forEach((chunk, index) => {
    const payload: ChatChunkPayload = {
      transferId,
      index,
      total: chunks.length,
      data: chunk,
      meta:
        index === 0
          ? {
              id: message.id,
              roomId: message.roomId,
              senderId: message.senderId,
              senderName: message.senderName,
              type: message.type,
              fileName: message.fileData?.name,
              fileMime: message.fileData?.mime,
              fileSize: message.fileData?.size,
              durationSec: message.durationSec,
              replyTo: message.replyTo,
              replyPreview: message.replyPreview,
              forwardedFrom: message.forwardedFrom,
              timestamp: message.timestamp,
            }
          : undefined,
    };
    peerManager.broadcast(targets, { kind: "chat-chunk", roomId: message.roomId, fromId: message.senderId, payload });
  });
}

/** Central inbound-message router - handles every WireKind coming from any peer. */
async function handleIncoming(
  message: WireMessage,
  fromPeerId: string,
  set: (fn: (s: ChatState) => Partial<ChatState>) => void,
  get: () => ChatState,
) {
  if (await isUserBlocked(fromPeerId)) return;

  switch (message.kind) {
    case "hello": {
      const payload = message.payload as HelloPayload;
      const profile: UserProfile = { id: payload.id, displayName: payload.displayName, bio: payload.bio, avatar: payload.avatar };
      await upsertKnownUser(profile);
      set((s) => ({ knownUsers: { ...s.knownUsers, [profile.id]: profile } }));
      // Backfill room display name for direct chats created before we knew their name.
      const directId = directRoomId(currentUserId, payload.id);
      const room = get().rooms.find((r) => r.id === directId);
      if (room && room.name === payload.id) {
        const updated = { ...room, name: payload.displayName, avatar: room.avatar ?? payload.avatar };
        await saveRoom(updated);
        set((s) => ({ rooms: s.rooms.map((r) => (r.id === directId ? updated : r)) }));
      }
      break;
    }

    case "room-invite": {
      const payload = message.payload as RoomInvitePayload;
      const exists = get().rooms.find((r) => r.id === payload.id);
      if (!exists) {
        const room: Room = {
          id: payload.id,
          name: payload.type === "direct" ? get().knownUsers[fromPeerId]?.displayName ?? fromPeerId : payload.name,
          type: payload.type,
          members: payload.members,
          avatar: payload.avatar,
          unreadCount: 0,
          isPinned: false,
          isFavorite: false,
          createdAt: payload.createdAt,
        };
        await saveRoom(room);
        set((s) => ({ rooms: [room, ...s.rooms], messages: { ...s.messages, [room.id]: [] } }));
        payload.members.filter((m) => m !== currentUserId).forEach((m) => peerManager.connectTo(m));
      }
      break;
    }

    case "chat": {
      const incoming = message.payload as ChatMessage;
      const key = await generateSessionKey(incoming.roomId);
      const plain = await decryptMessage(incoming.content, key);
      const finalMessage: ChatMessage = { ...incoming, content: plain, status: "delivered" };
      await ingestIncomingMessage(finalMessage, set, get);
      break;
    }

    case "chat-chunk": {
      const payload = message.payload as ChatChunkPayload;
      set((s) => {
        const t = s.transfers[payload.transferId] ?? { chunks: [], total: payload.total, meta: payload.meta };
        const chunks = [...t.chunks];
        chunks[payload.index] = payload.data;
        const meta = payload.meta ?? t.meta;
        return { transfers: { ...s.transfers, [payload.transferId]: { chunks, total: payload.total, meta } } };
      });

      const transfer = get().transfers[payload.transferId];
      if (transfer && transfer.chunks.filter(Boolean).length === transfer.total && transfer.meta) {
        const cipherBlob = transfer.chunks.join("");
        const key = await generateSessionKey(transfer.meta.roomId);
        const rawData = await decryptMessage(cipherBlob, key);
        const finalMessage: ChatMessage = {
          id: transfer.meta.id,
          roomId: transfer.meta.roomId,
          senderId: transfer.meta.senderId,
          senderName: transfer.meta.senderName,
          content:
            transfer.meta.type === "voice" ? "🎤 Voice message" : `📎 ${transfer.meta.fileName ?? "file"}`,
          type: transfer.meta.type,
          fileData: transfer.meta.fileName
            ? { name: transfer.meta.fileName, size: transfer.meta.fileSize ?? 0, mime: transfer.meta.fileMime ?? "application/octet-stream", data: rawData }
            : undefined,
          durationSec: transfer.meta.durationSec,
          replyTo: transfer.meta.replyTo,
          replyPreview: transfer.meta.replyPreview,
          forwardedFrom: transfer.meta.forwardedFrom,
          reactions: [],
          isEdited: false,
          isDeleted: false,
          isPinned: false,
          readBy: [transfer.meta.senderId],
          timestamp: transfer.meta.timestamp,
          status: "delivered",
        };
        await ingestIncomingMessage(finalMessage, set, get);
        set((s) => {
          const rest = { ...s.transfers };
          delete rest[payload.transferId];
          return { transfers: rest };
        });
      }
      break;
    }

    case "edit": {
      const { messageId, content } = message.payload as { messageId: string; content: string };
      const key = await generateSessionKey(message.roomId!);
      const plain = await decryptMessage(content, key);
      updateLocalMessage(set, message.roomId!, messageId, (m) => ({ ...m, content: plain, isEdited: true }));
      const updated = get().messages[message.roomId!]?.find((m) => m.id === messageId);
      if (updated) await persistMessage(updated);
      break;
    }

    case "delete": {
      const { messageId } = message.payload as { messageId: string };
      updateLocalMessage(set, message.roomId!, messageId, (m) => ({ ...m, isDeleted: true, content: "" }));
      const updated = get().messages[message.roomId!]?.find((m) => m.id === messageId);
      if (updated) await persistMessage(updated);
      break;
    }

    case "reaction": {
      const { messageId, reaction } = message.payload as ReactionPayload;
      updateLocalMessage(set, message.roomId!, messageId, (m) => ({
        ...m,
        reactions: [...m.reactions.filter((r) => r.userId !== reaction.userId), reaction],
      }));
      const updated = get().messages[message.roomId!]?.find((m) => m.id === messageId);
      if (updated) await persistMessage(updated);
      break;
    }

    case "pin": {
      const { messageId, isPinned } = message.payload as { messageId: string; isPinned: boolean };
      updateLocalMessage(set, message.roomId!, messageId, (m) => ({ ...m, isPinned }));
      const updated = get().messages[message.roomId!]?.find((m) => m.id === messageId);
      if (updated) await persistMessage(updated);
      break;
    }

    case "read-receipt": {
      const { messageIds, readerId } = message.payload as ReadReceiptPayload;
      set((s) => ({
        messages: {
          ...s.messages,
          [message.roomId!]: (s.messages[message.roomId!] ?? []).map((m) =>
            messageIds.includes(m.id) && !m.readBy.includes(readerId) ? { ...m, readBy: [...m.readBy, readerId], status: "read" } : m,
          ),
        },
      }));
      break;
    }

    case "typing": {
      const { isTyping } = message.payload as { isTyping: boolean };
      get().setTyping(message.roomId!, fromPeerId, isTyping);
      break;
    }
  }
}

async function ingestIncomingMessage(
  message: ChatMessage,
  set: (fn: (s: ChatState) => Partial<ChatState>) => void,
  get: () => ChatState,
) {
  await persistMessage(message);
  set((s) => {
    const list = s.messages[message.roomId] ?? [];
    if (list.some((m) => m.id === message.id)) return {};
    return { messages: { ...s.messages, [message.roomId]: [...list, message] } };
  });

  const room = get().rooms.find((r) => r.id === message.roomId);
  const isActive = get().currentRoomId === message.roomId;
  if (room) {
    const updatedRoom: Room = {
      ...room,
      lastMessage: message.isDeleted ? "This message was deleted" : message.content,
      lastMessageTime: message.timestamp,
      unreadCount: isActive ? room.unreadCount : room.unreadCount + 1,
    };
    await saveRoom(updatedRoom);
    set((s) => ({ rooms: s.rooms.map((r) => (r.id === room.id ? updatedRoom : r)) }));
  }
}

export { directRoomId };
