import { create } from "zustand";
import type { CallStatus, CallType, VideoQuality } from "@/types/call.types";
import type { MediaConnection } from "peerjs";

interface CallState {
  isCallActive: boolean;
  callType: CallType | null;
  status: CallStatus;
  remotePeerId: string | null;
  remoteName: string | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  activeCall: MediaConnection | null;
  videoQuality: VideoQuality;
  isMuted: boolean;
  isCameraOff: boolean;
  startCall: (data: Partial<CallState>) => void;
  setRemoteStream: (stream: MediaStream) => void;
  setStatus: (status: CallStatus) => void;
  setVideoQuality: (q: VideoQuality) => void;
  toggleMute: () => void;
  toggleCamera: () => void;
  endCall: () => void;
}

export const useCallStore = create<CallState>((set, get) => ({
  isCallActive: false,
  callType: null,
  status: "idle",
  remotePeerId: null,
  remoteName: null,
  localStream: null,
  remoteStream: null,
  activeCall: null,
  videoQuality: "720p",
  isMuted: false,
  isCameraOff: false,
  startCall: (data) => set({ isCallActive: true, status: "calling", ...data }),
  setRemoteStream: (stream) => set({ remoteStream: stream, status: "connected" }),
  setStatus: (status) => set({ status }),
  setVideoQuality: (q) => set({ videoQuality: q }),
  toggleMute: () => {
    const { localStream, isMuted } = get();
    localStream?.getAudioTracks().forEach((t) => (t.enabled = isMuted));
    set({ isMuted: !isMuted });
  },
  toggleCamera: () => {
    const { localStream, isCameraOff } = get();
    localStream?.getVideoTracks().forEach((t) => (t.enabled = isCameraOff));
    set({ isCameraOff: !isCameraOff });
  },
  endCall: () => {
    const { localStream, activeCall } = get();
    localStream?.getTracks().forEach((t) => t.stop());
    activeCall?.close();
    set({
      isCallActive: false,
      callType: null,
      status: "idle",
      remotePeerId: null,
      remoteName: null,
      localStream: null,
      remoteStream: null,
      activeCall: null,
      isMuted: false,
      isCameraOff: false,
    });
  },
}));
