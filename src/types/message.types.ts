export type MessageType = "text" | "file" | "voice" | "system";
export type MessageStatus = "pending" | "sending" | "sent" | "delivered" | "read" | "failed";

export interface FileData {
  name: string;
  size: number;
  mime: string;
  data: string; // base64
}

export interface Reaction {
  emoji: string;
  userId: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName?: string;
  content: string; // plaintext (decrypted) representation used in the UI layer
  type: MessageType;
  fileData?: FileData;
  durationSec?: number; // for voice messages
  replyTo?: string; // id of message being replied to
  replyPreview?: string; // cached snippet of the original message text
  forwardedFrom?: string; // display name of the original sender
  reactions: Reaction[];
  isEdited: boolean;
  isDeleted: boolean;
  isPinned: boolean;
  readBy: string[];
  timestamp: number;
  status: MessageStatus;
}
