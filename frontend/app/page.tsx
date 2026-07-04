"use client";

import WhatsAppApp from "@/components/whatsapp/WhatsAppApp";
import { LangProvider } from "@/lib/i18n";

export default function Home() {
  return (
    <LangProvider>
      <WhatsAppApp />
    </LangProvider>
  );
}
