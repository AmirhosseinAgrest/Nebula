import { useEffect } from "react";
import { useSettingsStore } from "@/store/settingsStore";

/** Applies dark/light mode + font-size to the document root as data/class attributes. */
export function useTheme() {
  const darkMode = useSettingsStore((s) => s.darkMode);
  const fontSize = useSettingsStore((s) => s.fontSize);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    const sizes = { small: "14px", medium: "16px", large: "18px" };
    document.documentElement.style.fontSize = sizes[fontSize];
  }, [fontSize]);
}
