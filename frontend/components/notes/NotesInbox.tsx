"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { fetchNotes, Note } from "@/lib/notes";

const ROTATIONS = [-2.5, 1.8, -1.2, 2.4, -0.8, 1.4];

/** Kushagra's private notes viewer — opened via the "notes" link in the footer.
    Listens for the `open-notes-inbox` window event. Key is remembered locally. */
export default function NotesInbox() {
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState("");
  const [notes, setNotes] = useState<Note[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const load = useCallback(async (k: string) => {
    setLoading(true);
    setError(false);
    const result = await fetchNotes(k);
    setLoading(false);
    if (result === null) {
      setError(true);
      setNotes(null);
    } else {
      setNotes(result);
      localStorage.setItem("notes-key", k);
    }
  }, []);

  useEffect(() => {
    const handler = () => {
      setOpen(true);
      const saved = localStorage.getItem("notes-key");
      if (saved) {
        setKey(saved);
        load(saved);
      }
    };
    window.addEventListener("open-notes-inbox", handler);
    return () => window.removeEventListener("open-notes-inbox", handler);
  }, [load]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto"
          style={{ background: "rgba(20,20,18,0.5)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="relative w-full max-w-3xl my-8 p-6"
            style={{ background: "var(--paper-card)", borderRadius: 8, border: "2px solid var(--ink)", boxShadow: "3px 5px 0 rgba(43,43,43,0.2)" }}
          >
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute top-4 right-4"
              style={{ color: "var(--ink-faint)" }}
            >
              <X size={20} />
            </button>

            <h3 className="display text-4xl" style={{ color: "var(--ink)" }}>
              the corkboard
            </h3>
            <p className="hand text-sm mb-4" style={{ color: "var(--ink-faint)" }}>
              notes visitors left for you {notes ? `· ${notes.length}` : ""}
            </p>

            {(notes === null || error) && (
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="password"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && load(key)}
                  placeholder="view key"
                  className="hand text-base px-3 py-2 outline-none"
                  style={{ background: "var(--paper-card-2)", border: "2px solid var(--ink)", borderRadius: 4, color: "var(--ink)" }}
                />
                <button
                  onClick={() => load(key)}
                  className="hand text-sm px-4 py-2"
                  style={{ background: "var(--red)", color: "#fff", border: "2px solid var(--ink)", borderRadius: 4, fontWeight: 700 }}
                >
                  {loading ? "opening…" : "unlock"}
                </button>
                {error && <span className="hand text-sm" style={{ color: "var(--red)" }}>wrong key (or backend down)</span>}
              </div>
            )}

            {notes && notes.length === 0 && (
              <p className="hand text-base" style={{ color: "var(--ink-faint)" }}>no notes yet.</p>
            )}

            {notes && notes.length > 0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                {notes.map((n, i) => (
                  <div
                    key={i}
                    className="p-4"
                    style={{
                      background: "var(--paper-card-2)",
                      border: "2px solid var(--ink)",
                      borderRadius: 4,
                      transform: `rotate(${ROTATIONS[i % ROTATIONS.length]}deg)`,
                      boxShadow: "2px 2px 0 rgba(43,43,43,0.12)",
                    }}
                  >
                    <p className="text-sm leading-snug" style={{ color: "var(--ink)" }}>{n.message}</p>
                    <p className="hand text-xs mt-2" style={{ color: "var(--ink-faint)" }}>
                      — {n.name} · {new Date(n.ts * 1000).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
