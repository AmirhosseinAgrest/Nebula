import { create } from "zustand";
import type { ChatMessage } from "@/types/message.types";

interface ContextMenuState {
  message: ChatMessage;
  x: number;
  y: number;
}

interface UIState {
  showSettings: boolean;
  showNewChat: boolean;
  showNewGroup: boolean;
  showTerms: boolean;
  mobileShowChat: boolean;
  contextMenu: ContextMenuState | null;
  replyingTo: ChatMessage | null;
  editingMessage: ChatMessage | null;
  forwardingMessage: ChatMessage | null;
  toast: { message: string; type: "info" | "error" | "success" } | null;
  setShowSettings: (v: boolean) => void;
  setShowNewChat: (v: boolean) => void;
  setShowNewGroup: (v: boolean) => void;
  setShowTerms: (v: boolean) => void;
  setMobileShowChat: (v: boolean) => void;
  openContextMenu: (state: ContextMenuState) => void;
  closeContextMenu: () => void;
  setReplyingTo: (m: ChatMessage | null) => void;
  setEditingMessage: (m: ChatMessage | null) => void;
  setForwardingMessage: (m: ChatMessage | null) => void;
  showToast: (message: string, type?: "info" | "error" | "success") => void;
  clearToast: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  showSettings: false,
  showNewChat: false,
  showNewGroup: false,
  showTerms: false,
  mobileShowChat: false,
  contextMenu: null,
  replyingTo: null,
  editingMessage: null,
  forwardingMessage: null,
  toast: null,
  setShowSettings: (v) => set({ showSettings: v }),
  setShowNewChat: (v) => set({ showNewChat: v }),
  setShowNewGroup: (v) => set({ showNewGroup: v }),
  setShowTerms: (v) => set({ showTerms: v }),
  setMobileShowChat: (v) => set({ mobileShowChat: v }),
  openContextMenu: (state) => set({ contextMenu: state }),
  closeContextMenu: () => set({ contextMenu: null }),
  setReplyingTo: (m) => set({ replyingTo: m, editingMessage: null }),
  setEditingMessage: (m) => set({ editingMessage: m, replyingTo: null }),
  setForwardingMessage: (m) => set({ forwardingMessage: m }),
  showToast: (message, type = "info") => set({ toast: { message, type } }),
  clearToast: () => set({ toast: null }),
}));
