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
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  useEffect(() => { openRef.current = open; }, [open]);
  useEffect(() => { mutedRef.current = muted; }, [muted]);

  // preload TTS voices (they populate asynchronously)
  useEffect(() => {
    const load = () => { voicesRef.current = window.speechSynthesis?.getVoices() ?? []; };
    load();
    window.speechSynthesis?.addEventListener?.("voiceschanged", load);
    return () => window.speechSynthesis?.removeEventListener?.("voiceschanged", load);
  }, []);

  function speak(text: string, after: () => void) {
    try {
      const synth = window.speechSynthesis;
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text.replace(/[*_#`]/g, ""));
      u.rate = 1.0;
      const voices = voicesRef.current.length ? voicesRef.current : synth.getVoices();
      // a clean, natural English voice (browser default is a fine fallback)
      const v =
        voices.find((x) => /Google US English/i.test(x.name)) ||
        voices.find((x) => /Samantha|Aaron|Google UK English/i.test(x.name)) ||
        voices.find((x) => /en[-_]US/i.test(x.lang)) ||
        voices.find((x) => /en[-_]GB/i.test(x.lang)) ||
        voices.find((x) => /^en/i.test(x.lang));
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
          className="fixed z-[90] bottom-4 right-4 w-[340px] max-w-[calc(100vw-1.5rem)] rounded-2xl overflow-hidden"
          style={{ background: "linear-gradient(160deg,#0b2b24,#04231d 65%,#0b141a)", boxShadow: "0 14px 44px rgba(0,0,0,0.55)", border: "1px solid rgba(255,255,255,0.08)" }}
          initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 24, scale: 0.96 }}
        >
          <div className="p-4 flex flex-col items-center gap-3">
            <div className="w-full text-center text-white/60" style={{ fontSize: 12 }}>
              {supported ? `🔊 voice call · ${mm}:${ss}` : "voice call"}
            </div>

            <div className="relative flex items-center justify-center">
              {active && (
                <motion.span className="absolute rounded-full" style={{ width: 92, height: 92, background: "#00a884", opacity: 0.25 }}
                  animate={{ scale: [1, 1.3, 1], opacity: [0.25, 0, 0.25] }} transition={{ duration: 1.8, repeat: Infinity }} />
              )}
              <div className="relative flex items-center justify-center rounded-full" style={{ width: 78, height: 78, background: "#0b3d34", fontSize: 38 }}>👨🏻‍💻</div>
            </div>

            <div className="text-center">
              <div className="text-white font-semibold" style={{ fontSize: 16 }}>Kushagra&apos;s AI</div>
              <div className="text-white/60" style={{ fontSize: 13 }}>{label}</div>
            </div>

            <div className="w-full text-center overflow-y-auto" style={{ maxHeight: 108 }} data-lenis-prevent>
              {!supported ? (
                <p className="text-white/80" style={{ fontSize: 13 }}>This browser blocks speech recognition — try Chrome, or just type in the chat.</p>
              ) : (
                <>
                  {caption && <p className="text-white/55 italic" style={{ fontSize: 13 }}>“{caption}”</p>}
                  {reply && <p className="text-white mt-1" style={{ fontSize: 14, lineHeight: 1.4 }}>{reply}</p>}
                  {!caption && !reply && <p className="text-white/45" style={{ fontSize: 13 }}>Speak whenever — I&apos;m listening.</p>}
                </>
              )}
            </div>

            <div className="flex items-center gap-4 pt-1">
              <button onClick={toggleMute} disabled={!supported}
                className="flex items-center justify-center rounded-full disabled:opacity-40"
                style={{ width: 48, height: 48, background: muted ? "#fff" : "rgba(255,255,255,0.15)", color: muted ? "#04231d" : "#fff" }}
                aria-label={muted ? "Unmute" : "Mute"}>
                {muted ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
              <button onClick={end} className="flex items-center justify-center rounded-full" style={{ width: 54, height: 54, background: "#f15c6d", color: "#fff" }} aria-label="End call">
                <PhoneOff size={22} />
              </button>
            </div>

            <p className="text-center text-white/40 leading-snug pt-1" style={{ fontSize: 11 }}>
              🔒 Private — nothing is recorded or stored. Speech is handled by your browser.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
