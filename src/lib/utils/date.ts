// Lightweight date formatting helpers (no external dependency needed)

export function formatTime(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function formatDayLabel(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const diffDays = Math.round((startOfToday - startOfDate) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return date.toLocaleDateString([], { weekday: "long" });
  return date.toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" });
}

export function formatLastSeen(timestamp?: number): string {
  if (!timestamp) return "offline";
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 60) return "just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
