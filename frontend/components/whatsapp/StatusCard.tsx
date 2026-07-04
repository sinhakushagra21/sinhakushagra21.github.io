"use client";

import { useEffect, useRef, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const INTERVAL = 5000;

type Ping = { ok: boolean; ms: number };

export default function StatusCard() {
  const [pings, setPings] = useState<Ping[]>([]);
  const [checking, setChecking] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let active = true;
    const ping = async () => {
      setChecking(true);
      const t0 = performance.now();
      let ok = false;
      try {
        const r = await fetch(`${API}/health`, { cache: "no-store" });
        ok = r.ok;
      } catch {
        ok = false;
      }
      const ms = Math.round(performance.now() - t0);
      if (!active) return;
      setPings((p) => [...p.slice(-23), { ok, ms }]);
      setChecking(false);
      timer.current = setTimeout(ping, INTERVAL);
    };
    ping();
    return () => { active = false; if (timer.current) clearTimeout(timer.current); };
  }, []);

  const last = pings[pings.length - 1];
  const okCount = pings.filter((p) => p.ok).length;
  const uptime = pings.length ? Math.round((okCount / pings.length) * 100) : 0;
  const avg = okCount ? Math.round(pings.filter((p) => p.ok).reduce((a, p) => a + p.ms, 0) / okCount) : 0;

  const state = !last ? "checking" : !last.ok ? "down" : last.ms > 1500 ? "slow" : "healthy";
  const color = state === "healthy" ? "#00d26a" : state === "slow" ? "#e8a55a" : state === "down" ? "#f15c6d" : "#8696a0";
  const label = state === "healthy" ? "Healthy" : state === "slow" ? "Slow (cold start?)" : state === "down" ? "Unreachable" : "Checking…";

  const maxMs = Math.max(120, ...pings.map((p) => p.ms));

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6" data-lenis-prevent>
      <div className="mx-auto w-full max-w-md rounded-xl p-5" style={{ background: "var(--wa-panel)", border: "1px solid var(--wa-divider)" }}>
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            {state === "healthy" && <span className="absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping" style={{ background: color }} />}
            <span className="relative inline-flex rounded-full h-3 w-3" style={{ background: color }} />
          </span>
          <span className="font-semibold" style={{ fontSize: 17 }}>{label}</span>
          {checking && <span style={{ fontSize: 12, color: "var(--wa-text2)" }}>pinging…</span>}
        </div>

        <p className="mt-1" style={{ fontSize: 13, color: "var(--wa-text2)" }}>
          Live health check on my FastAPI backend — a real request every {INTERVAL / 1000}s.
        </p>

        <div className="grid grid-cols-3 gap-3 mt-4 text-center">
          {[
            { k: "Latency", v: last ? `${last.ms} ms` : "—" },
            { k: "Avg", v: avg ? `${avg} ms` : "—" },
            { k: "Uptime", v: pings.length ? `${uptime}%` : "—" },
          ].map((s) => (
            <div key={s.k} className="rounded-lg py-3" style={{ background: "var(--wa-in)" }}>
              <div className="font-semibold" style={{ fontSize: 18 }}>{s.v}</div>
              <div style={{ fontSize: 11.5, color: "var(--wa-text2)" }}>{s.k}</div>
            </div>
          ))}
        </div>

        {/* latency history bars */}
        <div className="flex items-end gap-1 mt-5 h-16">
          {pings.map((p, i) => (
            <div key={i} className="flex-1 rounded-sm" title={`${p.ms} ms`} style={{ height: `${Math.max(6, (p.ms / maxMs) * 100)}%`, background: p.ok ? "var(--wa-accent)" : "#f15c6d", opacity: 0.85 }} />
          ))}
          {pings.length === 0 && <div style={{ fontSize: 12, color: "var(--wa-text2)" }}>collecting samples…</div>}
        </div>
        <div className="text-right mt-1" style={{ fontSize: 11, color: "var(--wa-text2)" }}>latency over last {pings.length} checks</div>

        <p className="mt-4" style={{ fontSize: 12, color: "var(--wa-text2)" }}>
          {state === "slow" ? "First hit after idle is slow — free-tier cold start spinning up. It warms up after a request." : "Endpoint: /health · this whole page is served by that same backend."}
        </p>
      </div>
    </div>
  );
}
