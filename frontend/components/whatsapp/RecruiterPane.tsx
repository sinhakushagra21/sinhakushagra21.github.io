"use client";

import { useEffect, useRef, useState } from "react";
import { Target, Calendar, X } from "lucide-react";
import { streamTailor } from "@/lib/chat";
import { CALENDLY_URL } from "@/lib/calendly";
import { logEvent } from "@/lib/events";
import Bubble from "./Bubble";

interface Msg { id: string; from: "them" | "me"; text: string }
let c = 0;
const uid = () => `r${++c}`;

export default function RecruiterPane() {
  const [messages, setMessages] = useState<Msg[]>([
    { id: "intro", from: "them", text: "Hi! 👋 Two quick things I can do for you as a recruiter — check how I fit a specific role, or set up a screening call. Pick one 👇" },
  ]);
  const [jdOpen, setJdOpen] = useState(false);
  const [jd, setJd] = useState("");
  const [typing, setTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    requestAnimationFrame(() => { const el = scrollRef.current; if (el) el.scrollTop = el.scrollHeight; });
  }, [messages, typing]);

  function schedule() {
    logEvent("book_call", "recruiter");
    window.open(CALENDLY_URL, "_blank", "noopener,noreferrer");
  }

  async function checkFit() {
    const text = jd.trim();
    if (text.length < 30 || loading) return;
    setJdOpen(false);
    setJd("");
    setLoading(true);
    setTyping(true);
    logEvent("recruiter_tailor", text.slice(0, 120));
    setMessages((m) => [...m, { id: uid(), from: "me", text: "Here's the role I'm hiring for 👇\n\n" + (text.length > 220 ? text.slice(0, 220) + "…" : text) }]);
    const aid = uid();
    let full = "";
    let started = false;
    await streamTailor(text, {
      onStatus() {},
      onSources() {},
      onToken(t) {
        if (!started) { started = true; setTyping(false); setMessages((m) => [...m, { id: aid, from: "them", text: "" }]); }
        full += t;
        setMessages((m) => m.map((x) => (x.id === aid ? { ...x, text: full } : x)));
      },
      onDone() { setTyping(false); setLoading(false); },
      onError(msg) { setTyping(false); setLoading(false); setMessages((m) => [...m, { id: uid(), from: "them", text: msg }]); },
    });
  }

  return (
    <div className="relative flex-1 flex flex-col min-h-0">
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-4 space-y-2" data-lenis-prevent>
        {messages.map((m) => (
          <Bubble key={m.id} from={m.from} text={m.text} time="" />
        ))}

        {typing && (
          <Bubble from="them" tail>
            <span className="inline-flex items-center gap-1 py-1">
              {[0, 1, 2].map((i) => (<span key={i} className="inline-block rounded-full" style={{ width: 7, height: 7, background: "var(--wa-text2)", animation: `wa-typing 1.2s ${i * 0.2}s infinite` }} />))}
            </span>
          </Bubble>
        )}

        {!loading && (
          <div className="flex flex-col items-start gap-2 px-3 pt-2">
            <button
              onClick={() => setJdOpen(true)}
              className="inline-flex items-center gap-2.5 rounded-xl px-4 py-3 w-full max-w-sm transition-colors"
              style={{ background: "var(--wa-in)", color: "var(--wa-text)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--wa-active)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--wa-in)")}
            >
              <span className="flex items-center justify-center rounded-full shrink-0" style={{ width: 38, height: 38, background: "#8a63d2" }}><Target size={18} color="#fff" /></span>
              <span className="text-left">
                <span className="block font-medium" style={{ fontSize: 14.5 }}>Check my fit for a job</span>
                <span className="block" style={{ fontSize: 12.5, color: "var(--wa-text2)" }}>paste a JD → honest, tailored pitch</span>
              </span>
            </button>
            <button
              onClick={schedule}
              className="inline-flex items-center gap-2.5 rounded-xl px-4 py-3 w-full max-w-sm transition-colors"
              style={{ background: "var(--wa-in)", color: "var(--wa-text)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--wa-active)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--wa-in)")}
            >
              <span className="flex items-center justify-center rounded-full shrink-0" style={{ width: 38, height: 38, background: "#00a884" }}><Calendar size={18} color="#fff" /></span>
              <span className="text-left">
                <span className="block font-medium" style={{ fontSize: 14.5 }}>Schedule a screening (Google Meet)</span>
                <span className="block" style={{ fontSize: 12.5, color: "var(--wa-text2)" }}>grab a 30-min slot on my calendar</span>
              </span>
            </button>
          </div>
        )}
      </div>

      {/* JD input overlay */}
      {jdOpen && (
        <div className="absolute inset-0 z-20 flex flex-col gap-3 p-5" style={{ background: "var(--wa-panel)" }}>
          <div className="flex items-center justify-between">
            <span className="font-semibold" style={{ color: "var(--wa-text)" }}>🎯 Check my fit</span>
            <button onClick={() => setJdOpen(false)} aria-label="Close" style={{ color: "var(--wa-text2)" }}><X size={20} /></button>
          </div>
          <p style={{ fontSize: 13, color: "var(--wa-text2)" }}>Paste the job description — I&apos;ll give an honest take on how I fit it.</p>
          <textarea
            value={jd} onChange={(e) => setJd(e.target.value)} data-lenis-prevent autoFocus
            placeholder="Paste the job description here…"
            className="flex-1 rounded-lg p-3 outline-none resize-none"
            style={{ background: "var(--wa-in)", color: "var(--wa-text)", fontSize: 14 }}
          />
          <button onClick={checkFit} disabled={jd.trim().length < 30} className="self-end rounded-lg px-5 py-2 font-medium disabled:opacity-40" style={{ background: "var(--wa-accent)", color: "#04231d" }}>
            Check fit →
          </button>
        </div>
      )}
    </div>
  );
}
