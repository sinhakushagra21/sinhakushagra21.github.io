"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-9 h-9" />;

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="w-9 h-9 flex items-center justify-center transition-transform hover:rotate-12 hover:scale-110"
      style={{
        background: "var(--paper-card)",
        color: "var(--ink-soft)",
        border: "2px solid var(--ink)",
        borderRadius: "45% 55% 52% 48% / 50% 48% 52% 50%",
      }}
      aria-label="Toggle theme"
      title={isDark ? "Switch to paper" : "Switch to chalkboard"}
    >
      {isDark ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}
