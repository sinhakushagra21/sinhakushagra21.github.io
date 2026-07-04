"use client";

import { Search, Pin, BadgeCheck, Globe } from "lucide-react";
import { CHATS, WAChat } from "./data";
import WAAvatar from "./WAAvatar";
import { useLang, LANGS } from "@/lib/i18n";

const NAME_KEYS = ["recruiter", "experience", "projects", "skills", "education", "contact"];

function Avatar({ chat, size = 49 }: { chat: WAChat; size?: number }) {
  return <WAAvatar emoji={chat.avatar} bg={chat.avatarBg} size={size} />;
}

interface SidebarProps {
  activeId: string;
  onSelect: (id: string) => void;
  onOpenStatus: () => void;
  onOpenActivity: () => void;
}

export default function Sidebar({ activeId, onSelect, onOpenStatus, onOpenActivity }: SidebarProps) {
  const { t, lang, setLang } = useLang();
  return (
    <div className="flex flex-col h-full" style={{ background: "var(--wa-panel)" }}>
      {/* header */}
      <div className="flex items-center justify-between px-4 shrink-0" style={{ height: 60, background: "var(--wa-header)" }}>
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenStatus}
            aria-label="View my status"
            className="rounded-full shrink-0"
            style={{ padding: 2, background: "conic-gradient(from 135deg, #00a884, #25d366, #53bdeb, #00a884)" }}
          >
            <WAAvatar emoji="👨‍💻" bg="#0b3d34" size={40} />
          </button>
          <div className="min-w-0">
            <div className="font-semibold truncate" style={{ fontSize: 15 }}>Kushagra Sinha</div>
            <button onClick={onOpenStatus} className="truncate text-left" style={{ fontSize: 12, color: "var(--wa-accent)" }}>
              {t("tapStatus")}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0" style={{ color: "var(--wa-text2)" }} title="Language">
          <Globe size={16} />
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            aria-label="Language"
            className="bg-transparent outline-none cursor-pointer"
            style={{ fontSize: 12.5, color: "var(--wa-text2)" }}
          >
            {LANGS.map((l) => (
              <option key={l.code} value={l.code} style={{ color: "#000" }}>{l.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* search (decorative) */}
      <div className="px-3 py-2 shrink-0">
        <div className="flex items-center gap-3 rounded-lg px-3" style={{ background: "var(--wa-bg)", height: 36 }}>
          <Search size={16} style={{ color: "var(--wa-text2)" }} />
          <span style={{ fontSize: 13, color: "var(--wa-text2)" }}>{t("searchHint")}</span>
        </div>
      </div>

      {/* chat list */}
      <div className="flex-1 overflow-y-auto" data-lenis-prevent>
        {CHATS.map((chat) => {
          const active = chat.id === activeId;
          return (
            <button
              key={chat.id}
              onClick={() => onSelect(chat.id)}
              className="w-full flex items-center gap-3 px-3 text-left transition-colors"
              style={{ height: 72, background: active ? "var(--wa-active)" : "transparent" }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "var(--wa-hover)"; }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
            >
              <Avatar chat={chat} />
              <div className="flex-1 min-w-0 border-b h-full flex flex-col justify-center" style={{ borderColor: "var(--wa-divider)" }}>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium truncate flex items-center gap-1" style={{ fontSize: 15.5 }}>
                    {NAME_KEYS.includes(chat.id) ? t(`n_${chat.id}`) : chat.name}
                    {chat.verified && <BadgeCheck size={15} style={{ color: "var(--wa-accent)" }} />}
                  </span>
                  <span className="shrink-0" style={{ fontSize: 11.5, color: chat.ai ? "var(--wa-accent)" : "var(--wa-text2)" }}>{chat.time}</span>
                </div>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <span className="truncate" style={{ fontSize: 13, color: "var(--wa-text2)" }}>{chat.blurb}</span>
                  {chat.pinned && <Pin size={14} style={{ color: "var(--wa-text2)", transform: "rotate(45deg)" }} />}
                </div>
              </div>
            </button>
          );
        })}
        <button
          onClick={onOpenActivity}
          className="w-full text-center py-6"
          style={{ fontSize: 11.5, color: "var(--wa-text2)" }}
          title="Owner: view activity"
        >
          {t("footer")}
        </button>
      </div>
    </div>
  );
}
