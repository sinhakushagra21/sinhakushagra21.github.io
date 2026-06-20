"use client";

import { useRef, useEffect, KeyboardEvent } from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function ChatInput({
  value,
  onChange,
  onSubmit,
  disabled,
  placeholder = "write your question on the line…",
}: ChatInputProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = `${Math.min(ref.current.scrollHeight, 160)}px`;
    }
  }, [value]);

  function handleKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && value.trim()) onSubmit();
    }
  }

  const canSend = !!value.trim() && !disabled;

  return (
    <div className="flex items-end gap-2 px-1">
      <span className="hand text-xl pb-1" style={{ color: "var(--red)" }} aria-hidden>
        ✎
      </span>
      <div className="flex-1 flex items-end gap-2" style={{ borderBottom: "2px solid var(--ink)" }}>
        <textarea
          ref={ref}
          rows={1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKey}
          disabled={disabled}
          placeholder={placeholder}
          className="hand flex-1 resize-none bg-transparent text-base leading-relaxed outline-none placeholder:text-[var(--muted-soft)] disabled:opacity-50 pb-1"
          style={{ color: "var(--ink)" }}
          aria-label="Chat input"
        />
        <button
          onClick={onSubmit}
          disabled={!canSend}
          className="shrink-0 mb-1 p-1.5 transition-transform disabled:opacity-30 hover:scale-110 hover:-rotate-6 active:scale-95"
          style={{
            background: canSend ? "var(--red)" : "transparent",
            color: canSend ? "#fff" : "var(--ink-faint)",
            border: `2px solid ${canSend ? "var(--ink)" : "var(--pencil)"}`,
            borderRadius: "48% 52% 50% 50% / 52% 48% 52% 48%",
          }}
          aria-label="Send message"
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
}
