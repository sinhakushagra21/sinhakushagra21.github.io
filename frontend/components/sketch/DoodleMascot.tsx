"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { mulberry32 } from "@/lib/sketch";
import { usePrefersReducedMotion } from "./useSketch";

/* ── CSS-level roaming — walks the boy left↔right across the board.
   Paused while he's writing so he stands and scribbles. ─────────────────── */
function useContainerRoam(
  containerRef: React.RefObject<HTMLDivElement | null>,
  facingRef: React.MutableRefObject<number>,
  active: boolean,
) {
  const stateRef = useRef({ x: 0, targetX: 0, vx: 0, nextWaypointAt: 0, rand: mulberry32(42) });
  const rafRef = useRef<number>(0);

  const animate = useCallback(() => {
    const s = stateRef.current;
    const now = performance.now() / 1000;

    const parent = containerRef.current?.parentElement;
    const parentW = parent?.clientWidth ?? 0;
    const selfW = containerRef.current?.clientWidth ?? 0;
    const range = Math.max(30, (parentW - selfW) / 2 - 4);

    if (now > s.nextWaypointAt) {
      s.targetX = s.x > 0
        ? -range * (0.6 + s.rand() * 0.4)
        : range * (0.6 + s.rand() * 0.4);
      s.nextWaypointAt = now + 6 + s.rand() * 5;
    }

    const dx = s.targetX - s.x;
    s.vx += dx * 0.0006;
    s.vx *= 0.99;
    s.vx = Math.max(-0.6, Math.min(0.6, s.vx));
    s.x += s.vx;

    if (Math.abs(s.vx) > 0.02) facingRef.current = s.vx > 0 ? 1 : -1;

    const floatY = Math.sin(now * 1.4) * 1.6;
    const tilt = -s.vx * 1.2;

    if (containerRef.current) {
      containerRef.current.style.transform =
        `translateX(${s.x}px) translateY(${-floatY}px) rotate(${tilt}deg)`;
    }
    rafRef.current = requestAnimationFrame(animate);
  }, [containerRef, facingRef]);

  useEffect(() => {
    if (!active) return;
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [animate, active]);
}

function BoySvg({ facingRef, writing, stationary = false }: { facingRef: React.MutableRefObject<number>; writing: boolean; stationary?: boolean }) {
  const [facing, setFacing] = useState(stationary ? -1 : 1);
  useEffect(() => {
    if (stationary) { setFacing(-1); return; } // stand at the right edge, face the board
    if (writing) { setFacing(1); return; } // face the board while writing
    const id = setInterval(() => setFacing(facingRef.current), 200);
    return () => clearInterval(id);
  }, [facingRef, writing, stationary]);

  return (
    <svg
      width="70"
      height="84"
      viewBox="0 0 70 84"
      fill="none"
      aria-hidden
      style={{
        overflow: "visible",
        filter: "url(#sketch-wobble)",
        transform: `scaleX(${facing})`,
        transition: "transform 0.3s ease",
      }}
    >
      {/* hair tuft */}
      <path d="M26 12 Q 30 4, 35 8 Q 40 3, 45 11" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" />
      {/* head */}
      <circle cx="35" cy="19" r="11" stroke="var(--ink)" strokeWidth="2" fill="var(--paper-card)" />
      {/* eyes */}
      <circle cx="31" cy="19" r="1.6" fill="var(--ink)" className="boy-eye" />
      <circle cx="39" cy="19" r="1.6" fill="var(--ink)" className="boy-eye" />
      {/* smile */}
      <path d="M30 24 Q 35 28, 40 24" stroke="var(--ink)" strokeWidth="1.6" strokeLinecap="round" />
      {/* cheeks */}
      <circle cx="27" cy="23" r="1.7" fill="var(--red)" opacity="0.5" />
      <circle cx="43" cy="23" r="1.7" fill="var(--red)" opacity="0.5" />
      {/* body */}
      <path d="M35 30 L 35 56" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" />
      {/* resting (back) arm */}
      <path d="M35 36 L 23 50" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" />
      {/* legs */}
      <path d="M35 56 L 28 73" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" className="boy-leg-l" />
      <path d="M35 56 L 42 73" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" className="boy-leg-r" />

      {/* writing arm + chalk — raised toward the board, scribbles while writing */}
      <g className={`boy-arm ${writing ? "is-writing" : ""}`} style={{ transformOrigin: "35px 35px" }}>
        <path d="M35 35 L 48 23" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" />
        {/* chalk */}
        <path d="M48 23 L 54 17" stroke="#f2efe6" strokeWidth="3.2" strokeLinecap="round" />
      </g>

      {/* chalk-dust marks that flicker on only while writing */}
      {writing && (
        <g className="boy-marks" stroke="#f2efe6" strokeWidth="1.6" strokeLinecap="round" opacity="0.8">
          <path d="M57 13 L 61 10" />
          <path d="M55 18 L 60 16" />
        </g>
      )}

      <style>{`
        @keyframes boyBlink { 0%, 92%, 100% { transform: scaleY(1); } 96% { transform: scaleY(0.1); } }
        .boy-eye { transform-origin: center; transform-box: fill-box; animation: boyBlink 4s infinite; }

        @keyframes legL { 0%,100% { transform: rotate(-7deg); } 50% { transform: rotate(7deg); } }
        @keyframes legR { 0%,100% { transform: rotate(7deg); } 50% { transform: rotate(-7deg); } }
        .boy-leg-l { transform-origin: 35px 56px; transform-box: view-box; animation: legL 0.6s ease-in-out infinite; }
        .boy-leg-r { transform-origin: 35px 56px; transform-box: view-box; animation: legR 0.6s ease-in-out infinite; }

        @keyframes scribble {
          0%   { transform: rotate(-5deg) translate(0px, 0px); }
          25%  { transform: rotate(4deg) translate(1px, -1px); }
          50%  { transform: rotate(-3deg) translate(-1px, 1px); }
          75%  { transform: rotate(5deg) translate(1px, 0px); }
          100% { transform: rotate(-5deg) translate(0px, 0px); }
        }
        .boy-arm.is-writing { animation: scribble 0.4s ease-in-out infinite; }

        @keyframes dust { 0%,100% { opacity: 0.2; } 50% { opacity: 0.9; } }
        .boy-marks { animation: dust 0.5s ease-in-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          .boy-eye, .boy-leg-l, .boy-leg-r, .boy-arm.is-writing, .boy-marks { animation: none; }
        }
      `}</style>
    </svg>
  );
}

/**
 * 2D hand-drawn boy who walks along the board and "writes" the answer with
 * chalk while the assistant is streaming. Hidden under reduced-motion;
 * static (no roaming) on touch / narrow screens.
 */
export default function DoodleMascot({ writing = false, stationary = false }: { writing?: boolean; stationary?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const facingRef = useRef(1);
  const reduced = usePrefersReducedMotion();
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsMobile(window.innerWidth < 768 || navigator.maxTouchPoints > 1);
  }, []);

  // roam only when free-standing; stationary mode (board edge) never roams
  useContainerRoam(containerRef, facingRef, mounted && !reduced && !isMobile && !writing && !stationary);

  if (reduced) return null;

  return (
    <div style={{ width: stationary ? 70 : "100%", height: 84, position: "relative", display: "flex", justifyContent: "center" }}>
      <div ref={containerRef} style={{ width: 70, height: 84, willChange: "transform" }}>
        <BoySvg facingRef={facingRef} writing={writing} stationary={stationary} />
      </div>
    </div>
  );
}
