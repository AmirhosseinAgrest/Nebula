import { useEffect, useRef, useState } from "react";
import {
  Ban,
  Camera,
  Download,
  Moon,
  Palette,
  ShieldCheck,
  Sun,
  Upload,
  User,
  Copy,
  Check,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { useUIStore } from "@/store/uiStore";
import { useUserStore } from "@/store/userStore";
import { useSettingsStore } from "@/store/settingsStore";
import { fileToBase64 } from "@/lib/utils/file";
import { exportBackup, importBackup } from "@/lib/backup/backup";
import { blockUser, getBlockedUsers, unblockUser } from "@/lib/db/blocklist";
import type { BlockedUser } from "@/types/user.types";
import { cn } from "@/utils/cn";

type Tab = "profile" | "privacy" | "backup" | "blocked";

export function SettingsModal() {
  const open = useUIStore((s) => s.showSettings);
  const setOpen = useUIStore((s) => s.setShowSettings);
  const showToast = useUIStore((s) => s.showToast);
  const currentUser = useUserStore((s) => s.currentUser);
  const updateProfile = useUserStore((s) => s.updateProfile);
  const settings = useSettingsStore();

  const [tab, setTab] = useState<Tab>("profile");
  const [name, setName] = useState(currentUser?.displayName ?? "");
  const [bio, setBio] = useState(currentUser?.bio ?? "");
  const [avatar, setAvatar] = useState(currentUser?.avatar);
  const [passphrase, setPassphrase] = useState("");
  const [blocked, setBlocked] = useState<BlockedUser[]>([]);
  const [manualBlockId, setManualBlockId] = useState("");
  const [copied, setCopied] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName(currentUser?.displayName ?? "");
      setBio(currentUser?.bio ?? "");
      setAvatar(currentUser?.avatar);
      refreshBlocked();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function refreshBlocked() {
    setBlocked(await getBlockedUsers());
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatar(await fileToBase64(file));
  }

  function saveProfile() {
    updateProfile({ displayName: name.trim() || currentUser?.displayName, bio: bio.trim(), avatar });
    showToast("Profile updated", "success");
  }

  async function handleExport() {
    if (passphrase.length < 4) {
      showToast("Choose a passphrase with at least 4 characters.", "error");
      return;
    }
    const blob = await exportBackup(passphrase);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nebula-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Backup exported successfully", "success");
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (passphrase.length < 4) {
      showToast("Enter the passphrase used for this backup first.", "error");
      return;
    }
    try {
      await importBackup(file, passphrase);
      showToast("Backup restored — reloading…", "success");
      setTimeout(() => window.location.reload(), 1200);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to restore backup.", "error");
    }
  }

  async function handleUnblock(userId: string) {
    await unblockUser(userId);
    refreshBlocked();
  }

  async function handleManualBlock() {
    if (!manualBlockId.trim()) return;
    await blockUser(manualBlockId.trim());
    setManualBlockId("");
    refreshBlocked();
  }

  function copyId() {
    if (!currentUser) return;
    navigator.clipboard.writeText(currentUser.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "profile", label: "Profile", icon: <User size={15} /> },
    { key: "privacy", label: "Privacy", icon: <ShieldCheck size={15} /> },
    { key: "backup", label: "Backup", icon: <Download size={15} /> },
    { key: "blocked", label: "Blocked", icon: <Ban size={15} /> },
  ];

  return (
    <Modal open={open} onClose={() => setOpen(false)} title="Settings" className="max-w-2xl">
      <div className="mb-5 flex flex-wrap gap-1.5">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-all duration-200",
              tab === t.key ? "bg-[#007AFF] dark:bg-[#0A84FF] text-white" : "bg-black/5 dark:bg-white/10 text-black dark:text-white",
            )}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <div className="space-y-4">
          <div className="flex justify-center">
            <label className="group relative cursor-pointer">
              <Avatar name={name || "?"} src={avatar} size={88} />
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 transition-all group-hover:bg-black/30">
                <Camera className="text-white opacity-0 transition-opacity group-hover:opacity-100" size={20} />
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </label>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-black dark:text-white">Display Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={50} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-black dark:text-white">Bio</label>
            <Textarea value={bio} onChange={(e) => setBio(e.target.value.slice(0, 150))} rows={3} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-black dark:text-white">Your Peer ID</label>
            <div className="flex items-center gap-2 rounded-xl bg-[#F2F2F7] dark:bg-[#2C2C2E] px-4 py-3">
              <span className="flex-1 truncate font-mono text-xs text-[#8E8E93]">{currentUser?.id}</span>
              <button onClick={copyId} className="text-[#007AFF] dark:text-[#0A84FF]">
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>
          <Button className="w-full" size="lg" onClick={saveProfile}>
            Save Changes
          </Button>
        </div>
      )}

      {tab === "privacy" && (
        <div className="space-y-1">
          <ToggleRow
            icon={<Palette size={17} />}
            label="Dark Mode"
            description="Switch between light and dark appearance"
            checked={settings.darkMode}
            onChange={settings.setDarkMode}
            trailingIcon={settings.darkMode ? <Moon size={16} /> : <Sun size={16} />}
          />
          <ToggleRow
            icon={<Check size={17} />}
            label="Read Receipts"
            description="Let others see when you've read their messages"
            checked={settings.readReceipts}
            onChange={settings.setReadReceipts}
          />
          <ToggleRow
            icon={<User size={17} />}
            label="Show Online Status"
            description="Let others see when you're online"
            checked={settings.showOnlineStatus}
            onChange={settings.setShowOnlineStatus}
          />
          <div className="pt-3">
            <label className="mb-1.5 block text-sm font-medium text-black dark:text-white">Font Size</label>
            <div className="flex gap-2">
              {(["small", "medium", "large"] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => settings.setFontSize(size)}
                  className={cn(
                    "flex-1 rounded-xl border py-2 text-sm capitalize transition-colors",
                    settings.fontSize === size
                      ? "border-[#007AFF] bg-[#007AFF]/10 text-[#007AFF] dark:text-[#0A84FF]"
                      : "border-black/10 dark:border-white/10 text-black dark:text-white",
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "backup" && (
        <div className="space-y-4">
          <p className="text-sm text-[#8E8E93]">
            Export your entire chat history as an encrypted JSON file, protected with a passphrase you choose. Anyone
            without the passphrase cannot read the file's contents.
          </p>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-black dark:text-white">Backup Passphrase</label>
            <Input
              type="password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              placeholder="Choose a strong passphrase"
            />
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={handleExport}>
              <Download size={16} /> Export Backup
            </Button>
            <Button variant="secondary" className="flex-1" onClick={() => importInputRef.current?.click()}>
              <Upload size={16} /> Restore Backup
            </Button>
            <input ref={importInputRef} type="file" accept="application/json" className="hidden" onChange={handleImport} />
          </div>
        </div>
      )}

      {tab === "blocked" && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={manualBlockId}
              onChange={(e) => setManualBlockId(e.target.value)}
              placeholder="Peer ID to block"
            />
            <Button onClick={handleManualBlock}>Block</Button>
          </div>
          {blocked.length === 0 ? (
            <p className="py-6 text-center text-sm text-[#8E8E93]">No blocked users.</p>
          ) : (
            <div className="space-y-1">
              {blocked.map((b) => (
                <div key={b.userId} className="flex items-center justify-between rounded-xl px-3 py-2.5 hover:bg-black/5 dark:hover:bg-white/5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-black dark:text-white">{b.displayName || b.userId}</p>
                    <p className="truncate font-mono text-xs text-[#8E8E93]">{b.userId}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleUnblock(b.userId)}>
                    Unblock
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

function ToggleRow({
  icon,
  label,
  description,
  checked,
  onChange,
  trailingIcon,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onChange: (val: boolean) => void;
  trailingIcon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl px-2 py-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#007AFF]/10 text-[#007AFF] dark:text-[#0A84FF]">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-[14px] font-medium text-black dark:text-white">{label}</p>
        <p className="text-[12px] text-[#8E8E93]">{description}</p>
      </div>
      {trailingIcon && <span className="text-[#8E8E93]">{trailingIcon}</span>}
      <button
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200",
          checked ? "bg-[#34C759] dark:bg-[#30D158]" : "bg-black/15 dark:bg-white/20",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform duration-200",
            checked ? "translate-x-5" : "translate-x-0.5",
          )}
        />
      </button>
    </div>
  );
}
