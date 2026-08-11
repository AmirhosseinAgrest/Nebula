// User / identity related types

export interface UserProfile {
  id: string; // Peer ID (UUID) - acts as the user's decentralized identity
  displayName: string;
  bio?: string;
  avatar?: string; // base64 data URL
  isOnline?: boolean;
  lastSeen?: number;
}

export interface Settings {
  id: string; // always "local"
  userId: string;
  displayName: string;
  bio?: string;
  avatar?: string;
  darkMode: boolean;
  readReceipts: boolean;
  showOnlineStatus: boolean;
  fontSize: "small" | "medium" | "large";
}

export interface BlockedUser {
  userId: string;
  displayName?: string;
  blockedAt: number;
}
