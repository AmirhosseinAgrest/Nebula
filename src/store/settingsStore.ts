import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsState {
  darkMode: boolean;
  readReceipts: boolean;
  showOnlineStatus: boolean;
  fontSize: "small" | "medium" | "large";
  toggleDarkMode: () => void;
  setDarkMode: (val: boolean) => void;
  setReadReceipts: (val: boolean) => void;
  setShowOnlineStatus: (val: boolean) => void;
  setFontSize: (size: "small" | "medium" | "large") => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      darkMode: window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false,
      readReceipts: true,
      showOnlineStatus: true,
      fontSize: "medium",
      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
      setDarkMode: (val) => set({ darkMode: val }),
      setReadReceipts: (val) => set({ readReceipts: val }),
      setShowOnlineStatus: (val) => set({ showOnlineStatus: val }),
      setFontSize: (size) => set({ fontSize: size }),
    }),
    { name: "p2p-chat-settings" },
  ),
);
