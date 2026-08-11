import { ArrowLeft, Lock, Phone, Video, MoreVertical, UserX, Bookmark } from "lucide-react";
import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { useChatStore } from "@/store/chatStore";
import { useUIStore } from "@/store/uiStore";
import { useUserStore } from "@/store/userStore";
import { blockUser } from "@/lib/db/blocklist";
import { startOutgoingCall } from "@/lib/webrtc/callActions";
import { formatLastSeen } from "@/lib/utils/date";
import type { Room } from "@/types/room.types";

interface ChatHeaderProps {
  room: Room;
}

export function ChatHeader({ room }: ChatHeaderProps) {
  const setMobileShowChat = useUIStore((s) => s.setMobileShowChat);
  const showToast = useUIStore((s) => s.showToast);
  const onlineStatus = useChatStore((s) => s.onlineStatus);
  const typingUsers = useChatStore((s) => s.typingUsers);
  const myId = useUserStore((s) => s.currentUser?.id ?? "");
  const [menuOpen, setMenuOpen] = useState(false);

  const otherId = room.members.find((m) => m !== myId);
  const isOnline = otherId ? !!onlineStatus[otherId] : false;
  const isTyping = (typingUsers[room.id] ?? []).length > 0;
  const isSaved = room.type === "saved";

  async function handleCall(type: "audio" | "video") {
    if (!otherId) return;
    try {
      await startOutgoingCall(otherId, room.name, type);
    } catch {
      showToast("Could not access camera/microphone.", "error");
    }
  }

  async function handleBlock() {
    if (!otherId) return;
    await blockUser(otherId, room.name);
    showToast(`${room.name} has been blocked.`, "success");
    setMenuOpen(false);
  }

  return (
    <div className="flex items-center gap-3 border-b border-black/5 dark:border-white/10 bg-white/80 dark:bg-[#0F0F10]/80 backdrop-blur-xl px-4 py-3 transition-all duration-200">
      <button onClick={() => setMobileShowChat(false)} className="text-[#007AFF] dark:text-[#0A84FF] md:hidden">
        <ArrowLeft size={22} />
      </button>

      {isSaved ? (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#007AFF] to-[#5856D6] text-white">
          <Bookmark size={18} fill="white" />
        </div>
      ) : (
        <Avatar name={room.name} src={room.avatar} size={40} online={room.type === "direct" ? isOnline : undefined} />
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold text-black dark:text-white">{room.name}</p>
        <div className="flex items-center gap-1 text-[12px] text-[#8E8E93]">
          <Lock size={10} className="text-[#34C759]" />
          <span>
            {isTyping
              ? "typing…"
              : isSaved
                ? "End-to-End Encrypted · Only visible to you"
                : room.type === "group"
                  ? `${room.members.length} members · End-to-End Encrypted`
                  : isOnline
                    ? "Online · End-to-End Encrypted"
                    : `${formatLastSeen(undefined)} · End-to-End Encrypted`}
          </span>
        </div>
      </div>

      {!isSaved && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleCall("audio")}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#007AFF] dark:text-[#0A84FF] transition-colors hover:bg-black/5 dark:hover:bg-white/10"
          >
            <Phone size={19} />
          </button>
          <button
            onClick={() => handleCall("video")}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#007AFF] dark:text-[#0A84FF] transition-colors hover:bg-black/5 dark:hover:bg-white/10"
          >
            <Video size={20} />
          </button>
          {room.type === "direct" && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-[#8E8E93] transition-colors hover:bg-black/5 dark:hover:bg-white/10"
              >
                <MoreVertical size={19} />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-11 z-20 w-48 overflow-hidden rounded-2xl bg-white dark:bg-[#2C2C2E] py-1.5 shadow-2xl ring-1 ring-black/5">
                    <button
                      onClick={handleBlock}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-[#FF3B30] hover:bg-black/5 dark:hover:bg-white/10"
                    >
                      <UserX size={16} /> Block User
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
