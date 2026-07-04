"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { fetchEvents, ActivityEvent } from "@/lib/events";

const LABELS: Record<string, string> = {
  visit: "👀 visited",
  question: "💬 asked",
  recruiter_tailor: "🎯 recruiter mode",
  book_call: "📅 opened Calendly",
  resume: "📄 downloaded résumé",
  share: "🔗 copied share link",
  open_chat: "📂 opened",
};

function ago(ts: number) {
  const s = Math.floor(Date.now() / 1000 - ts);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function ActivityPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [key, setKey] = useState("");
  const [events, setEvents] = useState<ActivityEvent[] | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function load(k: string) {
    setLoading(true);
    setError(false);
    const res = await fetchEvents(k);
    setLoading(false);
    if (res === null) { setError(true); setEvents(null); }
    else { setEvents(res); localStorage.setItem("notes-key", k); }
  }

  function onOpen() {
    const saved = localStorage.getItem("notes-key");
    if (saved) { setKey(saved); load(saved); }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)" }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onAnimationStart={onOpen}
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
            className="w-full max-w-lg rounded-xl overflow-hidden flex flex-col"
            style={{ background: "var(--wa-panel)", maxHeight: "80vh", border: "1px solid var(--wa-divider)" }}
          >
            <div className="flex items-center justify-between px-4 py-3" style={{ background: "var(--wa-header)" }}>
              <span className="font-semibold" style={{ color: "var(--wa-text)" }}>📊 Activity (private)</span>
              <button onClick={onClose} aria-label="Close" style={{ color: "var(--wa-text2)" }}><X size={20} /></button>
            </div>

            <div className="p-4 overflow-y-auto" data-lenis-prevent style={{ color: "var(--wa-text)" }}>
              {(events === null || error) && (
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="password" value={key} onChange={(e) => setKey(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && load(key)}
                    placeholder="view key"
                    className="rounded-lg px-3 py-2 outline-none"
                    style={{ background: "var(--wa-in)", color: "var(--wa-text)", fontSize: 14 }}
                  />
                  <button onClick={() => load(key)} className="rounded-lg px-4 py-2 font-medium" style={{ background: "var(--wa-accent)", color: "#04231d" }}>
                    {loading ? "…" : "unlock"}
                  </button>
                  {error && <span style={{ fontSize: 13, color: "#f15c6d" }}>wrong key (or backend asleep)</span>}
                </div>
              )}

              {events && events.length === 0 && <p style={{ color: "var(--wa-text2)" }}>No activity yet.</p>}

              {events && events.length > 0 && (
                <ul className="space-y-2">
                  {events.map((e, i) => (
                    <li key={i} className="flex items-center justify-between gap-3 rounded-lg px-3 py-2" style={{ background: "var(--wa-in)" }}>
                      <span className="min-w-0">
                        <span style={{ fontSize: 14 }}>{LABELS[e.type] ?? e.type}</span>
                        {e.detail && <span className="block truncate" style={{ fontSize: 12.5, color: "var(--wa-text2)" }}>“{e.detail}”</span>}
                      </span>
                      <span className="shrink-0 text-right" style={{ fontSize: 11.5, color: "var(--wa-text2)" }}>
                        {e.place && <span className="block">{e.place}</span>}
                        {ago(e.ts)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
