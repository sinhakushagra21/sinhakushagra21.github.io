"use client";

import { useEffect, useRef, useState } from "react";

const HINTS = [
  "ask about Tesla",
  "ask about FitGen.AI",
  "ask about system design",
  "ask about visa & H1B",
  "ask why I'd be a great hire",
];

const TYPE_MS = 55;
const DELETE_MS = 28;
const PAUSE_END_MS = 1400;
const PAUSE_START_MS = 220;

export default function TypewriterHint() {
  const [text, setText] = useState("");
  const [reduced, setReduced] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (reduced) {
      setText(HINTS[0]);
      return;
    }

    let hintIdx = 0;
    let charIdx = 0;
    let phase: "typing" | "pausing-end" | "deleting" | "pausing-start" = "typing";

    const tick = () => {
      const target = HINTS[hintIdx];
      let delay = TYPE_MS;

      if (phase === "typing") {
        charIdx++;
        setText(target.slice(0, charIdx));
        if (charIdx >= target.length) {
          phase = "pausing-end";
          delay = PAUSE_END_MS;
        }
      } else if (phase === "pausing-end") {
        phase = "deleting";
        delay = DELETE_MS;
      } else if (phase === "deleting") {
        charIdx--;
        setText(target.slice(0, charIdx));
        if (charIdx <= 0) {
          phase = "pausing-start";
          hintIdx = (hintIdx + 1) % HINTS.length;
          delay = PAUSE_START_MS;
        } else {
          delay = DELETE_MS;
        }
      } else {
        phase = "typing";
        delay = TYPE_MS;
      }

      timerRef.current = setTimeout(tick, delay);
    };

    timerRef.current = setTimeout(tick, 400);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [reduced]);

  return (
    <div className="text-center px-4" aria-live="polite">
      <span className="display text-4xl md:text-5xl" style={{ color: "var(--ink-faint)" }}>
        {text}
      </span>
      {!reduced && (
        <span
          className="inline-block ml-0.5 w-[2px] align-middle"
          style={{
            height: "1.1em",
            background: "var(--red)",
            animation: "tw-caret 1s steps(2) infinite",
          }}
          aria-hidden
        />
      )}
      <style jsx>{`
        @keyframes tw-caret {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
