"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Search, MoreVertical, Phone, MessageCircle, X } from "lucide-react";
import { WAChat } from "./data";
import Bubble from "./Bubble";
import AIChat from "./AIChat";
import RecruiterPane from "./RecruiterPane";
import WAAvatar from "./WAAvatar";
import { useLang } from "@/lib/i18n";

const NAME_KEYS = ["recruiter", "experience", "projects", "skills", "education", "contact"];

interface ChatPaneProps {
  chat: WAChat;
  onBack: () => void;
  onOpenAI: () => void;
  onCall: () => void;
}

export default function ChatPane({ chat, onBack, onOpenAI, onCall }: ChatPaneProps) {
  const { t } = useLang();
  const [hintSeen, setHintSeen] = useState(true);
  useEffect(() => { setHintSeen(localStorage.getItem("seen-call-hint-2") === "1"); }, []);
  function callWithHint() {
    localStorage.setItem("seen-call-hint-2", "1");
    setHintSeen(true);
    onCall();
  }
  function dismissHint() {
    localStorage.setItem("seen-call-hint-2", "1");
    setHintSeen(true);
  }

  return (
    <div className="flex flex-col h-full">
      {/* header */}
      <div className="relative flex items-center gap-3 px-3 shrink-0 z-10" style={{ height: 60, background: "var(--wa-header)" }}>
        <button className="md:hidden" onClick={onBack} aria-label="Back" style={{ color: "var(--wa-text)" }}>
          <ArrowLeft size={22} />
        </button>
        <WAAvatar emoji={chat.avatar} bg={chat.avatarBg} size={40} />
        <div className="flex-1 min-w-0">
          <div className="font-semibold truncate" style={{ fontSize: 15.5 }}>
            {NAME_KEYS.includes(chat.id) ? t(`n_${chat.id}`) : chat.name}
          </div>
          <div className="truncate" style={{ fontSize: 12.5, color: chat.ai ? "var(--wa-accent)" : "var(--wa-text2)" }}>
            {chat.ai ? t("online") : chat.header}
          </div>
        </div>
        <div className="flex items-center gap-5" style={{ color: "var(--wa-text2)" }}>
          {chat.ai ? (
            <button onClick={callWithHint} aria-label="Voice call with the AI" title="Voice call — talk to me out loud" className="relative transition-colors hover:text-[color:var(--wa-accent)]">
              <Phone size={19} />
              {!hintSeen && (
                <span className="absolute -top-1.5 -right-1.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "var(--wa-accent)" }} />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: "var(--wa-accent)" }} />
                </span>
              )}
            </button>
          ) : (
            <Phone size={18} className="hidden sm:block" />
          )}
          <Search size={18} className="hidden sm:block" />
          <MoreVertical size={18} />
        </div>

        {/* first-visit coach mark pointing at the call button */}
        {chat.ai && !hintSeen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.7, type: "spring", stiffness: 300, damping: 22 }}
            className="absolute z-30"
            style={{ top: 60, right: 8, maxWidth: 236 }}
          >
            <div className="relative rounded-2xl px-3.5 py-2.5" style={{ background: "var(--wa-accent)", color: "#04231d", boxShadow: "0 10px 28px rgba(0,0,0,0.45)" }}>
              <span className="absolute -top-1.5 right-16 w-3 h-3 rotate-45" style={{ background: "var(--wa-accent)" }} />
              <div className="flex items-start gap-2">
                <span style={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.35 }}>{t("coach")}</span>
                <button onClick={dismissHint} aria-label="Dismiss" className="shrink-0 opacity-70 hover:opacity-100" style={{ color: "#04231d" }}>
                  <X size={15} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* body */}
      <div className="relative flex-1 flex flex-col min-h-0 wa-wallpaper">
        {chat.ai ? (
          <AIChat />
        ) : chat.id === "recruiter" ? (
          <RecruiterPane />
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
                  <MessageCircle size={16} /> {t("askAI")}
                </button>
              </div>
            </div>
            {/* read-only footer */}
            <div className="flex items-center justify-center px-3 py-3 shrink-0 text-center" style={{ background: "var(--wa-header)", color: "var(--wa-text2)", fontSize: 13 }}>
              {t("scriptedFooter")}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
