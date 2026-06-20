"use client";

import { Fragment } from "react";
import { motion } from "framer-motion";
import SketchBorder from "./SketchBorder";

/**
 * A hand-drawn pipeline diagram: labelled sketch boxes joined by ink arrows,
 * each box drawing itself in with a staggered reveal. Wraps responsively.
 */
export default function ArchDiagram({ steps, seed = 1 }: { steps: string[]; seed?: number }) {
  return (
    <motion.div
      className="flex flex-wrap items-center gap-x-2 gap-y-3"
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.1 } } }}
    >
      {steps.map((s, i) => (
        <Fragment key={s}>
          {i > 0 && (
            <motion.span
              aria-hidden
              className="hand text-lg leading-none"
              style={{ color: "var(--navy)" }}
              variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
            >
              →
            </motion.span>
          )}
          <motion.span
            className="relative hand inline-block text-sm px-3 py-1.5"
            style={{ color: "var(--ink-soft)" }}
            variants={{
              hidden: { opacity: 0, y: 6, scale: 0.96 },
              show: { opacity: 1, y: 0, scale: 1 },
            }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <SketchBorder seed={seed + i * 7} color="var(--navy)" strokeWidth={1.6} />
            {s}
          </motion.span>
        </Fragment>
      ))}
    </motion.div>
  );
}
