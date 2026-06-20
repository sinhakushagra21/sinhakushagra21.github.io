"use client";

import { CSSProperties, ReactNode } from "react";
import SketchBorder from "./SketchBorder";

interface PaperCardProps {
  children: ReactNode;
  seed?: number;
  /** Slight resting rotation in degrees for a pinned-note feel. */
  rotate?: number;
  /** "card" = white paper, "note" = warm sticky note, "dark" = chalkboard panel. */
  variant?: "card" | "note" | "dark";
  borderColor?: string;
  tape?: boolean;
  draw?: boolean;
  /** Ruled-notebook-paper look: horizontal rule lines + a red margin line. */
  lined?: boolean;
  className?: string;
  style?: CSSProperties;
}

const BG: Record<NonNullable<PaperCardProps["variant"]>, string> = {
  card: "var(--paper-card)",
  note: "var(--paper-card-2)",
  dark: "var(--surface-dark)",
};

/**
 * A sheet of paper: soft fill + hand-drawn ink border + optional tape, tilt, and
 * ruled notebook lines. Parent layout controls sizing; this just styles the surface.
 */
export default function PaperCard({
  children,
  seed = 1,
  rotate = 0,
  variant = "card",
  borderColor,
  tape = false,
  draw = false,
  lined = false,
  className,
  style,
}: PaperCardProps) {
  const ink =
    borderColor ?? (variant === "dark" ? "var(--on-dark)" : "var(--ink)");

  return (
    <div
      className={className}
      style={{
        position: "relative",
        background: BG[variant],
        color: variant === "dark" ? "var(--on-dark)" : "var(--ink)",
        borderRadius: 6,
        boxShadow: "2px 3px 0 rgba(43, 43, 43, 0.06)",
        transform: rotate ? `rotate(${rotate}deg)` : undefined,
        ...style,
      }}
    >
      {tape && (
        <span
          className="tape"
          aria-hidden
          style={{ top: -11, left: "50%", marginLeft: -32, transform: "rotate(-3deg)" }}
        />
      )}

      {lined && (
        <div
          aria-hidden
          style={{ position: "absolute", inset: 0, zIndex: 0, borderRadius: 6, overflow: "hidden", pointerEvents: "none" }}
        >
          {/* ruled horizontal lines */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0.5,
              backgroundImage:
                "repeating-linear-gradient(to bottom, transparent 0, transparent 27px, var(--pencil-soft) 27px, var(--pencil-soft) 28px)",
            }}
          />
          {/* red margin rule */}
          <div
            style={{ position: "absolute", top: 8, bottom: 8, left: 34, width: 1.5, background: "var(--red)", opacity: 0.4 }}
          />
        </div>
      )}

      <SketchBorder seed={seed} color={ink} draw={draw} />

      <div style={{ position: "relative", zIndex: 1, paddingLeft: lined ? 14 : undefined }}>
        {children}
      </div>
    </div>
  );
}
