"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageCircle } from "lucide-react";
import WAAvatar from "./WAAvatar";

interface Story {
  bg: string;
  emoji: string;
  title: string;
  body: string;
  cta?: boolean;
}

const STORIES: Story[] = [
  { bg: "linear-gradient(150deg,#00a884,#024b3d)", emoji: "🟢", title: "Open to work", body: "SWE / SDE / AI Engineer roles from Aug 2026 — and happy to relocate anywhere in the US 🌎" },
  { bg: "linear-gradient(150deg,#8a63d2,#3d2570)", emoji: "🚩", title: "Shipped RolloutX", body: "A distributed feature-flag platform in Go — flag checks in ~211 ns, roughly 4.7M evaluations a second per core." },
  { bg: "linear-gradient(150deg,#e23744,#6f1019)", emoji: "⚡", title: "Payments at scale", body: "Owned Zomato Gold's payment backend — 100K+ daily transactions kept reliable with idempotency, retries & circuit breakers." },
  { bg: "linear-gradient(150deg,#0088cc,#04395a)", emoji: "🧠", title: "AI at Tesla", body: "Built an NL → Elasticsearch agent that made dashboard setup ~90% faster — safe by design with vetted templates + human confirm." },
  { bg: "linear-gradient(150deg,#e8a55a,#7c4f16)", emoji: "🎓", title: "Almost done", body: "Wrapping up my MS in Software Engineering Systems at Northeastern — graduating mid-2026." },
  { bg: "linear-gradient(150deg,#111b21,#005c4b)", emoji: "💬", title: "Let's talk", body: "Ask my AI anything, or book a 30-min call.", cta: true },
];

const DURATION = 4800;

export default function StatusViewer({
  open,
  onClose,
  onChat,
}: {
  open: boolean;
  onClose: () => void;
  onChat: () => void;
}) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (open) setI(0);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setI((v) => Math.min(v + 1, STORIES.length - 1));
      if (e.key === "ArrowLeft") setI((v) => Math.max(v - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const next = () => setI((v) => (v >= STORIES.length - 1 ? (onClose(), v) : v + 1));
  const prev = () => setI((v) => Math.max(v - 1, 0));

  const story = STORIES[i];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.92)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="relative w-full h-full max-w-[440px] flex flex-col" style={{ fontFamily: "system-ui, sans-serif" }}>
            {/* progress segments */}
            <div className="flex gap-1 px-3 pt-3">
              {STORIES.map((_, idx) => (
                <div key={idx} className="flex-1 h-[3px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.3)" }}>
                  <motion.div
                    className="h-full"
                    style={{ background: "#fff" }}
                    initial={{ width: idx < i ? "100%" : "0%" }}
                    animate={{ width: idx < i ? "100%" : idx === i ? "100%" : "0%" }}
                    transition={idx === i ? { duration: DURATION / 1000, ease: "linear" } : { duration: 0 }}
                    onAnimationComplete={() => { if (idx === i) next(); }}
                  />
                </div>
              ))}
            </div>

            {/* header */}
            <div className="flex items-center gap-3 px-4 py-3">
              <WAAvatar emoji="👨‍💻" bg="#0b3d34" size={36} />
              <div className="flex-1">
                <div className="text-white font-semibold" style={{ fontSize: 14 }}>Kushagra Sinha</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>my status · tap to skip</div>
              </div>
              <button onClick={onClose} aria-label="Close" className="text-white/80 hover:text-white"><X size={24} /></button>
            </div>

            {/* card */}
            <div className="relative flex-1 mx-3 mb-4 rounded-2xl overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={i}
                  className="absolute inset-0 flex flex-col items-center justify-center text-center px-8"
                  style={{ background: story.bg }}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div style={{ fontSize: 64 }}>{story.emoji}</div>
                  <h2 className="text-white font-bold mt-4" style={{ fontSize: 30, lineHeight: 1.1 }}>{story.title}</h2>
                  <p className="text-white/90 mt-3" style={{ fontSize: 16, lineHeight: 1.5 }}>{story.body}</p>
                  {story.cta && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onClose(); onChat(); }}
                      className="mt-6 inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-semibold"
                      style={{ background: "#fff", color: "#04231d", fontSize: 15 }}
                    >
                      <MessageCircle size={18} /> Chat with my AI
                    </button>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* tap zones */}
              <button className="absolute left-0 top-0 h-full w-1/3" onClick={prev} aria-label="Previous" />
              <button className="absolute right-0 top-0 h-full w-1/3" onClick={next} aria-label="Next" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
