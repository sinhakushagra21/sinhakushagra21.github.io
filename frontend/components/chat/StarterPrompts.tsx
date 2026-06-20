"use client";

import { motion } from "framer-motion";

const PROMPTS = [
  { text: "What's your strongest project?", rotate: -2 },
  { text: "How do you design for reliability at scale?", rotate: 1.4 },
  { text: "Walk me through RolloutX", rotate: -1 },
  { text: "What did you ship at Tesla?", rotate: 2 },
  { text: "Open to H1B sponsorship & relocation?", rotate: -1.6 },
  { text: "Why should I interview you?", rotate: 1.2 },
];

interface StarterPromptsProps {
  onSelect: (prompt: string) => void;
  visible: boolean;
}

export default function StarterPrompts({ onSelect, visible }: StarterPromptsProps) {
  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="flex flex-wrap gap-2.5 justify-center"
    >
      {PROMPTS.map((prompt, i) => (
        <motion.button
          key={prompt.text}
          initial={{ opacity: 0, y: 8, rotate: prompt.rotate * 2 }}
          animate={{ opacity: 1, y: 0, rotate: prompt.rotate }}
          transition={{ duration: 0.3, delay: 0.2 + i * 0.05 }}
          whileHover={{ rotate: 0, scale: 1.05, y: -2 }}
          onClick={() => onSelect(prompt.text)}
          className="hand text-sm px-3 py-1.5 cursor-pointer"
          style={{
            border: "2px solid var(--ink)",
            background: "var(--paper-card-2)",
            color: "var(--ink-soft)",
            borderRadius: 4,
            boxShadow: "2px 2px 0 rgba(43,43,43,0.08)",
          }}
        >
          {prompt.text}
        </motion.button>
      ))}
    </motion.div>
  );
}
