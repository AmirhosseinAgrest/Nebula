import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserProfile } from "@/types/user.types";

interface UserState {
  currentUser: UserProfile | null;
  isRegistered: boolean;
  register: (profile: Omit<UserProfile, "isOnline" | "lastSeen">) => void;
  updateProfile: (partial: Partial<UserProfile>) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      currentUser: null,
      isRegistered: false,
      register: (profile) =>
        set({
          currentUser: { ...profile, isOnline: true },
          isRegistered: true,
        }),
      updateProfile: (partial) =>
        set((state) => ({
          currentUser: state.currentUser ? { ...state.currentUser, ...partial } : state.currentUser,
        })),
      logout: () => set({ currentUser: null, isRegistered: false }),
    }),
    { name: "p2p-chat-user" },
  ),
);
