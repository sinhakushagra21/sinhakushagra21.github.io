"use client";

import { useState } from "react";
import { RotateCcw, Link2, Check } from "lucide-react";
import { motion } from "framer-motion";
import ScribbleUnderline from "@/components/sketch/ScribbleUnderline";

interface ChatHeaderProps {
  onReset?: () => void;
  onShare?: () => void;
}

export default function ChatHeader({ onReset, onShare }: ChatHeaderProps) {
  const [shared, setShared] = useState(false);

  function handleShare() {
    onShare?.();
    setShared(true);
    setTimeout(() => setShared(false), 1800);
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex items-center gap-3 px-1 pb-3 shrink-0"
      style={{ borderBottom: "2px dashed var(--pencil)" }}
    >
      <div className="flex-1 min-w-0">
        <div className="relative inline-block">
          <span className="display text-2xl leading-none" style={{ color: "var(--ink)" }}>
            Kushagra&apos;s notebook
          </span>
          <ScribbleUnderline seed={4242} color="var(--ink)" strokeWidth={2} />
        </div>
        <div className="hand text-xs mt-1.5" style={{ color: "var(--ink-faint)" }}>
          backend engineer · Boston · answers come from my notes (RAG)
        </div>
      </div>

      {onShare && (
        <button
          onClick={handleShare}
          aria-label="Copy a link to this conversation"
          title={shared ? "Link copied!" : "Copy a link to this chat"}
          className="hand inline-flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors text-sm whitespace-nowrap"
          style={{ color: shared ? "var(--navy)" : "var(--ink-faint)", fontWeight: 700 }}
          onMouseEnter={(e) => { if (!shared) e.currentTarget.style.color = "var(--navy)"; }}
          onMouseLeave={(e) => { if (!shared) e.currentTarget.style.color = "var(--ink-faint)"; }}
        >
          {shared ? <Check size={15} /> : <Link2 size={15} />}
          {shared ? "copied!" : "copy chat link"}
        </button>
      )}

      {onReset && (
        <button
          onClick={onReset}
          aria-label="Start a fresh page"
          title="Fresh page"
          className="p-1.5 rounded-md transition-colors"
          style={{ color: "var(--muted-soft)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--red)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted-soft)")}
        >
          <RotateCcw size={15} />
        </button>
      )}
    </motion.div>
  );
}
