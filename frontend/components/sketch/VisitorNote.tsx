"use client";

import { useEffect, useState } from "react";

/**
 * A friendly handwritten note that greets the visitor with their approximate
 * city (via IP geolocation) and their own local time. Purely client-side and
 * display-only — nothing is stored. Fails silently to a plain greeting if the
 * geolocation lookup is blocked or unavailable.
 *
 * SSR-safe: server and first client render both show empty place/time (filled
 * after mount), so there's no hydration mismatch.
 */
export default function VisitorNote() {
  const [place, setPlace] = useState<string | null>(null);
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const fmt = () =>
      new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setTime(fmt());
    const id = setInterval(() => setTime(fmt()), 30_000);

    let active = true;
    (async () => {
      // 1) same-origin Vercel geo — survives privacy browsers (Brave/uBlock)
      try {
        const r = await fetch("/api/geo");
        if (r.ok) {
          const d = await r.json();
          if (active && (d.city || d.country)) {
            setPlace(d.city && d.country ? `${d.city}, ${d.country}` : d.city || d.country);
            return;
          }
        }
      } catch {
        /* ignore, try fallback */
      }
      // 2) third-party fallback (works on non-blocking browsers / localhost)
      try {
        const r = await fetch("https://ipwho.is/");
        const d = await r.json();
        if (active && d?.success !== false && (d.city || d.country)) {
          setPlace(d.city && d.country ? `${d.city}, ${d.country}` : d.city || d.country);
        }
      } catch {
        /* geolocation blocked — just greet without a place */
      }
    })();

    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  return (
    <p
      className="hand text-base"
      style={{ color: "var(--ink-faint)" }}
      aria-live="polite"
    >
      <span aria-hidden>👋</span>{" "}
      {place ? `hi there, visitor from ${place}` : "hi there, visitor"}
      {time && ` — it's ${time} where you are`}
    </p>
  );
}
