import { useEffect, useRef } from "react";
import { peerManager } from "@/lib/webrtc/peerManager";
import { useChatStore } from "@/store/chatStore";
import { useUserStore } from "@/store/userStore";
import { useCallStore } from "@/store/callStore";
import type { CallSignalPayload } from "@/types/call.types";

/**
 * Boots the PeerJS connection for the logged-in user and wires global
 * side-effects (incoming calls) once for the lifetime of the app.
 */
export function usePeer() {
  const currentUser = useUserStore((s) => s.currentUser);
  const initChat = useChatStore((s) => s.init);
  const bootstrapped = useRef(false);

  useEffect(() => {
    if (!currentUser || bootstrapped.current) return;
    bootstrapped.current = true;

    peerManager.init(currentUser.id);
    initChat(currentUser);

    peerManager.on("incoming-call", ({ call }) => {
      // Ask the user to accept via a ringing UI - for simplicity we auto-surface
      // the call screen and let CallView handle answer/decline with local media.
      const metadata = call.metadata as CallSignalPayload | undefined;
      useCallStore.getState().startCall({
        status: "ringing",
        callType: metadata?.callType ?? "audio",
        remotePeerId: call.peer,
        activeCall: call,
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);
}
