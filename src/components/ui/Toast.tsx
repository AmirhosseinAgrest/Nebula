import { useEffect } from "react";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { useUIStore } from "@/store/uiStore";

export function Toast() {
  const toast = useUIStore((s) => s.toast);
  const clearToast = useUIStore((s) => s.clearToast);

  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(clearToast, 3000);
    return () => clearTimeout(timeout);
  }, [toast, clearToast]);

  if (!toast) return null;

  const icons = {
    info: <Info size={16} className="text-[#007AFF]" />,
    success: <CheckCircle2 size={16} className="text-[#34C759]" />,
    error: <AlertCircle size={16} className="text-[#FF3B30]" />,
  };

  return (
    <div
      className="fixed top-4 left-1/2 z-[200] flex -translate-x-1/2 items-center gap-2 rounded-full bg-white dark:bg-[#2C2C2E] px-4 py-2.5 text-[13px] font-medium text-black dark:text-white shadow-2xl ring-1 ring-black/5"
      style={{ animation: "toastIn 0.25s ease-out" }}
    >
      {icons[toast.type]}
      {toast.message}
    </div>
  );
}
