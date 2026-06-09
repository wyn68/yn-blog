"use client";

import { useTheme } from "@/contexts/ThemeContext";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className="w-10 h-10 rounded-xl flex items-center justify-center bg-muted/50 transition-all duration-200 hover:scale-105 active:scale-95"
      aria-label={isDark ? "切换到浅色模式" : "切换到深色模式"}
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-foreground" />
      ) : (
        <Moon className="w-5 h-5 text-muted-foreground" />
      )}
    </button>
  );
}