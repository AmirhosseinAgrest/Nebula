import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/utils/cn";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease-in-out]"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative z-10 w-full max-w-lg rounded-2xl bg-white dark:bg-[#1C1C1E] shadow-2xl animate-[scaleIn_0.2s_ease-in-out] max-h-[85vh] overflow-y-auto",
          className,
        )}
      >
        {title && (
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-black/5 dark:border-white/10 bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur px-6 py-4">
            <h2 className="text-lg font-semibold text-black dark:text-white">{title}</h2>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-[#8E8E93] transition-colors hover:bg-black/5 dark:hover:bg-white/10"
            >
              <X size={20} />
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
