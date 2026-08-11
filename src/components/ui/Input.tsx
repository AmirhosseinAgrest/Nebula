import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-xl border border-black/5 bg-[#F2F2F7] dark:bg-[#2C2C2E] dark:border-white/5 px-4 py-3 text-[15px] text-black dark:text-white placeholder:text-[#8E8E93] outline-none transition-all duration-200 focus:ring-2 focus:ring-[#007AFF]/60",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full resize-none rounded-xl border border-black/5 bg-[#F2F2F7] dark:bg-[#2C2C2E] dark:border-white/5 px-4 py-3 text-[15px] text-black dark:text-white placeholder:text-[#8E8E93] outline-none transition-all duration-200 focus:ring-2 focus:ring-[#007AFF]/60",
        className,
      )}
      {...props}
    />
  );
}
