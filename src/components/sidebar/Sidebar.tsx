import { useMemo, useState } from "react";
import { Lock, Search, Settings, SquarePen, Users } from "lucide-react";
import { useChatStore } from "@/store/chatStore";
import { useUserStore } from "@/store/userStore";
import { useUIStore } from "@/store/uiStore";
import { ChatItem } from "@/components/sidebar/ChatItem";
import { Avatar } from "@/components/ui/Avatar";
import { APP_NAME, SAVED_MESSAGES_ID } from "@/lib/utils/constants";
import { cn } from "@/utils/cn";

type Tab = "all" | "favorites" | "saved" | "groups";

export function Sidebar() {
  const rooms = useChatStore((s) => s.rooms);
  const onlineStatus = useChatStore((s) => s.onlineStatus);
  const currentRoomId = useChatStore((s) => s.currentRoomId);
  const setCurrentRoom = useChatStore((s) => s.setCurrentRoom);
  const markRoomRead = useChatStore((s) => s.markRoomRead);
  const currentUser = useUserStore((s) => s.currentUser);
  const setShowSettings = useUIStore((s) => s.setShowSettings);
  const setShowNewChat = useUIStore((s) => s.setShowNewChat);
  const setShowNewGroup = useUIStore((s) => s.setShowNewGroup);
  const setMobileShowChat = useUIStore((s) => s.setMobileShowChat);

  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = [...rooms];
    if (tab === "favorites") list = list.filter((r) => r.isFavorite);
    if (tab === "saved") list = list.filter((r) => r.id === SAVED_MESSAGES_ID);
    if (tab === "groups") list = list.filter((r) => r.type === "group");
    if (search.trim()) {
      list = list.filter((r) => r.name.toLowerCase().includes(search.trim().toLowerCase()));
    }
    return list.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return (b.lastMessageTime ?? b.createdAt) - (a.lastMessageTime ?? a.createdAt);
    });
  }, [rooms, tab, search]);

  function openRoom(id: string) {
    setCurrentRoom(id);
    setMobileShowChat(true);
    markRoomRead(id);
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "all", label: "All Chats" },
    { key: "favorites", label: "Favorites" },
    { key: "saved", label: "Saved" },
    { key: "groups", label: "Groups" },
  ];

  return (
    <div className="flex h-full flex-col bg-[#F2F2F7] dark:bg-[#0F0F10]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#007AFF] to-[#5856D6]">
            <Lock size={16} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-black dark:text-white">{APP_NAME}</h1>
        </div>
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#007AFF] dark:text-[#0A84FF] transition-colors hover:bg-black/5 dark:hover:bg-white/10"
          >
            <SquarePen size={19} />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-11 z-20 w-52 overflow-hidden rounded-2xl bg-white dark:bg-[#2C2C2E] py-1.5 shadow-2xl ring-1 ring-black/5">
                <button
                  onClick={() => {
                    setShowNewChat(true);
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10"
                >
                  <SquarePen size={16} /> New Direct Chat
                </button>
                <button
                  onClick={() => {
                    setShowNewGroup(true);
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10"
                >
                  <Users size={16} /> New Group
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="px-5 pb-3">
        <div className="flex items-center gap-2 rounded-xl bg-black/5 dark:bg-white/10 px-3.5 py-2.5">
          <Search size={16} className="text-[#8E8E93]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chats"
            className="w-full bg-transparent text-[14px] text-black dark:text-white placeholder:text-[#8E8E93] outline-none"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 px-5 pb-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "rounded-full px-3 py-1.5 text-[12.5px] font-medium transition-all duration-200",
              tab === t.key
                ? "bg-[#007AFF] dark:bg-[#0A84FF] text-white"
                : "bg-black/5 dark:bg-white/10 text-[#3C3C43] dark:text-white/70",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Chat list */}
      <div className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-3">
        {filtered.length === 0 ? (
          <div className="mt-10 text-center text-sm text-[#8E8E93]">No chats found.</div>
        ) : (
          filtered.map((room) => (
            <ChatItem
              key={room.id}
              room={room}
              active={room.id === currentRoomId}
              online={!!onlineStatus[room.members.find((m) => m !== currentUser?.id) ?? ""]}
              onClick={() => openRoom(room.id)}
            />
          ))
        )}
      </div>

      {/* User profile footer */}
      <div className="flex items-center gap-3 border-t border-black/5 dark:border-white/10 px-4 py-3">
        <Avatar name={currentUser?.displayName ?? "?"} src={currentUser?.avatar} size={40} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-semibold text-black dark:text-white">{currentUser?.displayName}</p>
          <p className="truncate text-[12px] text-[#8E8E93]">{currentUser?.bio || "Available"}</p>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#8E8E93] transition-colors hover:bg-black/5 dark:hover:bg-white/10"
        >
          <Settings size={19} />
        </button>
      </div>
    </div>
  );
}
