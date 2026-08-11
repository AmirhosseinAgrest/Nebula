import { useEffect, useRef } from "react";
import { Copy, Forward, Pin, PinOff, Reply, Trash2 } from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { useChatStore } from "@/store/chatStore";
import { useUserStore } from "@/store/userStore";
import { REACTION_EMOJIS } from "@/lib/utils/constants";

export function ContextMenu() {
  const contextMenu = useUIStore((s) => s.contextMenu);
  const closeContextMenu = useUIStore((s) => s.closeContextMenu);
  const setReplyingTo = useUIStore((s) => s.setReplyingTo);
  const setForwardingMessage = useUIStore((s) => s.setForwardingMessage);
  const showToast = useUIStore((s) => s.showToast);
  const addReaction = useChatStore((s) => s.addReaction);
  const deleteMessage = useChatStore((s) => s.deleteMessage);
  const togglePinMessage = useChatStore((s) => s.togglePinMessage);
  const myId = useUserStore((s) => s.currentUser?.id);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) closeContextMenu();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [closeContextMenu]);

  if (!contextMenu) return null;
  const { message, x, y } = contextMenu;
  const isMine = message.senderId === myId;

  const style: React.CSSProperties = {
    left: Math.min(x, window.innerWidth - 260),
    top: Math.min(y, window.innerHeight - 340),
  };

  return (
    <div
      ref={ref}
      style={style}
      className="fixed z-50 w-60 overflow-hidden rounded-2xl bg-white/95 dark:bg-[#2C2C2E]/95 backdrop-blur-xl shadow-2xl ring-1 ring-black/5 animate-[scaleIn_0.15s_ease-in-out]"
    >
      <div className="flex justify-around border-b border-black/5 dark:border-white/10 px-2 py-2.5">
        {REACTION_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => {
              addReaction(message.roomId, message.id, emoji);
              closeContextMenu();
            }}
            className="text-xl transition-transform hover:scale-125"
          >
            {emoji}
          </button>
        ))}
      </div>
      <MenuItem
        icon={<Reply size={17} />}
        label="Reply"
        onClick={() => {
          setReplyingTo(message);
          closeContextMenu();
        }}
      />
      <MenuItem
        icon={<Forward size={17} />}
        label="Forward"
        onClick={() => {
          setForwardingMessage(message);
          closeContextMenu();
        }}
      />
      <MenuItem
        icon={message.isPinned ? <PinOff size={17} /> : <Pin size={17} />}
        label={message.isPinned ? "Unpin" : "Pin"}
        onClick={() => {
          togglePinMessage(message.roomId, message.id);
          closeContextMenu();
        }}
      />
      {message.type === "text" && !message.isDeleted && (
        <MenuItem
          icon={<Copy size={17} />}
          label="Copy"
          onClick={() => {
            navigator.clipboard.writeText(message.content);
            showToast("Copied to clipboard", "success");
            closeContextMenu();
          }}
        />
      )}
      {isMine && !message.isDeleted && (
        <MenuItem
          icon={<Trash2 size={17} />}
          label="Delete for Everyone"
          danger
          onClick={() => {
            deleteMessage(message.roomId, message.id);
            closeContextMenu();
          }}
        />
      )}
    </div>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-[14px] transition-colors hover:bg-black/5 dark:hover:bg-white/10 ${
        danger ? "text-[#FF3B30]" : "text-black dark:text-white"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
