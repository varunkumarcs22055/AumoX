"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

type Ctx = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
};

const ThemeContext = createContext<Ctx | null>(null);

const STORAGE_KEY = "aumox_theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Default DARK (per product decision) — actual value resolved on mount
  const [theme, setThemeState] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = (typeof window !== "undefined" && (localStorage.getItem(STORAGE_KEY) as Theme | null)) || "dark";
    setThemeState(stored);
    applyClass(stored);
    setMounted(true);
  }, []);

  function applyClass(t: Theme) {
    const root = document.documentElement;
    if (t === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }

  function setTheme(t: Theme) {
    document.documentElement.classList.add("theme-shifting");
    setThemeState(t);
    applyClass(t);
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, t);
    setTimeout(() => document.documentElement.classList.remove("theme-shifting"), 350);
  }

  function toggle() {
    setTheme(theme === "dark" ? "light" : "dark");
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle }}>
      {/* Suppress flash by hiding nothing — first render uses dark className from layout */}
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return { theme: "dark" as Theme, setTheme: () => {}, toggle: () => {} };
  }
  return ctx;
}
