"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { postNote } from "@/lib/notes";
import SketchBorder from "@/components/sketch/SketchBorder";

type Status = "idle" | "sending" | "done" | "error";

export default function LeaveNote() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function send() {
    if (message.trim().length < 2 || status === "sending") return;
    setStatus("sending");
    const ok = await postNote(name.trim(), message.trim());
    setStatus(ok ? "done" : "error");
    if (ok) {
      setName("");
      setMessage("");
      setTimeout(() => {
        setOpen(false);
        setStatus("idle");
      }, 1400);
    }
  }

  return (
    <>
      {/* pinned sticky-note launcher */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Leave Kushagra a sticky note"
        className="hand fixed z-40 bottom-5 right-5 px-3.5 py-2 text-sm transition-transform hover:rotate-2 hover:scale-105"
        style={{
          background: "var(--paper-card-2)",
          color: "var(--ink)",
          border: "2px solid var(--ink)",
          borderRadius: 4,
          fontWeight: 700,
          transform: "rotate(-3deg)",
          boxShadow: "2px 3px 0 rgba(43,43,43,0.18)",
        }}
      >
        ✎ leave a note
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(20,20,18,0.45)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, rotate: -2, opacity: 0 }}
              animate={{ scale: 1, rotate: -1.5, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              className="relative w-full max-w-md p-6"
              style={{ background: "var(--paper-card-2)", borderRadius: 6, boxShadow: "3px 5px 0 rgba(43,43,43,0.2)" }}
            >
              <SketchBorder seed={9911} color="var(--ink)" />
              <span className="tape" aria-hidden style={{ top: -11, left: "50%", marginLeft: -32, transform: "rotate(-4deg)" }} />

              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="absolute top-3 right-3"
                style={{ color: "var(--ink-faint)" }}
              >
                <X size={18} />
              </button>

              <h3 className="display text-3xl" style={{ color: "var(--ink)" }}>
                leave me a note
              </h3>
              <p className="hand text-sm mb-4" style={{ color: "var(--ink-faint)" }}>
                say hi, drop feedback, or leave a lead — only I read these.
              </p>

              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="your name (optional)"
                className="hand w-full text-base mb-3 px-3 py-2 outline-none"
                style={{ background: "var(--paper-card)", border: "2px solid var(--ink)", borderRadius: 4, color: "var(--ink)" }}
              />
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="your note…"
                rows={4}
                className="hand w-full text-base px-3 py-2 outline-none resize-none"
                style={{ background: "var(--paper-card)", border: "2px solid var(--ink)", borderRadius: 4, color: "var(--ink)" }}
              />

              <div className="mt-4 flex items-center justify-between">
                <span className="hand text-sm" style={{ color: status === "error" ? "var(--red)" : "var(--ink-faint)" }}>
                  {status === "done" ? "pinned! thanks 🙏" : status === "error" ? "couldn't send — try later" : ""}
                </span>
                <button
                  onClick={send}
                  disabled={message.trim().length < 2 || status === "sending"}
                  className="hand text-sm px-4 py-1.5 transition-transform hover:-rotate-1 disabled:opacity-40"
                  style={{ background: "var(--red)", color: "#fff", border: "2px solid var(--ink)", borderRadius: 4, fontWeight: 700 }}
                >
                  {status === "sending" ? "pinning…" : "pin it →"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
