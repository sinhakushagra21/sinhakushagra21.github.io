"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import ChatPane from "./ChatPane";
import StatusViewer from "./StatusViewer";
import ActivityPanel from "./ActivityPanel";
import { CHATS } from "./data";
import { logEvent } from "@/lib/events";

export default function WhatsAppApp() {
  const [activeId, setActiveId] = useState("ai");
  const [mobilePane, setMobilePane] = useState(false); // mobile: showing conversation vs list
  const [statusOpen, setStatusOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);

  const chat = CHATS.find((c) => c.id === activeId) ?? CHATS[0];

  const openChat = (id: string) => {
    if (id !== activeId && id !== "ai") logEvent("open_chat", id);
    setActiveId(id);
    setMobilePane(true);
  };

  return (
    <div className="wa-app flex overflow-hidden" style={{ height: "100dvh", background: "var(--wa-bg)" }}>
      {/* sidebar / chat list */}
      <div
        className={`${mobilePane ? "hidden" : "flex"} md:flex w-full md:w-[380px] shrink-0 md:border-r`}
        style={{ borderColor: "var(--wa-divider)" }}
      >
        <div className="w-full h-full">
          <Sidebar
            activeId={activeId}
            onSelect={openChat}
            onOpenStatus={() => setStatusOpen(true)}
            onOpenActivity={() => setActivityOpen(true)}
          />
        </div>
      </div>

      <StatusViewer open={statusOpen} onClose={() => setStatusOpen(false)} onChat={() => openChat("ai")} />
      <ActivityPanel open={activityOpen} onClose={() => setActivityOpen(false)} />


      {/* conversation pane */}
      <div className={`${mobilePane ? "flex" : "hidden"} md:flex flex-1 min-w-0`}>
        <div className="w-full h-full">
          <ChatPane
            key={chat.id}
            chat={chat}
            onBack={() => setMobilePane(false)}
            onOpenAI={() => openChat("ai")}
          />
        </div>
      </div>
    </div>
  );
}
