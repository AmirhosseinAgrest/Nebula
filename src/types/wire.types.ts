import type { ChatMessage, Reaction } from "@/types/message.types";

// The "wire protocol" spoken between peers over the WebRTC DataChannel.
export type WireKind =
  | "hello" // profile exchange on connect
  | "room-invite" // notify a peer that a direct/group room now includes them
  | "chat" // a new / forwarded message (already E2EE encrypted content)
  | "chat-chunk" // large file/voice payload streamed in chunks
  | "edit"
  | "delete"
  | "reaction"
  | "read-receipt"
  | "typing"
  | "pin";

export interface HelloPayload {
  id: string;
  displayName: string;
  bio?: string;
  avatar?: string;
}

export interface ChatChunkPayload {
  transferId: string;
  index: number;
  total: number;
  data: string; // base64 chunk (already AES-GCM encrypted as a whole before chunking)
  meta?: {
    id: string;
    roomId: string;
    senderId: string;
    senderName?: string;
    type: ChatMessage["type"];
    fileName?: string;
    fileMime?: string;
    fileSize?: number;
    durationSec?: number;
    replyTo?: string;
    replyPreview?: string;
    forwardedFrom?: string;
    timestamp: number;
  };
}

export interface WireMessage {
  kind: WireKind;
  roomId?: string;
  payload: any;
  fromId: string;
}

export interface ReactionPayload {
  messageId: string;
  reaction: Reaction;
}

export interface ReadReceiptPayload {
  roomId: string;
  messageIds: string[];
  readerId: string;
}

export interface RoomInvitePayload {
  id: string;
  name: string;
  type: "direct" | "group";
  members: string[];
  avatar?: string;
  createdAt: number;
}
