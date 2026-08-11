import { useRef } from "react";
import { Check, CheckCheck, Clock, FileText, Pin, Reply as ReplyIcon, AlertCircle } from "lucide-react";
import { cn } from "@/utils/cn";
import { formatTime, formatDuration } from "@/lib/utils/date";
import { formatFileSize, isImageMime } from "@/lib/utils/file";
import { useUIStore } from "@/store/uiStore";
import { useUserStore } from "@/store/userStore";
import type { ChatMessage } from "@/types/message.types";
import type { Room } from "@/types/room.types";

interface MessageBubbleProps {
  message: ChatMessage;
  isMine: boolean;
  showSender: boolean;
  room: Room;
}

export function MessageBubble({ message, isMine, showSender, room }: MessageBubbleProps) {
  const openContextMenu = useUIStore((s) => s.openContextMenu);
  const myId = useUserStore((s) => s.currentUser?.id);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleContextMenu(e: React.MouseEvent) {
    e.preventDefault();
    openContextMenu({ message, x: e.clientX, y: e.clientY });
  }

  function handleTouchStart(e: React.TouchEvent) {
    const touch = e.touches[0];
    longPressTimer.current = setTimeout(() => {
      openContextMenu({ message, x: touch.clientX, y: touch.clientY });
    }, 450);
  }

  function clearLongPress() {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  }

  const otherReadCount = message.readBy.filter((id) => id !== myId && id !== message.senderId).length;
  const isRead = isMine && (room.type === "group" ? otherReadCount > 0 : message.readBy.some((id) => id !== message.senderId));

  const reactionGroups = message.reactions.reduce<Record<string, number>>((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div
      className={cn("flex animate-[bubbleIn_0.25s_cubic-bezier(0.34,1.56,0.64,1)]", isMine ? "justify-end" : "justify-start")}
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
      onTouchEnd={clearLongPress}
      onTouchMove={clearLongPress}
    >
      <div className={cn("group relative max-w-[75%] sm:max-w-[65%]")}>
        <div
          className={cn(
            "relative px-3.5 py-2 shadow-sm",
            isMine
              ? "bg-[#34C759] dark:bg-[#30D158] text-white rounded-2xl rounded-br-md"
              : "bg-[#E5E5EA] dark:bg-[#1C1C1E] text-black dark:text-white rounded-2xl rounded-bl-md",
          )}
        >
          {message.isPinned && (
            <Pin size={11} className={cn("absolute -top-1.5 right-2", isMine ? "text-white" : "text-[#007AFF]")} fill="currentColor" />
          )}

          {showSender && !isMine && room.type === "group" && (
            <p className="mb-0.5 text-[12.5px] font-semibold" style={{ color: "#007AFF" }}>
              {message.senderName || message.senderId.slice(0, 8)}
            </p>
          )}

          {message.forwardedFrom && (
            <p className={cn("mb-1 flex items-center gap-1 text-[11.5px] italic opacity-80")}>
              ➜ Forwarded from {message.forwardedFrom}
            </p>
          )}

          {message.replyTo && (
            <div
              className={cn(
                "mb-1.5 rounded-lg border-l-2 px-2 py-1 text-[12.5px] opacity-90",
                isMine ? "border-white/60 bg-white/15" : "border-[#007AFF] bg-black/5 dark:bg-white/10",
              )}
            >
              <div className="flex items-center gap-1 font-medium">
                <ReplyIcon size={11} /> Reply
              </div>
              <p className="truncate opacity-80">{message.replyPreview || "Message"}</p>
            </div>
          )}

          {message.isDeleted ? (
            <p className="flex items-center gap-1.5 text-[14px] italic opacity-70">
              <AlertCircle size={14} /> This message was deleted
            </p>
          ) : (
            <MessageContent message={message} isMine={isMine} />
          )}

          <div className={cn("mt-1 flex items-center justify-end gap-1 text-[10.5px]", isMine ? "text-white/80" : "text-[#8E8E93]")}>
            {message.isEdited && <span className="italic">edited</span>}
            <span>{formatTime(message.timestamp)}</span>
            {isMine && <MessageStatusIcon status={message.status} isRead={isRead} />}
          </div>
        </div>

        {Object.keys(reactionGroups).length > 0 && (
          <div className={cn("mt-1 flex flex-wrap gap-1", isMine ? "justify-end" : "justify-start")}>
            {Object.entries(reactionGroups).map(([emoji, count]) => (
              <span
                key={emoji}
                className="flex items-center gap-1 rounded-full bg-white dark:bg-[#2C2C2E] px-2 py-0.5 text-[12px] shadow ring-1 ring-black/5"
              >
                {emoji} {count > 1 && count}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MessageStatusIcon({ status, isRead }: { status: ChatMessage["status"]; isRead: boolean }) {
  if (isRead) return <CheckCheck size={14} className="text-[#0A84FF] dark:text-[#0A84FF]" />;
  if (status === "pending" || status === "sending") return <Clock size={12} />;
  if (status === "delivered" || status === "sent") return <Check size={14} />;
  if (status === "failed") return <AlertCircle size={12} className="text-red-200" />;
  return <Check size={14} />;
}

function MessageContent({ message, isMine }: { message: ChatMessage; isMine: boolean }) {
  if (message.type === "voice" && message.fileData) {
    return (
      <div className="flex min-w-[200px] items-center gap-2 py-1">
        <audio controls src={message.fileData.data} className="h-9 w-full max-w-[220px]" />
        {message.durationSec !== undefined && (
          <span className={cn("text-[11px]", isMine ? "text-white/80" : "text-[#8E8E93]")}>
            {formatDuration(message.durationSec)}
          </span>
        )}
      </div>
    );
  }

  if (message.type === "file" && message.fileData) {
    if (isImageMime(message.fileData.mime)) {
      return (
        <a href={message.fileData.data} target="_blank" rel="noreferrer">
          <img
            src={message.fileData.data}
            alt={message.fileData.name}
            className="max-h-72 max-w-full rounded-xl object-cover"
          />
        </a>
      );
    }
    return (
      <a
        href={message.fileData.data}
        download={message.fileData.name}
        className={cn(
          "flex items-center gap-3 rounded-xl px-2 py-2",
          isMine ? "bg-white/15" : "bg-black/5 dark:bg-white/10",
        )}
      >
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", isMine ? "bg-white/20" : "bg-[#007AFF]/15")}>
          <FileText size={18} className={isMine ? "text-white" : "text-[#007AFF]"} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[13.5px] font-medium">{message.fileData.name}</p>
          <p className={cn("text-[11px]", isMine ? "text-white/80" : "text-[#8E8E93]")}>
            {formatFileSize(message.fileData.size)}
          </p>
        </div>
      </a>
    );
  }

  return <p className="whitespace-pre-wrap break-words text-[15px] leading-snug">{message.content}</p>;
}
