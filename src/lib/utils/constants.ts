// Global app constants

export const APP_NAME = "Nebula";
export const APP_TAGLINE = "Peer-to-Peer Security, Zero Servers.";
export const GITHUB_URL = "https://github.com/AmirhosseinAgrest/Nebula";

export const MAX_GROUP_MEMBERS = 5;
export const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB
export const MAX_VOICE_DURATION_SEC = 120; // 2 minutes
export const FILE_CHUNK_SIZE = 16 * 1024; // 16 KB per data-channel chunk

export const REACTION_EMOJIS = ["❤️", "👍", "😂", "😮", "😢", "😡"];

export const SAVED_MESSAGES_ID = "saved-messages";

// PeerJS relies on a lightweight public broker purely for WebRTC signaling
// (session handshake only - no chat data or files ever pass through it).
export const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:global.stun.twilio.com:3478" },
];

export const LOCAL_STORAGE_USER_KEY = "p2p-chat-user-id";
