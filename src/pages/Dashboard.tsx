import { useEffect } from "react";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { EmptyState } from "@/components/chat/EmptyState";
import { NewChatModal } from "@/components/sidebar/NewChatModal";
import { NewGroupModal } from "@/components/sidebar/NewGroupModal";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { ForwardModal } from "@/components/chat/ForwardModal";
import { ContextMenu } from "@/components/chat/ContextMenu";
import { CallView } from "@/components/call/CallView";
import { OfflineBanner } from "@/components/OfflineBanner";
import { Toast } from "@/components/ui/Toast";
import { useChatStore } from "@/store/chatStore";
import { useUIStore } from "@/store/uiStore";
import { usePeer } from "@/hooks/usePeer";
import { cn } from "@/utils/cn";

export function Dashboard() {
  usePeer();
  const rooms = useChatStore((s) => s.rooms);
  const currentRoomId = useChatStore((s) => s.currentRoomId);
  const setCurrentRoom = useChatStore((s) => s.setCurrentRoom);
  const mobileShowChat = useUIStore((s) => s.mobileShowChat);

  const currentRoom = rooms.find((r) => r.id === currentRoomId);

  useEffect(() => {
    if (!currentRoomId && rooms.length > 0 && window.innerWidth >= 768) {
      const saved = rooms.find((r) => r.type === "saved");
      if (saved) setCurrentRoom(saved.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rooms.length]);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#F2F2F7] dark:bg-black">
      <OfflineBanner />
      <div className="flex min-h-0 flex-1">
        <div
          className={cn(
            "w-full shrink-0 border-r border-black/5 dark:border-white/10 md:block md:w-[340px] lg:w-[380px]",
            mobileShowChat ? "hidden" : "block",
          )}
        >
          <Sidebar />
        </div>
        <div className={cn("min-w-0 flex-1", mobileShowChat ? "block" : "hidden md:block")}>
          {currentRoom ? <ChatWindow key={currentRoom.id} room={currentRoom} /> : <EmptyState />}
        </div>
      </div>

      <NewChatModal />
      <NewGroupModal />
      <SettingsModal />
      <ForwardModal />
      <ContextMenu />
      <CallView />
      <Toast />
    </div>
  );
}
