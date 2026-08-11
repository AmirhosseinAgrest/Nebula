import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useChatStore } from "@/store/chatStore";
import { useUIStore } from "@/store/uiStore";
import { isValidPeerId } from "@/lib/utils/validation";
import { MAX_GROUP_MEMBERS } from "@/lib/utils/constants";

export function NewGroupModal() {
  const open = useUIStore((s) => s.showNewGroup);
  const setOpen = useUIStore((s) => s.setShowNewGroup);
  const showToast = useUIStore((s) => s.showToast);
  const createGroupRoom = useChatStore((s) => s.createGroupRoom);
  const setCurrentRoom = useChatStore((s) => s.setCurrentRoom);
  const setMobileShowChat = useUIStore((s) => s.setMobileShowChat);

  const [name, setName] = useState("");
  const [members, setMembers] = useState<string[]>([""]);

  function updateMember(i: number, val: string) {
    setMembers((prev) => prev.map((m, idx) => (idx === i ? val : m)));
  }

  function addMemberField() {
    if (members.length >= MAX_GROUP_MEMBERS - 1) return;
    setMembers((prev) => [...prev, ""]);
  }

  function removeMemberField(i: number) {
    setMembers((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleCreate() {
    const trimmedName = name.trim();
    const validMembers = members.map((m) => m.trim()).filter(Boolean);
    if (trimmedName.length < 2) {
      showToast("Please enter a group name.", "error");
      return;
    }
    if (validMembers.length === 0) {
      showToast("Add at least one member's Peer ID.", "error");
      return;
    }
    if (!validMembers.every(isValidPeerId)) {
      showToast("One or more Peer IDs look invalid.", "error");
      return;
    }
    const room = await createGroupRoom(trimmedName, Array.from(new Set(validMembers)));
    setCurrentRoom(room.id);
    setMobileShowChat(true);
    setOpen(false);
    setName("");
    setMembers([""]);
  }

  return (
    <Modal open={open} onClose={() => setOpen(false)} title="New Group">
      <div className="space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-black dark:text-white">Group Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Weekend Trip" />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-black dark:text-white">
            Members ({members.filter((m) => m.trim()).length + 1}/{MAX_GROUP_MEMBERS})
          </label>
          <div className="space-y-2">
            {members.map((m, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input value={m} onChange={(e) => updateMember(i, e.target.value)} placeholder="Member's Peer ID" />
                {members.length > 1 && (
                  <button onClick={() => removeMemberField(i)} className="shrink-0 text-[#FF3B30]">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
          {members.length < MAX_GROUP_MEMBERS - 1 && (
            <button
              onClick={addMemberField}
              className="mt-2 flex items-center gap-1 text-sm font-medium text-[#007AFF] dark:text-[#0A84FF]"
            >
              <Plus size={16} /> Add member
            </button>
          )}
        </div>

        <Button className="w-full" size="lg" onClick={handleCreate}>
          Create Group
        </Button>
      </div>
    </Modal>
  );
}
