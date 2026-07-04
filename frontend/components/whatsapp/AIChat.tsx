"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Send, Paperclip, X, FileText, Calendar, Target, Link2 } from "lucide-react";
import { streamChat, streamTailor } from "@/lib/chat";
import { Message, Source } from "@/lib/types";
import { CALENDLY_URL } from "@/lib/calendly";
import { logEvent, setVisitorPlace } from "@/lib/events";
import { useLang } from "@/lib/i18n";
import Bubble from "./Bubble";

let idc = 0;
const uid = () => `m${++idc}`;
const now = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const SCHEDULE_INTENT =
  /\b(schedule|book(ing)? a|set ?up a (call|time|meeting|chat)|grab (a )?(time|slot)|find a time|hop on|jump on a call|calendly|can we (talk|chat|connect|meet|call)|let'?s (talk|chat|connect|meet|call)|meet(ing)? with you|talk to you)\b/i;

function openCalendly() {
  logEvent("book_call");
  window.open(CALENDLY_URL, "_blank", "noopener,noreferrer");
}

export default function AIChat() {
  const { t, lang } = useLang();
  const [messages, setMessages] = useState<Message[]>(() => [
    { id: "greet", role: "assistant", content: t("greeting") },
    { id: "tips", role: "assistant", content: t("tips") },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);
  const [tailorOpen, setTailorOpen] = useState(false);
  const [jd, setJd] = useState("");
  const [shared, setShared] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }, []);
  useEffect(() => { scrollToBottom(); }, [messages, typing, scrollToBottom]);

  // re-localize the opening messages when language changes (before any chat)
  useEffect(() => {
    setMessages((prev) =>
      prev.some((m) => m.role === "user")
        ? prev
        : [
            { id: "greet", role: "assistant", content: t("greeting") },
            { id: "tips", role: "assistant", content: t("tips") },
          ]
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  // personalized geo greeting (same-origin Vercel geo, ipwho fallback)
  useEffect(() => {
    let active = true;
    const add = (place: string | null) => {
      if (!active || !place) return;
      setVisitorPlace(place);
      logEvent("visit", "");
      setMessages((p) =>
        p.some((m) => m.id === "geo") ? p
          : [...p, { id: "geo", role: "assistant", content: t("geo", { place, time: now() }) }]
      );
    };
    (async () => {
      try {
        const r = await fetch("/api/geo");
        if (r.ok) { const d = await r.json(); if (d.city || d.country) return add(d.city && d.country ? `${d.city}, ${d.country}` : d.city || d.country); }
      } catch {}
      try {
        const r = await fetch("https://ipwho.is/");
        const d = await r.json();
        if (d?.success !== false && (d.city || d.country)) add(d.city && d.country ? `${d.city}, ${d.country}` : d.city || d.country);
      } catch {}
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const handler = (e: Event) => { const p = (e as CustomEvent).detail as string; if (p) submit(p); };
    window.addEventListener("inject-chat-prompt", handler);
    return () => window.removeEventListener("inject-chat-prompt", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function runStream(
    runner: (cb: Parameters<typeof streamChat>[1]) => Promise<void>,
  ) {
    const aid = uid();
    setLoading(true);
    setTyping(true);
    let sources: Source[] = [];
    let lowConfidence = false;
    let started = false;
    return runner({
      onStatus() {},
      onSources(s, lc) { sources = s; lowConfidence = lc; },
      onToken(t) {
        if (!started) { started = true; setTyping(false); setMessages((p) => [...p, { id: aid, role: "assistant", content: "", isStreaming: true }]); }
        setMessages((p) => p.map((m) => (m.id === aid ? { ...m, content: m.content + t } : m)));
      },
      onDone() { setTyping(false); setLoading(false); setMessages((p) => p.map((m) => (m.id === aid ? { ...m, isStreaming: false, sources, lowConfidence } : m))); },
      onError(msg) { setTyping(false); setLoading(false); setMessages((p) => [...p.filter((m) => m.id !== aid), { id: aid, role: "assistant", content: msg }]); },
    });
  }

  async function submit(text?: string) {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setInput("");
    const userMsg: Message = { id: uid(), role: "user", content };
    setMessages((p) => [...p, userMsg]);
    logEvent("question", content);

    if (SCHEDULE_INTENT.test(content)) {
      setMessages((p) => [...p, { id: uid(), role: "assistant", content: "Would love to chat! Grab a 30-minute slot that works for you 👇", scheduler: true }]);
      return;
    }

    const history = [...messages, userMsg]
      .filter((m) => m.id !== "greet" && m.id !== "geo" && m.id !== "tips")
      .map((m) => ({ role: m.role, content: m.content }));
    await runStream((cb) => streamChat(history, cb));
  }

  async function submitTailor() {
    const text = jd.trim();
    if (text.length < 30 || loading) return;
    setTailorOpen(false);
    setJd("");
    logEvent("recruiter_tailor", text.slice(0, 120));
    setMessages((p) => [...p, { id: uid(), role: "user", content: "🎯 Tailored my fit to a job description" }]);
    await runStream((cb) => streamTailor(text, cb));
  }

  function shareChat() {
    navigator.clipboard?.writeText(window.location.href).catch(() => {});
    logEvent("share");
    setShared(true);
    setAttachOpen(false);
    setTimeout(() => setShared(false), 1800);
  }

  const attachments = [
    { icon: Target, label: "Tailor to a job description", bg: "#8a63d2", onClick: () => { setAttachOpen(false); setTailorOpen(true); } },
    { icon: Calendar, label: "Book a 30-min call", bg: "#00a884", onClick: () => { setAttachOpen(false); openCalendly(); } },
    { icon: FileText, label: "Download résumé", bg: "#e8a55a", onClick: () => { setAttachOpen(false); logEvent("resume"); window.open("/resume.pdf", "_blank"); } },
    { icon: Link2, label: shared ? "Link copied!" : "Copy link to share", bg: "#0088cc", onClick: shareChat },
  ];

  return (
    <>
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-3 space-y-1.5" data-lenis-prevent>
        {messages.map((m) => (
          <div key={m.id} className="space-y-1">
            {m.scheduler ? (
              <Bubble from="them" time={now()}>
                <span className="whitespace-pre-wrap">{m.content}</span>
                <button onClick={openCalendly} className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg py-2 font-medium" style={{ background: "var(--wa-accent)", color: "#04231d", fontSize: 13.5 }}>
                  <Calendar size={15} /> Book a 30-min call
                </button>
              </Bubble>
            ) : (
              <Bubble from={m.role === "user" ? "me" : "them"} time={now()} text={m.content} />
            )}
            {m.lowConfidence && (
              <div className="px-3 text-center" style={{ fontSize: 11, color: "var(--wa-text2)" }}>⚠ limited context — might be incomplete</div>
            )}
          </div>
        ))}

        {typing && (
          <Bubble from="them" tail>
            <span className="inline-flex items-center gap-1 py-1">
              {[0, 1, 2].map((i) => (<span key={i} className="inline-block rounded-full" style={{ width: 7, height: 7, background: "var(--wa-text2)", animation: `wa-typing 1.2s ${i * 0.2}s infinite` }} />))}
            </span>
          </Bubble>
        )}

        {!messages.some((m) => m.role === "user") && (
          <div className="flex flex-wrap gap-2 justify-center px-3 pt-3">
            {[t("q_exp"), t("q_proj"), t("q_reloc"), t("q_interview")].map((q) => (
              <button key={q} onClick={() => submit(q)} className="rounded-full px-3 py-1.5 transition-colors" style={{ fontSize: 13, border: "1px solid var(--wa-accent)", color: "var(--wa-accent)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,168,132,0.12)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                {q}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* recruiter-mode JD overlay */}
      {tailorOpen && (
        <div className="absolute inset-0 z-30 flex flex-col gap-3 p-5" style={{ background: "var(--wa-panel)" }}>
          <div className="flex items-center justify-between">
            <span className="font-semibold">🎯 Tailor my fit to a role</span>
            <button onClick={() => setTailorOpen(false)} aria-label="Close" style={{ color: "var(--wa-text2)" }}><X size={20} /></button>
          </div>
          <p style={{ fontSize: 13, color: "var(--wa-text2)" }}>Paste a job description — I'll write an honest pitch for how I fit it.</p>
          <textarea value={jd} onChange={(e) => setJd(e.target.value)} data-lenis-prevent placeholder="Paste the job description here…"
            className="flex-1 rounded-lg p-3 outline-none resize-none" style={{ background: "var(--wa-in)", color: "var(--wa-text)", fontSize: 14 }} autoFocus />
          <button onClick={submitTailor} disabled={jd.trim().length < 30} className="self-end rounded-lg px-5 py-2 font-medium disabled:opacity-40" style={{ background: "var(--wa-accent)", color: "#04231d" }}>
            Tailor it →
          </button>
        </div>
      )}

      {/* attachment menu */}
      {attachOpen && (
        <div className="absolute left-3 z-30 rounded-xl overflow-hidden" style={{ bottom: 64, background: "var(--wa-header)", boxShadow: "0 4px 20px rgba(0,0,0,0.4)", minWidth: 250 }}>
          {attachments.map((a) => (
            <button key={a.label} onClick={a.onClick} className="flex items-center gap-3 w-full px-4 py-3 text-left transition-colors"
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--wa-hover)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
              <span className="flex items-center justify-center rounded-full shrink-0" style={{ width: 40, height: 40, background: a.bg }}><a.icon size={18} color="#fff" /></span>
              <span style={{ fontSize: 14.5 }}>{a.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* input */}
      <div className="flex items-center gap-2 px-3 py-2 shrink-0" style={{ background: "var(--wa-header)" }}>
        <button onClick={() => setAttachOpen((o) => !o)} aria-label="Attach" style={{ color: "var(--wa-text2)" }} className="shrink-0 p-1">
          <Paperclip size={22} style={{ transform: attachOpen ? "rotate(45deg)" : "none", transition: "transform 0.2s" }} />
        </button>
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") submit(); }} placeholder={t("typeMessage")}
          className="flex-1 rounded-lg px-4 outline-none" style={{ height: 42, background: "var(--wa-in)", color: "var(--wa-text)", fontSize: 14.5 }} />
        <button onClick={() => submit()} disabled={loading || !input.trim()} className="flex items-center justify-center rounded-full shrink-0 disabled:opacity-40" style={{ width: 42, height: 42, background: "var(--wa-accent)", color: "#04231d" }} aria-label="Send">
          <Send size={18} />
        </button>
      </div>
    </>
  );
}
