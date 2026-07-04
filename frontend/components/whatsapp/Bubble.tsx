"use client";

import { ReactNode } from "react";
import { Check, CheckCheck } from "lucide-react";

/** Render *bold* segments (WhatsApp-style) inside message text. */
function formatText(text: string): ReactNode[] {
  return text.split(/(\*[^*]+\*)/g).filter(Boolean).map((part, i) => {
    if (part.startsWith("*") && part.endsWith("*")) {
      return <strong key={i} style={{ fontWeight: 600 }}>{part.slice(1, -1)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

interface BubbleProps {
  from: "them" | "me";
  time?: string;
  tail?: boolean;
  children?: ReactNode;
  text?: string;
  link?: { label: string; href: string };
}

export default function Bubble({ from, time = "", tail = true, children, text, link }: BubbleProps) {
  const me = from === "me";
  return (
    <div className={`flex ${me ? "justify-end" : "justify-start"} px-1`}>
      <div
        className={`wa-bubble ${tail ? (me ? "wa-bubble-out" : "wa-bubble-in") : ""} relative max-w-[78%] md:max-w-[65%]`}
        style={{
          background: me ? "var(--wa-out)" : "var(--wa-in)",
          color: "var(--wa-text)",
          borderRadius: 8,
          borderTopLeftRadius: !me && tail ? 0 : 8,
          borderTopRightRadius: me && tail ? 0 : 8,
          padding: "6px 9px 8px",
          boxShadow: "0 1px 0.5px rgba(0,0,0,0.2)",
          fontSize: 14.2,
          lineHeight: 1.4,
        }}
      >
        {text && <span className="whitespace-pre-wrap break-words">{formatText(text)}</span>}
        {children}
        {link && (
          <a
            href={link.href}
            target={link.href.startsWith("http") ? "_blank" : undefined}
            rel="noopener noreferrer"
            className="mt-1 block break-all"
            style={{ color: "#53bdeb", textDecoration: "none" }}
          >
            {link.label}
          </a>
        )}
        <span
          className="float-right ml-2 mt-1 inline-flex items-center gap-0.5 select-none"
          style={{ fontSize: 11, color: me ? "#8fc7bd" : "var(--wa-text2)", position: "relative", top: 4 }}
        >
          {time}
          {me && <CheckCheck size={14} style={{ color: "#53bdeb" }} />}
          {!me && time && <Check size={13} className="opacity-0" />}
        </span>
      </div>
    </div>
  );
}
