"use client";

import { CSSProperties } from "react";

/**
 * Faint "rough work" scribbles in the left & right margins — the kind of thing
 * a student doodles next to their notes. Purely decorative (aria-hidden,
 * pointer-events: none), behind content, hidden on small screens. Pass a `set`
 * to vary the scribbles per section.
 */
const SETS: Record<string, string[]> = {
  hero: ["θ ≈ 0.105 rad", "O(n log n)", "p99 < 200ms ✓", "≈ 4.7M / sec", "idempotent!!", "coffee++"],
  experience: ["weeks → 4 days", "80% ↑ accuracy", "100k txns/day", "zero dupes ✓", "ship it 🚀", "Σ bugs → 0"],
  projects: ["211 ns / eval", "MurmurHash3", "±1% @ 1M keys", "lock-free!", "outbox → kafka", "220+ tests"],
  skills: ["while(1) learn", "REST vs gRPC?", "k8s ≈ 🐳 × ∞", "cache me if u can", "vim > ?", "git push --f 😅"],
  education: ["GPA 3.8", "∫ knowledge dx", "NEU '26", "all-nighter #42", "TODO: graduate", "∴ hireable"],
  contact: ["reply < 24h", "let's chat ☕", "say hi 👋", "↗ DM me", "mailto: →", "open to chat"],
};

// six margin slots: three left, three right
const SLOTS: { style: CSSProperties; anim?: string }[] = [
  { style: { top: "15%", left: "2.5%", transform: "rotate(-8deg)" } },
  { style: { top: "46%", left: "4.5%", transform: "rotate(5deg)" }, anim: "float-bob" },
  { style: { bottom: "16%", left: "3%", transform: "rotate(-4deg)" } },
  { style: { top: "20%", right: "2.5%", transform: "rotate(6deg)" } },
  { style: { top: "55%", right: "3.5%", transform: "rotate(-6deg)" }, anim: "float-bob" },
  { style: { bottom: "18%", right: "3%", transform: "rotate(7deg)" } },
];

export default function MarginDoodles({ set = "hero" }: { set?: keyof typeof SETS }) {
  const items = SETS[set] ?? SETS.hero;

  return (
    <div aria-hidden className="hidden lg:block absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
      {SLOTS.map((slot, i) => (
        <span
          key={i}
          className={`hand absolute text-base ${slot.anim ?? ""}`}
          style={{ color: "var(--ink-faint)", opacity: 0.34, ...slot.style }}
        >
          {items[i]}
        </span>
      ))}

      {/* a doodled star that twinkles */}
      <svg
        className="twinkle absolute"
        style={{ top: "30%", left: "12%", color: "var(--red)", opacity: 0.4 }}
        width="20" height="20" viewBox="0 0 22 22" fill="none"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
      >
        <path d="M11 2 L13 9 L20 11 L13 13 L11 20 L9 13 L2 11 L9 9 Z" />
      </svg>

      {/* a little squiggle arrow */}
      <svg
        className="absolute"
        style={{ bottom: "28%", right: "11%", color: "var(--ink-faint)", opacity: 0.32, transform: "rotate(-8deg)" }}
        width="46" height="22" viewBox="0 0 46 22" fill="none"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"
      >
        <path d="M2 12 C 14 4, 30 18, 42 8 M36 5 L43 8 L37 13" />
      </svg>
    </div>
  );
}
