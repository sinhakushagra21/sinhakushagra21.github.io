"use client";

import { motion, useInView } from "framer-motion";
import { useMemo, useRef } from "react";
import { roughRectPath } from "@/lib/sketch";
import { useElementSize, usePrefersReducedMotion } from "./useSketch";

/* Snap measured size to a grid so a growing element (e.g. a streaming chat
   bubble) only regenerates the wobbly path when it crosses a step — the SVG
   stretches to fill in between. Stops the border from shivering per token. */
const STEP = 16;
const snap = (n: number) => (n ? Math.max(STEP, Math.round(n / STEP) * STEP) : 0);

interface SketchBorderProps {
  seed?: number;
  color?: string;
  strokeWidth?: number;
  rough?: number;
  /** Draw the border on with a path animation when scrolled into view. */
  draw?: boolean;
  className?: string;
}

/**
 * Absolutely-positioned hand-drawn rectangle that fills its positioned parent.
 * The parent must be `position: relative`. Renders nothing until measured
 * (client only) — by design, to avoid SSR hydration mismatches. Because it's
 * an overlay it causes no layout shift when it pops in.
 */
export default function SketchBorder({
  seed = 1,
  color = "var(--ink)",
  strokeWidth = 1.8,
  rough = 2,
  draw = false,
  className,
}: SketchBorderProps) {
  const { ref, width, height } = useElementSize<HTMLDivElement>();
  const viewRef = useRef<HTMLDivElement>(null);
  const inView = useInView(viewRef, { once: true, margin: "-40px" });
  const reduced = usePrefersReducedMotion();

  const qw = snap(width);
  const qh = snap(height);
  const d = useMemo(
    () => (qw && qh ? roughRectPath(qw, qh, seed, { rough }) : ""),
    [qw, qh, seed, rough],
  );
  const animate = draw && !reduced;

  return (
    <div
      ref={(node) => {
        ref.current = node;
        viewRef.current = node;
      }}
      aria-hidden
      className={className}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      {d && (
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${qw} ${qh}`}
          preserveAspectRatio="none"
          style={{ overflow: "visible", display: "block" }}
        >
          <motion.path
            d={d}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            initial={animate ? { pathLength: 0 } : false}
            animate={animate ? (inView ? { pathLength: 1 } : { pathLength: 0 }) : { pathLength: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>
      )}
    </div>
  );
}
