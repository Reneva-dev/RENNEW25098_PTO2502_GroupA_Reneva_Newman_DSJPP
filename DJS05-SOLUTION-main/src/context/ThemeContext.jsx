// src/context/ThemeContext.jsx
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

const ThemeContext = createContext();

/**
 * Provides global theme state (light/dark) using CSS variables and
 * persists the user's preference in localStorage.
 *
 * Features:
 * - Reads previously saved theme from localStorage
 * - Uses system preference as a fallback
 * - Smooth transition animation when switching themes
 * - Exposes `theme`, `setTheme`, and `toggleTheme` to all components
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem("theme");
      if (saved === "light" || saved === "dark") return saved;
    } catch (e) {
      // ignore
    }
    // default to system preference
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "light";
  });

  // apply theme to document element
  useEffect(() => {
    const root = document.documentElement;
    if (!root) return;

    // add a small transition class to allow smooth switch
    root.classList.add("theme-transition");
    // remove after a short time
    const t = setTimeout(() => root.classList.remove("theme-transition"), 300);

    root.dataset.theme = theme;

    try {
      localStorage.setItem("theme", theme);
    } catch (e) {
      // ignore
    }

    return () => clearTimeout(t);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  const value = { theme, setTheme, toggleTheme };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
