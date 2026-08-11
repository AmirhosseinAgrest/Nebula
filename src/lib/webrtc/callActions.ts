import { peerManager } from "@/lib/webrtc/peerManager";
import { useCallStore } from "@/store/callStore";
import { VIDEO_QUALITY_CONSTRAINTS, type CallType, type VideoQuality } from "@/types/call.types";

async function getMedia(type: CallType, quality: VideoQuality): Promise<MediaStream> {
  const constraints: MediaStreamConstraints = {
    audio: true,
    video:
      type === "video"
        ? {
            width: { ideal: VIDEO_QUALITY_CONSTRAINTS[quality].width },
            height: { ideal: VIDEO_QUALITY_CONSTRAINTS[quality].height },
          }
        : false,
  };
  return navigator.mediaDevices.getUserMedia(constraints);
}

export async function startOutgoingCall(peerId: string, remoteName: string, type: CallType) {
  const store = useCallStore.getState();
  const localStream = await getMedia(type, store.videoQuality);

  const call = peerManager.callPeer(peerId, localStream);
  if (!call) throw new Error("Unable to place call - PeerJS not ready.");

  useCallStore.getState().startCall({
    callType: type,
    status: "calling",
    remotePeerId: peerId,
    remoteName,
    localStream,
    activeCall: call,
  });

  call.on("stream", (remoteStream) => {
    useCallStore.getState().setRemoteStream(remoteStream);
  });
  call.on("close", () => useCallStore.getState().endCall());
  call.on("error", () => useCallStore.getState().endCall());
}

export async function answerIncomingCall(remoteName: string) {
  const { activeCall, callType, videoQuality } = useCallStore.getState();
  if (!activeCall || !callType) return;

  const localStream = await getMedia(callType, videoQuality);
  activeCall.answer(localStream);

  useCallStore.setState({ localStream, remoteName, status: "connected" });

  activeCall.on("stream", (remoteStream) => {
    useCallStore.getState().setRemoteStream(remoteStream);
  });
  activeCall.on("close", () => useCallStore.getState().endCall());
}

export function declineIncomingCall() {
  const { activeCall } = useCallStore.getState();
  activeCall?.close();
  useCallStore.getState().endCall();
}

export async function applyVideoQuality(quality: VideoQuality) {
  const { localStream } = useCallStore.getState();
  useCallStore.getState().setVideoQuality(quality);
  const track = localStream?.getVideoTracks()[0];
  if (track) {
    await track.applyConstraints({
      width: { ideal: VIDEO_QUALITY_CONSTRAINTS[quality].width },
      height: { ideal: VIDEO_QUALITY_CONSTRAINTS[quality].height },
    });
  }
}
