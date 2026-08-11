import { MessageCircle } from "lucide-react";
import { APP_NAME, APP_TAGLINE } from "@/lib/utils/constants";

export function EmptyState() {
  return (
    <div className="hidden h-full flex-1 flex-col items-center justify-center gap-3 bg-[#F2F2F7] dark:bg-black md:flex">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#007AFF] to-[#5856D6] shadow-lg shadow-blue-500/20">
        <MessageCircle size={36} className="text-white" />
      </div>
      <h2 className="mt-2 text-xl font-semibold text-black dark:text-white">{APP_NAME}</h2>
      <p className="max-w-xs text-center text-sm text-[#8E8E93]">{APP_TAGLINE}</p>
      <p className="max-w-sm text-center text-xs text-[#8E8E93]">
        Select a chat from the sidebar, or start a new encrypted conversation with a friend's Peer ID.
      </p>
    </div>
  );
}
