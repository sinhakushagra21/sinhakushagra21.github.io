"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, PhoneOff } from "lucide-react";
import { streamChat } from "@/lib/chat";
import { logEvent } from "@/lib/events";

type Status = "connecting" | "listening" | "thinking" | "speaking" | "error";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRec = any;

export default function CallScreen({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [status, setStatus] = useState<Status>("connecting");
  const [caption, setCaption] = useState(""); // what the visitor is saying
  const [reply, setReply] = useState(""); // what the AI says
  const [muted, setMuted] = useState(false);
  const [supported, setSupported] = useState(true);
  const [elapsed, setElapsed] = useState(0);

  const recRef = useRef<AnyRec>(null);
  const history = useRef<{ role: "user" | "assistant"; content: string }[]>([]);
  const openRef = useRef(open);
  const mutedRef = useRef(muted);
  useEffect(() => { openRef.current = open; }, [open]);
  useEffect(() => { mutedRef.current = muted; }, [muted]);

  function speak(text: string, after: () => void) {
    try {
      const synth = window.speechSynthesis;
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text.replace(/[*_#`]/g, ""));
      u.rate = 1.05;
      const v = synth.getVoices().find((x) => /en[-_]?(US|GB)/i.test(x.lang));
      if (v) u.voice = v;
      u.onend = after;
      u.onerror = after;
      setStatus("speaking");
      synth.speak(u);
    } catch {
      after();
    }
  }

  function listen() {
    if (!openRef.current || mutedRef.current) return;
    setCaption("");
    try {
      recRef.current?.start();
      setStatus("listening");
    } catch {
      /* already started */
    }
  }

  async function handleSpeech(text: string) {
    if (!text.trim()) return listen();
    setStatus("thinking");
    history.current = [...history.current, { role: "user", content: text }];
    logEvent("voice_question", text);
    let full = "";
    await streamChat(history.current, {
      onStatus() {},
      onSources() {},
      onToken(t) { full += t; setReply(full); },
      onDone() {
        history.current = [...history.current, { role: "assistant", content: full }];
        if (openRef.current) speak(full || "Sorry, could you say that again?", () => openRef.current && listen());
      },
      onError(msg) {
        setReply(msg);
        if (openRef.current) speak("I couldn't reach my brain just now — try again in a moment.", () => openRef.current && listen());
      },
    });
  }

  useEffect(() => {
    if (!open) return;
    setStatus("connecting");
    setCaption("");
    setReply("");
    setElapsed(0);
    history.current = [];

    const SR = (window as typeof window & { SpeechRecognition?: AnyRec; webkitSpeechRecognition?: AnyRec }).SpeechRecognition
      || (window as typeof window & { webkitSpeechRecognition?: AnyRec }).webkitSpeechRecognition;
    if (!SR) { setSupported(false); setStatus("error"); return; }

    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e: AnyRec) => {
      let interim = "", finalT = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalT += r[0].transcript;
        else interim += r[0].transcript;
      }
      setCaption(interim || finalT);
      if (finalT) { try { rec.stop(); } catch {} handleSpeech(finalT); }
    };
    rec.onerror = (e: AnyRec) => { if (e.error === "not-allowed" || e.error === "service-not-allowed") { setSupported(false); setStatus("error"); } };
    recRef.current = rec;

    logEvent("voice_call");
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    speak("Hi! You're on a call with Kushagra's AI. Ask me anything about my work, projects, or availability.", () => openRef.current && listen());

    return () => {
      clearInterval(t);
      try { rec.stop(); } catch {}
      window.speechSynthesis.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function end() {
    try { recRef.current?.stop(); } catch {}
    window.speechSynthesis.cancel();
    onClose();
  }

  function toggleMute() {
    setMuted((m) => {
      const next = !m;
      if (next) { try { recRef.current?.stop(); } catch {} }
      else setTimeout(listen, 50);
      return next;
    });
  }

  const label = !supported ? "Voice isn't supported in this browser" :
    status === "connecting" ? "Connecting…" :
    status === "listening" ? "Listening…" :
    status === "thinking" ? "Thinking…" :
    status === "speaking" ? "Speaking…" : "";

  const active = status === "listening" || status === "speaking";
  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex flex-col items-center justify-between py-14"
          style={{ background: "linear-gradient(160deg,#0b2b24,#04231d 60%,#0b141a)" }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          {/* top: identity */}
          <div className="flex flex-col items-center gap-2">
            <div className="text-white/70" style={{ fontSize: 13 }}>{supported ? `voice call · ${mm}:${ss}` : "voice call"}</div>
            <div className="text-white font-semibold" style={{ fontSize: 22 }}>Kushagra&apos;s AI</div>
            <div className="text-white/60" style={{ fontSize: 14 }}>{label}</div>
          </div>

          {/* avatar with pulse */}
          <div className="relative flex items-center justify-center">
            {active && (
              <motion.span className="absolute rounded-full" style={{ width: 150, height: 150, background: "#00a884", opacity: 0.25 }}
                animate={{ scale: [1, 1.35, 1], opacity: [0.25, 0, 0.25] }} transition={{ duration: 1.8, repeat: Infinity }} />
            )}
            <div className="relative flex items-center justify-center rounded-full" style={{ width: 130, height: 130, background: "#00a884", color: "#04231d", fontSize: 52, fontWeight: 700 }}>K</div>
          </div>

          {/* captions */}
          <div className="px-6 text-center min-h-[90px] max-w-xl">
            {!supported ? (
              <p className="text-white/80" style={{ fontSize: 15 }}>Your browser blocks speech recognition. Try Chrome, or just type in the chat instead.</p>
            ) : (
              <>
                {caption && <p className="text-white/60 italic" style={{ fontSize: 15 }}>“{caption}”</p>}
                {reply && <p className="text-white mt-2" style={{ fontSize: 16, lineHeight: 1.45 }}>{reply}</p>}
                {!caption && !reply && <p className="text-white/50" style={{ fontSize: 14 }}>Speak after the beep — I&apos;m listening.</p>}
              </>
            )}
          </div>

          {/* controls */}
          <div className="flex items-center gap-6">
            <button onClick={toggleMute} disabled={!supported}
              className="flex items-center justify-center rounded-full disabled:opacity-40"
              style={{ width: 60, height: 60, background: muted ? "#fff" : "rgba(255,255,255,0.15)", color: muted ? "#04231d" : "#fff" }}
              aria-label={muted ? "Unmute" : "Mute"}>
              {muted ? <MicOff size={24} /> : <Mic size={24} />}
            </button>
            <button onClick={end} className="flex items-center justify-center rounded-full" style={{ width: 68, height: 68, background: "#f15c6d", color: "#fff" }} aria-label="End call">
              <PhoneOff size={26} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
