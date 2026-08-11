export type CallType = "audio" | "video";
export type CallStatus = "idle" | "calling" | "ringing" | "connected" | "ended";

export interface CallSignalPayload {
  callType: CallType;
  roomId?: string;
}

export type VideoQuality = "360p" | "480p" | "720p" | "1080p";

export const VIDEO_QUALITY_CONSTRAINTS: Record<VideoQuality, { width: number; height: number }> = {
  "360p": { width: 640, height: 360 },
  "480p": { width: 854, height: 480 },
  "720p": { width: 1280, height: 720 },
  "1080p": { width: 1920, height: 1080 },
};
