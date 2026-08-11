import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, Pin, X } from "lucide-react";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { MessageInput } from "@/components/chat/MessageInput";
import { useChatStore } from "@/store/chatStore";
import { useUserStore } from "@/store/userStore";
import { formatDayLabel } from "@/lib/utils/date";
import type { Room } from "@/types/room.types";

interface ChatWindowProps {
  room: Room;
}

export function ChatWindow({ room }: ChatWindowProps) {
  const messages = useChatStore((s) => s.messages[room.id] ?? []);
  const markRoomRead = useChatStore((s) => s.markRoomRead);
  const togglePinMessage = useChatStore((s) => s.togglePinMessage);
  const myId = useUserStore((s) => s.currentUser?.id ?? "");

  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [headerOpacity, setHeaderOpacity] = useState(1);
  const [showPinnedBanner, setShowPinnedBanner] = useState(true);

  const visibleMessages = useMemo(() => messages.filter((m) => !!m), [messages]);
  const pinnedMessages = useMemo(() => visibleMessages.filter((m) => m.isPinned && !m.isDeleted), [visibleMessages]);

  useEffect(() => {
    markRoomRead(room.id);
    setShowPinnedBanner(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    markRoomRead(room.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBtn(distanceFromBottom > 300);
    // Subtle parallax fade on the chat header while scrolling.
    const fade = Math.max(0.4, 1 - el.scrollTop / 400);
    setHeaderOpacity(fade);
  }

  let lastDay = "";

  return (
    <div className="flex h-full flex-1 flex-col bg-[#F2F2F7] dark:bg-black">
      <div style={{ opacity: headerOpacity }} className="transition-opacity duration-200">
        <ChatHeader room={room} />
      </div>

      {pinnedMessages.length > 0 && showPinnedBanner && (
        <div className="flex items-center gap-2 border-b border-black/5 dark:border-white/10 bg-[#FFF7DE] dark:bg-[#2C2A1E] px-4 py-2 text-[13px]">
          <Pin size={14} className="shrink-0 text-[#B8860B]" />
          <span className="truncate text-[#8A6D1D] dark:text-[#E5C979]">
            <b>Pinned:</b> {pinnedMessages[pinnedMessages.length - 1].content || "Attachment"}
          </span>
          <button
            onClick={() => togglePinMessage(room.id, pinnedMessages[pinnedMessages.length - 1].id)}
            className="ml-auto shrink-0 text-[#8A6D1D] dark:text-[#E5C979] hover:underline"
          >
            Unpin
          </button>
          <button onClick={() => setShowPinnedBanner(false)} className="shrink-0 text-[#8A6D1D] dark:text-[#E5C979]">
            <X size={14} />
          </button>
        </div>
      )}

      <div ref={scrollRef} onScroll={handleScroll} className="relative flex-1 space-y-1.5 overflow-y-auto px-4 py-4">
        {visibleMessages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center text-sm text-[#8E8E93]">
            <p className="mb-1 text-base font-medium text-black/70 dark:text-white/70">No messages yet</p>
            <p>Say hello — your conversation is end-to-end encrypted.</p>
          </div>
        )}

        {visibleMessages.map((message, idx) => {
          const dayLabel = formatDayLabel(message.timestamp);
          const showDaySeparator = dayLabel !== lastDay;
          lastDay = dayLabel;
          const prevMsg = visibleMessages[idx - 1];
          const showSender = !prevMsg || prevMsg.senderId !== message.senderId;

          return (
            <div key={message.id}>
              {showDaySeparator && (
                <div className="my-3 flex justify-center">
                  <span className="rounded-full bg-black/5 dark:bg-white/10 px-3 py-1 text-[11px] font-medium text-[#8E8E93]">
                    {dayLabel}
                  </span>
                </div>
              )}
              <MessageBubble message={message} isMine={message.senderId === myId} showSender={showSender} room={room} />
            </div>
          );
        })}
        <div ref={bottomRef} />

        {showScrollBtn && (
          <button
            onClick={() => bottomRef.current?.scrollIntoView({ behavior: "smooth" })}
            className="sticky bottom-2 left-full flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-[#2C2C2E] text-[#007AFF] dark:text-[#0A84FF] shadow-lg ring-1 ring-black/5 transition-transform hover:scale-105"
          >
            <ArrowDown size={18} />
          </button>
        )}
      </div>

      <MessageInput roomId={room.id} />
    </div>
  );
}
