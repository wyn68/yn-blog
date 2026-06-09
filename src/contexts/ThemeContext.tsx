"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  isClient: boolean;
}

const APP_VERSION = '1.0.3';
const APP_CACHE_KEYS = ['appVersion', 'viewedAnnouncements'];

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // 检查版本并清除旧缓存
    const storedVersion = localStorage.getItem('appVersion');
    if (storedVersion !== APP_VERSION) {
      APP_CACHE_KEYS.forEach(function(key) {
        localStorage.removeItem(key);
      });
      localStorage.setItem('appVersion', APP_VERSION);
    }

    const saved = localStorage.getItem("theme") as Theme | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    const initialTheme: Theme = saved ?? (prefersDark ? "dark" : "light");
    setThemeState(initialTheme);

    const root = document.documentElement;
    if (initialTheme === "dark") {
      root.setAttribute("data-theme", "dark");
      root.classList.add("dark");
    } else {
      root.removeAttribute("data-theme");
      root.classList.remove("dark");
    }
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    const root = document.documentElement;
    if (theme === "dark") {
      root.setAttribute("data-theme", "dark");
      root.classList.add("dark");
    } else {
      root.removeAttribute("data-theme");
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme, isClient]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === "light" ? "dark" : "light"));
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, isClient }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
