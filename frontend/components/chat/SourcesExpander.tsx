"use client";

import { useState } from "react";
import { Source } from "@/lib/types";

const CATEGORY_LABELS: Record<string, string> = {
  about: "About",
  experience: "Experience",
  project: "Project",
  skills: "Skills",
  education: "Education",
};

export default function SourcesExpander({ sources }: { sources: Source[] }) {
  const [open, setOpen] = useState(false);

  if (!sources.length) return null;

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="hand inline-flex items-center gap-1.5 text-sm transition-colors"
        style={{ color: "var(--navy)", fontWeight: 700 }}
        aria-expanded={open}
      >
        <sup style={{ color: "var(--red)" }}>[{sources.length}]</sup>
        {open ? "hide notes" : "from my notes…"}
      </button>

      {open && (
        <ol className="mt-2 space-y-1.5 pl-5" style={{ listStyle: "none" }}>
          {sources.map((s, i) => (
            <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "var(--ink-faint)" }}>
              <sup className="hand shrink-0" style={{ color: "var(--red)", fontWeight: 700 }}>{i + 1}</sup>
              <span className="leading-snug">
                <span className="hand" style={{ color: "var(--navy)" }}>
                  {CATEGORY_LABELS[s.category] ?? s.category}:
                </span>{" "}
                {s.title}
                <span className="ml-1 opacity-60">({(s.score * 100).toFixed(0)}%)</span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
