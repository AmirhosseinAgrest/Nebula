import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, PhoneOff, Video, VideoOff, Settings2 } from "lucide-react";
import { useCallStore } from "@/store/callStore";
import { Avatar } from "@/components/ui/Avatar";
import { answerIncomingCall, applyVideoQuality, declineIncomingCall } from "@/lib/webrtc/callActions";
import type { VideoQuality } from "@/types/call.types";
import { cn } from "@/utils/cn";

const QUALITIES: VideoQuality[] = ["360p", "480p", "720p", "1080p"];

export function CallView() {
  const call = useCallStore();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const [duration, setDuration] = useState(0);
  const [showQuality, setShowQuality] = useState(false);

  useEffect(() => {
    if (localVideoRef.current && call.localStream) localVideoRef.current.srcObject = call.localStream;
  }, [call.localStream]);

  useEffect(() => {
    if (call.callType === "video" && remoteVideoRef.current && call.remoteStream) {
      remoteVideoRef.current.srcObject = call.remoteStream;
    }
    if (call.callType === "audio" && remoteAudioRef.current && call.remoteStream) {
      remoteAudioRef.current.srcObject = call.remoteStream;
    }
  }, [call.remoteStream, call.callType]);

  useEffect(() => {
    if (call.status !== "connected") {
      setDuration(0);
      return;
    }
    const interval = setInterval(() => setDuration((d) => d + 1), 1000);
    return () => clearInterval(interval);
  }, [call.status]);

  if (!call.isCallActive) return null;

  const mins = Math.floor(duration / 60);
  const secs = duration % 60;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-gradient-to-b from-[#1c1c1e] to-black animate-[fadeIn_0.25s_ease-in-out]">
      {call.callType === "video" && call.remoteStream ? (
        <video ref={remoteVideoRef} autoPlay playsInline className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <Avatar name={call.remoteName ?? "?"} size={140} />
          <h2 className="text-2xl font-semibold text-white">{call.remoteName}</h2>
          <p className="text-white/60">
            {call.status === "calling" && "Calling…"}
            {call.status === "ringing" && "Incoming call…"}
            {call.status === "connected" && `${mins}:${secs.toString().padStart(2, "0")}`}
          </p>
        </div>
      )}

      <audio ref={remoteAudioRef} autoPlay />

      {call.callType === "video" && call.localStream && (
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="absolute right-5 top-5 h-40 w-28 rounded-2xl object-cover shadow-2xl ring-2 ring-white/20"
        />
      )}

      {call.callType === "video" && call.remoteStream && (
        <div className="absolute left-5 top-5 rounded-xl bg-black/40 px-3 py-1.5 text-sm text-white backdrop-blur">
          {call.remoteName} · {mins}:{secs.toString().padStart(2, "0")}
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center gap-6 pb-12 pt-6">
        {call.status === "ringing" ? (
          <div className="flex items-center gap-8">
            <button
              onClick={declineIncomingCall}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FF3B30] text-white shadow-lg transition-transform active:scale-90"
            >
              <PhoneOff size={26} />
            </button>
            <button
              onClick={() => answerIncomingCall(call.remoteName ?? "Contact")}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-[#34C759] text-white shadow-lg transition-transform active:scale-90"
            >
              <Video size={26} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-5">
            <ControlButton active={call.isMuted} onClick={call.toggleMute} icon={call.isMuted ? <MicOff size={20} /> : <Mic size={20} />} />
            {call.callType === "video" && (
              <ControlButton
                active={call.isCameraOff}
                onClick={call.toggleCamera}
                icon={call.isCameraOff ? <VideoOff size={20} /> : <Video size={20} />}
              />
            )}
            {call.callType === "video" && (
              <div className="relative">
                <ControlButton active={showQuality} onClick={() => setShowQuality((v) => !v)} icon={<Settings2 size={20} />} />
                {showQuality && (
                  <div className="absolute bottom-16 left-1/2 w-32 -translate-x-1/2 overflow-hidden rounded-xl bg-white/95 shadow-xl">
                    {QUALITIES.map((q) => (
                      <button
                        key={q}
                        onClick={() => {
                          applyVideoQuality(q);
                          setShowQuality(false);
                        }}
                        className={cn(
                          "block w-full px-4 py-2 text-left text-sm",
                          call.videoQuality === q ? "bg-[#007AFF] text-white" : "text-black hover:bg-black/5",
                        )}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <button
              onClick={call.endCall}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FF3B30] text-white shadow-lg transition-transform active:scale-90"
            >
              <PhoneOff size={26} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ControlButton({ icon, active, onClick }: { icon: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-all duration-200 active:scale-90",
        active ? "bg-white text-black" : "bg-white/20 backdrop-blur",
      )}
    >
      {icon}
    </button>
  );
}
