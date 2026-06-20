"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import ChatContainer from "@/components/chat/ChatContainer";
import ScribbleUnderline from "@/components/sketch/ScribbleUnderline";
import DoodleArrow from "@/components/sketch/DoodleArrow";
import VisitorNote from "@/components/sketch/VisitorNote";
import MarginDoodles from "@/components/sketch/MarginDoodles";

export default function Hero() {
  const ref = useRef<HTMLElement>(null);

  return (
    <section
      ref={ref}
      id="home"
      className="relative px-4 pt-24 pb-20 overflow-hidden"
      style={{ minHeight: "calc(100vh - 64px)" }}
    >
      <MarginDoodles />

      <div
        className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-[0.78fr_1.22fr] gap-10 lg:gap-12 items-center"
        style={{ minHeight: "calc(100vh - 150px)" }}
      >
        {/* ── LEFT: handwritten intro ── */}
        <div className="text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 flex flex-wrap items-center gap-2 justify-center lg:justify-start"
          >
            <span
              className="hand inline-flex items-center gap-2 px-4 py-1.5 text-sm"
              style={{
                background: "var(--paper-card-2)",
                color: "var(--ink-soft)",
                border: "2px solid var(--ink)",
                borderRadius: 4,
                fontWeight: 700,
                boxShadow: "2px 2px 0 rgba(43,43,43,0.1)",
                transform: "rotate(-3deg)",
              }}
            >
              <span style={{ color: "var(--navy)" }}>●</span> available august 2026
            </span>
            <span
              className="hand inline-flex items-center gap-1.5 px-4 py-1.5 text-sm"
              style={{
                background: "var(--paper-card-2)",
                color: "var(--ink-soft)",
                border: "2px solid var(--ink)",
                borderRadius: 4,
                fontWeight: 700,
                boxShadow: "2px 2px 0 rgba(43,43,43,0.1)",
                transform: "rotate(2deg)",
              }}
            >
              🌎 open to relocation
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="display text-6xl md:text-7xl xl:text-8xl leading-[0.95]"
            style={{ color: "var(--ink)" }}
          >
            Hey,
            <br className="hidden lg:block" /> I&apos;m{" "}
            <span className="relative inline-block" style={{ color: "var(--red)" }}>
              Kushagra
              <ScribbleUnderline seed={314} />
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hand mt-6 text-xl md:text-2xl leading-relaxed"
            style={{ color: "var(--ink-soft)" }}
          >
            Backend engineer with 4 years shipping{" "}
            <br className="hidden lg:block" />
            distributed systems, payments &amp; AI tooling.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-4"
          >
            <VisitorNote />
          </motion.div>

          {/* arrow toward the board: right on desktop, down on mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-8 flex items-center justify-center lg:justify-start gap-2"
            style={{ color: "var(--red)" }}
          >
            <span className="hand text-lg" style={{ color: "var(--ink-faint)" }}>
              ask my notebook anything
            </span>
            <span className="hidden lg:inline-block">
              <DoodleArrow direction="right" size={44} color="var(--red)" />
            </span>
            <span className="lg:hidden">
              <DoodleArrow direction="down" size={36} color="var(--red)" />
            </span>
          </motion.div>
        </div>

        {/* ── RIGHT: the chalkboard chat — tall rectangle, pushed right ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="w-full lg:ml-auto"
          style={{ height: "min(66vh, 540px)", maxWidth: 760 }}
        >
          <ChatContainer />
        </motion.div>
      </div>

      {/* scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none"
        style={{ color: "var(--ink-faint)" }}
      >
        <span className="hand text-sm">scroll to explore</span>
        <DoodleArrow direction="down" size={30} color="var(--ink-faint)" />
      </motion.div>
    </section>
  );
}
