import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 ease-in-out disabled:opacity-40 disabled:cursor-not-allowed active:scale-95";
  const variants: Record<string, string> = {
    primary: "bg-[#007AFF] dark:bg-[#0A84FF] text-white shadow-sm hover:brightness-110",
    secondary: "bg-[#E5E5EA] dark:bg-[#2C2C2E] text-black dark:text-white hover:brightness-95",
    ghost: "bg-transparent text-[#007AFF] dark:text-[#0A84FF] hover:bg-black/5 dark:hover:bg-white/10",
    danger: "bg-[#FF3B30] text-white hover:brightness-110",
  };
  const sizes: Record<string, string> = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3.5 text-base",
  };

  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}
