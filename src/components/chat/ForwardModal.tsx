import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { useChatStore } from "@/store/chatStore";
import { useUIStore } from "@/store/uiStore";
import { cn } from "@/utils/cn";

export function ForwardModal() {
  const forwardingMessage = useUIStore((s) => s.forwardingMessage);
  const setForwardingMessage = useUIStore((s) => s.setForwardingMessage);
  const showToast = useUIStore((s) => s.showToast);
  const rooms = useChatStore((s) => s.rooms);
  const forwardMessage = useChatStore((s) => s.forwardMessage);
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]));
  }

  async function handleForward() {
    if (!forwardingMessage || selected.length === 0) return;
    await forwardMessage(forwardingMessage, selected);
    showToast(`Forwarded to ${selected.length} chat${selected.length > 1 ? "s" : ""}`, "success");
    setForwardingMessage(null);
    setSelected([]);
  }

  return (
    <Modal open={!!forwardingMessage} onClose={() => setForwardingMessage(null)} title="Forward Message">
      <div className="max-h-80 space-y-1 overflow-y-auto">
        {rooms.map((room) => (
          <button
            key={room.id}
            onClick={() => toggle(room.id)}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
              selected.includes(room.id) ? "bg-[#007AFF]/10" : "hover:bg-black/5 dark:hover:bg-white/5",
            )}
          >
            <Avatar name={room.name} src={room.avatar} size={38} />
            <span className="flex-1 truncate text-[14px] font-medium text-black dark:text-white">{room.name}</span>
            <div
              className={cn(
                "h-5 w-5 rounded-full border-2",
                selected.includes(room.id) ? "border-[#007AFF] bg-[#007AFF]" : "border-black/20 dark:border-white/20",
              )}
            />
          </button>
        ))}
      </div>
      <Button className="mt-4 w-full" size="lg" disabled={selected.length === 0} onClick={handleForward}>
        Forward
      </Button>
    </Modal>
  );
}
