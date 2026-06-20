"use client";

import { CSSProperties, ReactNode } from "react";
import SketchBorder from "./SketchBorder";

interface SpeechBubbleProps {
  children: ReactNode;
  seed?: number;
  /** Which side the little tail points from. */
  tail?: "left" | "right" | "none";
  borderColor?: string;
  background?: string;
  className?: string;
  style?: CSSProperties;
}

/** Hand-drawn speech bubble — a paper card with an ink tail. */
export default function SpeechBubble({
  children,
  seed = 1,
  tail = "left",
  borderColor = "var(--ink)",
  background = "var(--paper-card)",
  className,
  style,
}: SpeechBubbleProps) {
  return (
    <div
      className={className}
      style={{
        position: "relative",
        background,
        borderRadius: 8,
        boxShadow: "2px 3px 0 rgba(43,43,43,0.06)",
        ...style,
      }}
    >
      <SketchBorder seed={seed} color={borderColor} />
      {tail !== "none" && (
        <svg
          aria-hidden
          width="20"
          height="16"
          viewBox="0 0 20 16"
          style={{
            position: "absolute",
            bottom: -12,
            [tail]: 18,
            overflow: "visible",
            filter: "url(#sketch-wobble)",
          }}
        >
          <path
            d={tail === "left" ? "M2 1 L 4 14 L 15 2" : "M18 1 L 16 14 L 5 2"}
            fill={background}
            stroke={borderColor}
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* mask the top stroke so the tail blends into the bubble */}
          <rect
            x={tail === "left" ? 1 : 4}
            y={-2}
            width="15"
            height="3"
            fill={background}
          />
        </svg>
      )}
      {children}
    </div>
  );
}
