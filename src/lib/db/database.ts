import Dexie, { type Table } from "dexie";
import type { ChatMessage } from "@/types/message.types";
import type { Room } from "@/types/room.types";
import type { BlockedUser, Settings, UserProfile } from "@/types/user.types";

export interface QueuedMessage {
  id: string;
  roomId: string;
  message: ChatMessage; // fully formed message payload waiting to be delivered
  createdAt: number;
  status: "pending" | "sent" | "failed";
}

/**
 * Local-first database. Every single byte the app needs lives here -
 * there is no remote database anywhere in this architecture.
 */
class NebulaDB extends Dexie {
  messages!: Table<ChatMessage, string>;
  rooms!: Table<Room, string>;
  users!: Table<UserProfile, string>;
  queuedMessages!: Table<QueuedMessage, string>;
  settings!: Table<Settings, string>;
  blockedUsers!: Table<BlockedUser, string>;

  constructor() {
    super("nebula-p2p-chat");
    this.version(1).stores({
      messages: "id, roomId, senderId, timestamp",
      rooms: "id, type, lastMessageTime",
      users: "id",
      queuedMessages: "id, roomId, status, createdAt",
      settings: "id",
      blockedUsers: "userId",
    });
  }
}

export const db = new NebulaDB();
