import { colorForName, initialsForName } from "@/lib/utils/avatar";
import { cn } from "@/utils/cn";

interface AvatarProps {
  name: string;
  src?: string;
  size?: number;
  online?: boolean;
  className?: string;
}

export function Avatar({ name, src, size = 44, online, className }: AvatarProps) {
  const color = colorForName(name);
  return (
    <div className={cn("relative shrink-0", className)} style={{ width: size, height: size }}>
      {src ? (
        <img
          src={src}
          alt={name}
          className="h-full w-full rounded-full object-cover shadow-sm ring-1 ring-black/5"
          style={{ width: size, height: size }}
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center rounded-full font-semibold text-white shadow-sm"
          style={{ backgroundColor: color, fontSize: size * 0.4 }}
        >
          {initialsForName(name)}
        </div>
      )}
      {online !== undefined && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full ring-2 ring-white dark:ring-[#1C1C1E]",
            online ? "bg-[#34C759] dark:bg-[#30D158]" : "bg-[#8E8E93]",
          )}
          style={{ width: size * 0.28, height: size * 0.28 }}
        />
      )}
    </div>
  );
}
