import { Bookmark, Pin } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/utils/cn";
import { formatTime } from "@/lib/utils/date";
import type { Room } from "@/types/room.types";

interface ChatItemProps {
  room: Room;
  active: boolean;
  online: boolean;
  onClick: () => void;
}

export function ChatItem({ room, active, online, onClick }: ChatItemProps) {
  const isSaved = room.type === "saved";
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-all duration-200 ease-in-out",
        active ? "bg-[#007AFF]/10 dark:bg-[#0A84FF]/15" : "hover:bg-black/[0.03] dark:hover:bg-white/[0.05]",
      )}
    >
      {isSaved ? (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#007AFF] to-[#5856D6] text-white shadow-sm">
          <Bookmark size={20} fill="white" />
        </div>
      ) : (
        <Avatar name={room.name} src={room.avatar} size={44} online={room.type === "direct" ? online : undefined} />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 truncate">
            {room.isPinned && <Pin size={12} className="shrink-0 text-[#8E8E93]" />}
            <span className="truncate text-[15px] font-semibold text-black dark:text-white">{room.name}</span>
          </div>
          {room.lastMessageTime && (
            <span className="shrink-0 text-[11px] text-[#8E8E93]">{formatTime(room.lastMessageTime)}</span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-[13px] text-[#8E8E93]">{room.lastMessage || "No messages yet"}</p>
          {room.unreadCount > 0 && (
            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[#007AFF] dark:bg-[#0A84FF] px-1.5 text-[11px] font-semibold text-white">
              {room.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
