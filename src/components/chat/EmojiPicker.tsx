import { lazy, Suspense, useEffect, useState } from "react";
import { Theme, EmojiClickData, EmojiStyle } from "emoji-picker-react";

const Picker = lazy(() => import("emoji-picker-react"));

interface EmojiPickerProps {
    onEmojiClick: (emoji: string) => void;
    onClose?: () => void;
    width?: number;
    height?: number;
}

export function EmojiPicker({
    onEmojiClick,
    onClose,
    width = 320,
}: EmojiPickerProps) {
    const [theme, setTheme] = useState<Theme>(Theme.LIGHT);

    useEffect(() => {
        const check = () => {
            const isDark = document.documentElement.classList.contains("dark");
            setTheme(isDark ? Theme.DARK : Theme.LIGHT);
        };
        check();
        const observer = new MutationObserver(check);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            const target = e.target as HTMLElement;
            if (!target.closest("[data-emoji-picker-wrapper]")) {
                onClose?.();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    return (
        <div
            data-emoji-picker-wrapper
            className="absolute bottom-14 left-0 z-30 overflow-hidden rounded-2xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10"
        >
            <Suspense
                fallback={
                    <div
                        className="flex items-center justify-center bg-white dark:bg-[#2C2C2E]"
                        style={{ width }}
                    >
                        <span className="text-sm text-[#8E8E93]">Loading emojis…</span>
                    </div>
                }
            >
                <Picker
                    theme={theme}
                    onEmojiClick={(emojiData: EmojiClickData) => {
                        onEmojiClick(emojiData.emoji);
                    }}
                    width={width}
                    lazyLoadEmojis
                    emojiStyle={EmojiStyle.NATIVE}
                />
            </Suspense>
        </div>
    );
}