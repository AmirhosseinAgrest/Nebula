import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useChatStore } from "@/store/chatStore";
import { useUIStore } from "@/store/uiStore";
import { useUserStore } from "@/store/userStore";
import { isValidPeerId } from "@/lib/utils/validation";
import { Copy, Check } from "lucide-react";

export function NewChatModal() {
  const open = useUIStore((s) => s.showNewChat);
  const setOpen = useUIStore((s) => s.setShowNewChat);
  const showToast = useUIStore((s) => s.showToast);
  const createDirectRoom = useChatStore((s) => s.createDirectRoom);
  const setCurrentRoom = useChatStore((s) => s.setCurrentRoom);
  const setMobileShowChat = useUIStore((s) => s.setMobileShowChat);
  const myId = useUserStore((s) => s.currentUser?.id ?? "");
  const [peerId, setPeerId] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleStart() {
    const id = peerId.trim();
    if (!isValidPeerId(id)) {
      showToast("Please enter a valid Peer ID.", "error");
      return;
    }
    if (id === myId) {
      showToast("You can't start a chat with yourself here — use Saved Messages instead.", "error");
      return;
    }
    const room = await createDirectRoom(id);
    setCurrentRoom(room.id);
    setMobileShowChat(true);
    setOpen(false);
    setPeerId("");
  }

  function copyMyId() {
    navigator.clipboard.writeText(myId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Modal open={open} onClose={() => setOpen(false)} title="New Chat">
      <div className="space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-black dark:text-white">Your Peer ID</label>
          <div className="flex items-center gap-2 rounded-xl bg-[#F2F2F7] dark:bg-[#2C2C2E] px-4 py-3">
            <span className="flex-1 truncate font-mono text-xs text-[#8E8E93]">{myId}</span>
            <button onClick={copyMyId} className="text-[#007AFF] dark:text-[#0A84FF]">
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
          <p className="mt-1.5 text-xs text-[#8E8E93]">Share this ID with a friend so they can start a chat with you.</p>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-black dark:text-white">Contact's Peer ID</label>
          <Input
            value={peerId}
            onChange={(e) => setPeerId(e.target.value)}
            placeholder="Paste the Peer ID you received"
          />
        </div>

        <Button className="w-full" size="lg" onClick={handleStart}>
          Start Encrypted Chat
        </Button>
      </div>
    </Modal>
  );
}
