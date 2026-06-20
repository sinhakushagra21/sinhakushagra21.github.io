"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { Copy, Check, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { Message } from "@/lib/types";
import SourcesExpander from "./SourcesExpander";
import SpeechBubble from "@/components/sketch/SpeechBubble";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="absolute right-2 top-2 p-1 rounded text-[var(--on-dark-soft)] hover:text-[var(--on-dark)] transition-colors"
      aria-label="Copy code"
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
    </button>
  );
}

export default function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="flex items-end gap-2 justify-end"
      >
        <div
          className="hand max-w-[82%] text-base px-4 py-2"
          style={{
            background: "var(--paper-card-2)",
            color: "var(--ink)",
            border: "2px solid var(--ink)",
            borderRadius: "10px 10px 2px 10px",
            transform: "rotate(0.6deg)",
            boxShadow: "2px 2px 0 rgba(43,43,43,0.08)",
          }}
        >
          <p className="whitespace-pre-wrap leading-snug">{message.content}</p>
        </div>
        <div
          className="shrink-0 w-7 h-7 flex items-center justify-center text-[11px] mb-0.5 hand"
          style={{ background: "var(--paper)", border: "2px solid var(--ink)", borderRadius: "50%", color: "var(--ink-faint)", fontWeight: 700 }}
        >
          U
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="flex items-end gap-2 justify-start"
    >
      <SpeechBubble seed={(message.id.length * 13) % 997} tail="left" background="var(--paper-card-2)" className="max-w-[88%]">
        <div className="px-4 py-3 text-sm" style={{ color: "var(--ink)" }}>
          {message.lowConfidence && (
            <div
              className="hand flex items-center gap-1.5 mb-2 pb-2 text-sm"
              style={{ color: "var(--red)", borderBottom: "1.5px dashed var(--pencil)", fontWeight: 700 }}
            >
              <AlertTriangle size={13} />
              <span>limited context — answer may be incomplete</span>
            </div>
          )}
          <div className="chat-prose">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                pre({ children, ...props }) {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const codeEl = (children as any)?.props?.children;
                  const codeText = typeof codeEl === "string" ? codeEl : "";
                  return (
                    <div className="relative group">
                      <pre {...props}>{children}</pre>
                      {codeText && <CopyButton text={codeText} />}
                    </div>
                  );
                },
                li({ children }) {
                  // plain <li> — animating each li re-fires its enter
                  // transition on every streamed token, which flickers.
                  return <li>{children}</li>;
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
            {message.isStreaming && <span className="ink-caret" aria-hidden />}
          </div>
          {message.scheduler && (
            <div className="mt-3">
              <button
                onClick={() => window.dispatchEvent(new Event("open-screening"))}
                className="hand inline-flex items-center gap-1.5 text-sm px-3.5 py-1.5 transition-transform hover:-rotate-1 hover:scale-105"
                style={{ background: "var(--red)", color: "#fff", border: "2px solid var(--ink)", borderRadius: 4, fontWeight: 700 }}
              >
                📅 Schedule a recruiter screening
              </button>
            </div>
          )}
          {message.sources && message.sources.length > 0 && (
            <div style={{ borderTop: "1.5px dashed var(--pencil)", marginTop: 10, paddingTop: 8 }}>
              <SourcesExpander sources={message.sources} />
            </div>
          )}
        </div>
      </SpeechBubble>
    </motion.div>
  );
}
