"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { usePrefersReducedMotion } from "./useSketch";

type Direction = "right" | "down" | "downRight" | "downLeft";

interface DoodleArrowProps {
  direction?: Direction;
  size?: number;
  color?: string;
  strokeWidth?: number;
  draw?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/* Hand-sketched curved arrows. Each entry: [shaft path, head path]. */
const PATHS: Record<Direction, [string, string]> = {
  right: [
    "M3 16 C 16 11, 30 21, 45 14",
    "M38 9 L 46 14 L 38 19",
  ],
  down: [
    "M16 3 C 11 16, 21 30, 14 45",
    "M9 38 L 14 46 L 19 38",
  ],
  downRight: [
    "M4 5 C 14 14, 14 30, 40 40",
    "M31 38 L 42 41 L 38 30",
  ],
  downLeft: [
    "M44 5 C 34 14, 34 30, 8 40",
    "M17 38 L 6 41 L 10 30",
  ],
};

export default function DoodleArrow({
  direction = "right",
  size = 48,
  color = "var(--red)",
  strokeWidth = 2,
  draw = true,
  className,
  style,
}: DoodleArrowProps) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20px" });
  const reduced = usePrefersReducedMotion();
  const [shaft, head] = PATHS[direction];
  const animate = draw && !reduced;

  return (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden
      className={className}
      style={{ overflow: "visible", filter: "url(#sketch-wobble)", ...style }}
    >
      <motion.path
        d={shaft}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        initial={animate ? { pathLength: 0 } : false}
        animate={animate ? (inView ? { pathLength: 1 } : { pathLength: 0 }) : { pathLength: 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />
      <motion.path
        d={head}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={animate ? { pathLength: 0 } : false}
        animate={animate ? (inView ? { pathLength: 1 } : { pathLength: 0 }) : { pathLength: 1 }}
        transition={{ duration: 0.3, ease: "easeInOut", delay: animate ? 0.4 : 0 }}
      />
    </svg>
  );
}
