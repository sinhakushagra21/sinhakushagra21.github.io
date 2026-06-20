"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Message, Source } from "@/lib/types";
import { streamChat, streamTailor } from "@/lib/chat";
import { encodeConversation, decodeConversation } from "@/lib/share";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import StarterPrompts from "./StarterPrompts";
import ChatHeader from "./ChatHeader";
import TypewriterHint from "./TypewriterHint";
import DoodleMascot from "@/components/sketch/DoodleMascot";
import SketchBorder from "@/components/sketch/SketchBorder";
import ScreeningForm from "./ScreeningForm";

let idCounter = 0;
const uid = () => `msg-${++idCounter}`;

// detect "let's meet / schedule a call" so the bot can offer the calendar
const SCHEDULE_INTENT =
  /\b(schedule|book(ing)? a|set ?up a (call|time|meeting|chat)|grab (a )?(time|slot)|find a time|hop on|jump on a call|calendly|can we (talk|chat|connect|meet|call)|let'?s (talk|chat|connect|meet|call)|meet(ing)? with you|talk to you)\b/i;

interface StatusLine {
  text: string;
}

export default function ChatContainer() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<StatusLine | null>(null);
  const [tailorOpen, setTailorOpen] = useState(false);
  const [jd, setJd] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    const el = scrollAreaRef.current;
    if (el) {
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight;
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, status, scrollToBottom]);

  useEffect(() => {
    const handler = (e: CustomEvent) => {
      const prompt = e.detail as string;
      if (prompt) submit(prompt);
    };
    window.addEventListener("inject-chat-prompt", handler as EventListener);
    return () => window.removeEventListener("inject-chat-prompt", handler as EventListener);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Restore a shared conversation from the URL (?c=…) on first load.
  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get("c");
    if (!c) return;
    const restored = decodeConversation(c);
    if (restored.length) {
      setMessages(restored.map((m) => ({ id: uid(), role: m.role, content: m.content })));
    }
  }, []);

  const shareConversation = useCallback(() => {
    const code = encodeConversation(messages);
    const url = `${window.location.origin}${window.location.pathname}?c=${code}#home`;
    navigator.clipboard?.writeText(url).catch(() => {});
  }, [messages]);

  const reset = useCallback(() => {
    setMessages([]);
    setInput("");
    setStatus(null);
    setLoading(false);
  }, []);

  async function submit(text?: string) {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setInput("");

    // scheduling intent → offer the calendar instead of a RAG answer
    if (SCHEDULE_INTENT.test(content)) {
      setMessages((prev) => [
        ...prev,
        { id: uid(), role: "user", content },
        {
          id: uid(),
          role: "assistant",
          content: "Happy to talk! I take recruiter screenings through a quick form — just need your work email and the job link 👇",
          scheduler: true,
        },
      ]);
      return;
    }

    const userMsg: Message = { id: uid(), role: "user", content };
    const assistantId = uid();
    const assistantMsg: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setLoading(true);
    setStatus({ text: "Thinking..." });

    const history = [...messages, userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    let sources: Source[] = [];
    let lowConfidence = false;

    await streamChat(history, {
      onStatus(text) {
        setStatus({ text });
      },
      onSources(s, lc) {
        sources = s;
        lowConfidence = lc;
      },
      onToken(text) {
        setStatus(null);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: m.content + text } : m
          )
        );
      },
      onDone() {
        setStatus(null);
        setLoading(false);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, isStreaming: false, sources, lowConfidence }
              : m
          )
        );
      },
      onError(msg) {
        setStatus(null);
        setLoading(false);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: msg, isStreaming: false }
              : m
          )
        );
      },
    });
  }

  async function submitTailor(text: string) {
    const content = text.trim();
    if (content.length < 30 || loading) return;
    setTailorOpen(false);
    setJd("");

    const userMsg: Message = {
      id: uid(),
      role: "user",
      content: "💡 Why are you a fit for this role?",
    };
    const assistantId = uid();
    setMessages((prev) => [
      ...prev,
      userMsg,
      { id: assistantId, role: "assistant", content: "", isStreaming: true },
    ]);
    setLoading(true);
    setStatus({ text: "Reading the job description..." });

    let sources: Source[] = [];
    let lowConfidence = false;
    await streamTailor(content, {
      onStatus(t) { setStatus({ text: t }); },
      onSources(s, lc) { sources = s; lowConfidence = lc; },
      onToken(t) {
        setStatus(null);
        setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + t } : m)));
      },
      onDone() {
        setStatus(null);
        setLoading(false);
        setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, isStreaming: false, sources, lowConfidence } : m)));
      },
      onError(msg) {
        setStatus(null);
        setLoading(false);
        setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: msg, isStreaming: false } : m)));
      },
    });
  }

  const hasMessages = messages.length > 0;

  return (
    <div
      className="chalkboard relative flex flex-col w-full h-full gap-3 min-h-0 px-5 pt-6 pb-6"
      style={{
        background: "var(--paper-card)",
        border: "13px solid #6b4f3a",
        borderRadius: 8,
        boxShadow:
          "inset 0 0 70px rgba(0,0,0,0.45), inset 0 2px 0 rgba(255,255,255,0.04), 0 14px 34px rgba(0,0,0,0.4), 0 0 0 2px #4a3527",
      }}
    >
      <SketchBorder seed={888} color="var(--ink)" strokeWidth={2.2} />

      {/* chalk tray ledge at the base of the board */}
      <div
        aria-hidden
        className="absolute -bottom-[10px] left-6 right-6 flex items-center gap-3 px-3"
        style={{
          height: 12,
          background: "linear-gradient(#3a4038, #2a2f28)",
          borderRadius: 3,
          boxShadow: "0 3px 5px rgba(0,0,0,0.3)",
        }}
      >
        <span style={{ width: 26, height: 5, borderRadius: 3, background: "#f2efe6", opacity: 0.85 }} />
        <span style={{ width: 16, height: 5, borderRadius: 3, background: "#ef9a8d", opacity: 0.7 }} />
        <span style={{ width: 18, height: 7, borderRadius: 2, background: "#8a6b4a", marginLeft: "auto" }} />
      </div>

      {/* Doodle boy stands at the right edge and "writes" on the board —
          absolutely placed so it never steals height from the conversation. */}
      <div aria-hidden className="absolute z-[5] pointer-events-none" style={{ right: 4, bottom: 84 }}>
        <DoodleMascot writing={loading} stationary />
      </div>

      {/* recruiter mode: paste-a-JD overlay */}
      {tailorOpen && (
        <div
          className="absolute inset-0 z-30 flex flex-col gap-3 p-5"
          style={{ background: "var(--paper-card)", borderRadius: 10 }}
        >
          <div className="hand text-lg" style={{ color: "var(--ink)" }}>
            paste the role / job description — I&apos;ll show why I&apos;m a fit 💡
          </div>
          <textarea
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            data-lenis-prevent
            placeholder="paste the role / job description here…"
            className="hand flex-1 text-sm leading-relaxed outline-none resize-none p-3"
            style={{
              background: "var(--paper-card-2)",
              color: "var(--ink)",
              border: "2px solid var(--ink)",
              borderRadius: 6,
            }}
            autoFocus
          />
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setTailorOpen(false)}
              className="hand text-sm px-3 py-1.5"
              style={{ color: "var(--ink-faint)", fontWeight: 700 }}
            >
              cancel
            </button>
            <button
              onClick={() => submitTailor(jd)}
              disabled={jd.trim().length < 30}
              className="hand text-sm px-3.5 py-1.5 transition-transform hover:-rotate-1 disabled:opacity-40"
              style={{ background: "var(--red)", color: "#fff", border: "2px solid var(--ink)", borderRadius: 4, fontWeight: 700 }}
            >
              show my fit →
            </button>
          </div>
        </div>
      )}

      <ChatHeader
        onReset={hasMessages ? reset : undefined}
        onShare={hasMessages ? shareConversation : undefined}
      />

      {!hasMessages && (
        <div
          className="flex-1 flex items-center justify-center min-h-0 overflow-y-auto"
          data-lenis-prevent
        >
          <TypewriterHint />
        </div>
      )}

      {hasMessages && (
        <div
          ref={scrollAreaRef}
          data-lenis-prevent
          className="flex-1 overflow-y-auto px-1 py-2"
          style={{
            minHeight: 0,
            overscrollBehavior: "contain",
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(255,255,255,0.2) transparent",
          }}
        >
          <div className="flex flex-col gap-3">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {status && (
              <div
                className="hand flex items-center gap-2 text-sm pl-9"
                style={{ color: "var(--ink-faint)" }}
              >
                <span className="inline-flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="block w-1.5 h-1.5"
                      style={{ background: "var(--red)", borderRadius: "50%" }}
                      animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </span>
                {status.text}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="shrink-0">
        <ChatInput
          value={input}
          onChange={setInput}
          onSubmit={() => submit()}
          disabled={loading}
        />
      </div>

      {/* recruiter entries */}
      <div className="shrink-0 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        <button
          onClick={() => setTailorOpen(true)}
          disabled={loading}
          className="hand inline-flex items-center gap-1.5 text-sm transition-colors disabled:opacity-40"
          style={{ color: "var(--ink-faint)", fontWeight: 700 }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--red)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ink-faint)")}
        >
          💡 recruiter? see why I&apos;m a fit for your role
        </button>
        <button
          onClick={() => window.dispatchEvent(new Event("open-screening"))}
          className="hand inline-flex items-center gap-1.5 text-sm px-3 py-1.5 transition-transform hover:-rotate-1 hover:scale-105"
          style={{ background: "var(--red)", color: "#fff", border: "2px solid var(--ink)", borderRadius: 4, fontWeight: 700 }}
        >
          📅 schedule a recruiter screening
        </button>
      </div>

      <ScreeningForm />

      {!hasMessages && (
        <div className="shrink-0">
          <StarterPrompts visible onSelect={(p) => submit(p)} />
        </div>
      )}
    </div>
  );
}
