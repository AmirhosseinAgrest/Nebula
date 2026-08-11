export type RoomType = "direct" | "group" | "saved";

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  members: string[]; // peer ids, including self
  avatar?: string;
  lastMessage?: string;
  lastMessageTime?: number;
  unreadCount: number;
  isPinned: boolean;
  isFavorite: boolean;
  createdAt: number;
}
