import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export function OfflineBanner() {
  const isOnline = useOnlineStatus();
  const [visible, setVisible] = useState(!isOnline);

  useEffect(() => {
    if (!isOnline) {
      setVisible(true);
    } else {
      const timeout = setTimeout(() => setVisible(false), 1500);
      return () => clearTimeout(timeout);
    }
  }, [isOnline]);

  if (!visible) return null;

  return (
    <div
      className={`flex items-center justify-center gap-2 px-4 py-2 text-center text-[13px] font-medium text-white transition-all duration-300 ${
        isOnline ? "bg-[#34C759]" : "bg-[#FF9500]"
      }`}
    >
      <WifiOff size={14} />
      {isOnline
        ? "Back online — syncing queued messages…"
        : "You are offline. Messages are shown from local storage and will sync when you reconnect."}
    </div>
  );
}
