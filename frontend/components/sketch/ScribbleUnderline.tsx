"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { roughUnderlinePath } from "@/lib/sketch";
import { useElementSize, usePrefersReducedMotion } from "./useSketch";

interface ScribbleUnderlineProps {
  seed?: number;
  color?: string;
  strokeWidth?: number;
  draw?: boolean;
  className?: string;
}

/**
 * A hand-drawn underline that stretches under inline text.
 * Wrap text in a relative inline-block and drop this in as a child.
 */
export default function ScribbleUnderline({
  seed = 1,
  color = "var(--red)",
  strokeWidth = 2.4,
  draw = true,
  className,
}: ScribbleUnderlineProps) {
  const { ref, width } = useElementSize<HTMLSpanElement>();
  const viewRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(viewRef, { once: true, margin: "-30px" });
  const reduced = usePrefersReducedMotion();

  const h = 10;
  const d = width ? roughUnderlinePath(width, seed, { h }) : "";
  const animate = draw && !reduced;

  return (
    <span
      ref={(node) => {
        ref.current = node;
        viewRef.current = node;
      }}
      aria-hidden
      className={className}
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: -6,
        height: h,
        pointerEvents: "none",
      }}
    >
      {d && (
        <svg width="100%" height={h} viewBox={`0 0 ${width} ${h}`} preserveAspectRatio="none" style={{ overflow: "visible" }}>
          <motion.path
            d={d}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            initial={animate ? { pathLength: 0 } : false}
            animate={animate ? (inView ? { pathLength: 1 } : { pathLength: 0 }) : { pathLength: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>
      )}
    </span>
  );
}
