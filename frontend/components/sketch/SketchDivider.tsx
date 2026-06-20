"use client";

import { roughDividerPath } from "@/lib/sketch";
import { useElementSize } from "./useSketch";

/** A wobbly hand-drawn horizontal rule. */
export default function SketchDivider({
  seed = 1,
  color = "var(--pencil)",
  strokeWidth = 1.6,
  className,
}: {
  seed?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
}) {
  const { ref, width } = useElementSize<HTMLDivElement>();
  const h = 8;
  const d = width ? roughDividerPath(width, seed, { h }) : "";

  return (
    <div ref={ref} aria-hidden className={className} style={{ height: h, width: "100%" }}>
      {d && (
        <svg width="100%" height={h} viewBox={`0 0 ${width} ${h}`} preserveAspectRatio="none" style={{ overflow: "visible" }}>
          <path
            d={d}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      )}
    </div>
  );
}
