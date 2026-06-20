"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { roughEllipsePath } from "@/lib/sketch";
import { usePrefersReducedMotion } from "./useSketch";

interface CircleWordProps {
  seed?: number;
  color?: string;
  strokeWidth?: number;
  draw?: boolean;
  className?: string;
}

/**
 * A hand-drawn loop circling the content of its relative parent.
 *
 * It measures the PARENT element (the word), not its own box — measuring itself
 * would feed back (we set this element's width from the measurement), making the
 * ellipse grow without bound into a giant stray stroke.
 */
export default function CircleWord({
  seed = 1,
  color = "var(--red)",
  strokeWidth = 2,
  draw = true,
  className,
}: CircleWordProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const inView = useInView(ref, { once: true, margin: "-20px" });
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current?.parentElement;
    if (!el) return;
    const update = () => setSize({ width: el.clientWidth, height: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const padX = 10;
  const padY = 6;
  const w = size.width + padX * 2;
  const h = size.height + padY * 2;
  const d = size.width && size.height ? roughEllipsePath(w, h, seed) : "";
  const animate = draw && !reduced;

  return (
    <span
      ref={ref}
      aria-hidden
      className={className}
      style={{
        position: "absolute",
        left: -padX,
        top: -padY,
        width: w,
        height: h,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {d && (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: "visible" }}>
          <motion.path
            d={d}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            initial={animate ? { pathLength: 0 } : false}
            animate={animate ? (inView ? { pathLength: 1 } : { pathLength: 0 }) : { pathLength: 1 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </svg>
      )}
    </span>
  );
}
