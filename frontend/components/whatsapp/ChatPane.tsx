"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Search, MoreVertical, Phone, MessageCircle } from "lucide-react";
import { WAChat } from "./data";
import Bubble from "./Bubble";
import AIChat from "./AIChat";
import StatusCard from "./StatusCard";

interface ChatPaneProps {
  chat: WAChat;
  onBack: () => void;
  onOpenAI: () => void;
  onCall: () => void;
}

export default function ChatPane({ chat, onBack, onOpenAI, onCall }: ChatPaneProps) {
  return (
    <div className="flex flex-col h-full">
      {/* header */}
      <div className="flex items-center gap-3 px-3 shrink-0 z-10" style={{ height: 60, background: "var(--wa-header)" }}>
        <button className="md:hidden" onClick={onBack} aria-label="Back" style={{ color: "var(--wa-text)" }}>
          <ArrowLeft size={22} />
        </button>
        <div className="flex items-center justify-center rounded-full shrink-0" style={{ width: 40, height: 40, background: chat.avatarBg, fontSize: 17, fontWeight: 600, color: "#fff" }}>
          {chat.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold truncate" style={{ fontSize: 15.5 }}>{chat.name}</div>
          <div className="truncate" style={{ fontSize: 12.5, color: chat.ai ? "var(--wa-accent)" : "var(--wa-text2)" }}>
            {chat.header}
          </div>
        </div>
        <div className="flex items-center gap-5" style={{ color: "var(--wa-text2)" }}>
          {chat.ai ? (
            <button onClick={onCall} aria-label="Voice call with the AI" title="Voice call" className="transition-colors hover:text-[color:var(--wa-accent)]">
              <Phone size={19} />
            </button>
          ) : (
            <Phone size={18} className="hidden sm:block" />
          )}
          <Search size={18} className="hidden sm:block" />
          <MoreVertical size={18} />
        </div>
      </div>

      {/* body */}
      <div className="relative flex-1 flex flex-col min-h-0 wa-wallpaper">
        {chat.ai ? (
          <AIChat />
        ) : chat.id === "status" ? (
          <StatusCard />
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4 space-y-2" data-lenis-prevent>
              <div className="text-center mb-3">
                <span className="inline-block rounded-lg px-3 py-1" style={{ background: "#182229", color: "var(--wa-text2)", fontSize: 12 }}>
                  {chat.header}
                </span>
              </div>
              {(chat.messages ?? []).map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.25, delay: Math.min(i * 0.06, 0.6) }}
                >
                  <Bubble from={m.from} text={m.text} link={m.link} time="" />
                </motion.div>
              ))}
              <div className="pt-3 flex justify-center">
                <button
                  onClick={onOpenAI}
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 transition-colors"
                  style={{ fontSize: 13.5, background: "var(--wa-accent)", color: "#04231d", fontWeight: 600 }}
                >
                  <MessageCircle size={16} /> Ask the AI about this
                </button>
              </div>
            </div>
            {/* read-only footer */}
            <div className="flex items-center justify-center px-3 py-3 shrink-0" style={{ background: "var(--wa-header)", color: "var(--wa-text2)", fontSize: 13 }}>
              This is a scripted thread — tap “Ask the AI” for a real conversation
            </div>
          </>
        )}
      </div>
    </div>
  );
}
