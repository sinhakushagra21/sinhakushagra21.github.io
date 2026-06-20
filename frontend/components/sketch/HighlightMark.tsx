import { CSSProperties, ReactNode } from "react";

/** Highlighter swipe behind inline text (uses the .highlight-mark utility). */
export default function HighlightMark({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span className={`highlight-mark ${className}`} style={style}>
      {children}
    </span>
  );
}
