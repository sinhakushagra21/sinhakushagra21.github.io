"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface Lang {
  code: string;
  label: string;
  stt: string; // BCP-47 for speech recognition + TTS
}

export const LANGS: Lang[] = [
  { code: "en", label: "English", stt: "en-US" },
  { code: "es", label: "Español", stt: "es-ES" },
  { code: "hi", label: "हिन्दी", stt: "hi-IN" },
  { code: "fr", label: "Français", stt: "fr-FR" },
  { code: "de", label: "Deutsch", stt: "de-DE" },
];

type Dict = Record<string, string>;

// English is the base; other languages fall back to English for missing keys.
const EN: Dict = {
  searchHint: "Pick a chat to explore →",
  tapStatus: "tap for my status →",
  tagline: "backend / distributed systems · AI",
  footer: "🔒 Built by Kushagra · not actually WhatsApp",
  typeMessage: "Type a message",
  online: "online",
  greeting: "Hey! 👋 I'm Kushagra's AI — ask me anything about my experience, projects, or availability. I answer straight from my notes.",
  tips: "Quick tip 👇 tap 📞 at the top to call me and talk out loud, or the 📎 to grab my résumé, book a call, or tailor my fit to a job.",
  geo: "PS — looks like you're visiting from {place} 👀 it's {time} your time. Thanks for stopping by!",
  q_exp: "Summarize your work experience",
  q_proj: "What's your strongest project?",
  q_reloc: "Open to H1B sponsorship & relocation?",
  q_interview: "Why should I interview you?",
  askAI: "Ask the AI about this",
  scriptedFooter: "This is a scripted thread — tap “Ask the AI” for a real conversation",
  coach: "📞 New! Tap here to call me and talk out loud.",
  recIntro: "Hi! 👋 Two quick things I can do for you as a recruiter — check how I fit a specific role, or set up a screening call. Pick one 👇",
  recFit: "Check my fit for a job",
  recFitSub: "paste a JD → honest, tailored pitch",
  recSched: "Schedule a screening (Google Meet)",
  recSchedSub: "grab a 30-min slot on my calendar",
  callConnecting: "Connecting…",
  callListening: "Listening…",
  callThinking: "Thinking…",
  callSpeaking: "Speaking…",
  callGreeting: "Hi! You're on a call with Kushagra's AI. Ask me anything about my work, projects, or availability.",
  callPrompt: "Speak whenever — I'm listening.",
  callPrivacy: "🔒 Private — nothing is recorded or stored. Speech is handled by your browser.",
  n_recruiter: "For Recruiters",
  n_experience: "Work Experience",
  n_projects: "Projects",
  n_skills: "Skills & Stack",
  n_education: "Education",
  n_contact: "Contact & Links",
};

const ES: Dict = {
  searchHint: "Elige un chat para explorar →",
  tapStatus: "toca para ver mi estado →",
  tagline: "backend / sistemas distribuidos · IA",
  footer: "🔒 Hecho por Kushagra · no es WhatsApp real",
  typeMessage: "Escribe un mensaje",
  online: "en línea",
  greeting: "¡Hola! 👋 Soy la IA de Kushagra — pregúntame lo que quieras sobre mi experiencia, proyectos o disponibilidad. Respondo directamente desde mis notas.",
  tips: "Consejo 👇 toca 📞 arriba para llamarme y hablar en voz alta, o 📎 para ver mi CV, agendar una llamada o adaptar mi perfil a un puesto.",
  geo: "PD — parece que nos visitas desde {place} 👀 son las {time} en tu zona. ¡Gracias por pasar!",
  q_exp: "Resume tu experiencia laboral",
  q_proj: "¿Cuál es tu mejor proyecto?",
  q_reloc: "¿Abierto a patrocinio H1B y reubicación?",
  q_interview: "¿Por qué debería entrevistarte?",
  askAI: "Pregúntale a la IA sobre esto",
  scriptedFooter: "Este es un hilo predefinido — toca “Pregúntale a la IA” para una conversación real",
  coach: "📞 ¡Nuevo! Toca aquí para llamarme y hablar en voz alta.",
  recIntro: "¡Hola! 👋 Dos cosas rápidas como reclutador — ver cómo encajo en un puesto, o agendar una llamada. Elige una 👇",
  recFit: "Ver si encajo en un puesto",
  recFitSub: "pega una oferta → argumento honesto y a medida",
  recSched: "Agendar una entrevista (Google Meet)",
  recSchedSub: "reserva 30 min en mi calendario",
  callConnecting: "Conectando…",
  callListening: "Escuchando…",
  callThinking: "Pensando…",
  callSpeaking: "Hablando…",
  callGreeting: "¡Hola! Estás en una llamada con la IA de Kushagra. Pregúntame lo que quieras sobre mi trabajo, proyectos o disponibilidad.",
  callPrompt: "Habla cuando quieras — te escucho.",
  callPrivacy: "🔒 Privado — no se graba ni se guarda nada. El habla la procesa tu navegador.",
  n_recruiter: "Para Reclutadores",
  n_experience: "Experiencia",
  n_projects: "Proyectos",
  n_skills: "Habilidades",
  n_education: "Educación",
  n_contact: "Contacto",
};

const HI: Dict = {
  searchHint: "एक्सप्लोर करने के लिए चैट चुनें →",
  tapStatus: "मेरा स्टेटस देखने के लिए टैप करें →",
  tagline: "बैकएंड / डिस्ट्रिब्यूटेड सिस्टम्स · AI",
  footer: "🔒 Kushagra ने बनाया · असली WhatsApp नहीं",
  typeMessage: "मैसेज लिखें",
  online: "ऑनलाइन",
  greeting: "नमस्ते! 👋 मैं Kushagra का AI हूँ — मेरे अनुभव, प्रोजेक्ट्स या उपलब्धता के बारे में कुछ भी पूछें। मैं सीधे अपने नोट्स से जवाब देता हूँ।",
  tips: "टिप 👇 ऊपर 📞 दबाकर मुझसे बात करें, या 📎 से मेरा रिज़्यूमे लें, कॉल बुक करें, या किसी जॉब के लिए अपनी फिट जाँचें।",
  geo: "PS — लगता है आप {place} से आए हैं 👀 आपके यहाँ {time} बजे हैं। आने के लिए धन्यवाद!",
  q_exp: "अपना कार्य अनुभव बताएं",
  q_proj: "आपका सबसे मज़बूत प्रोजेक्ट कौन सा है?",
  q_reloc: "H1B स्पॉन्सरशिप और रीलोकेशन के लिए तैयार?",
  q_interview: "मैं आपका इंटरव्यू क्यों लूँ?",
  askAI: "इसके बारे में AI से पूछें",
  scriptedFooter: "यह एक तैयार थ्रेड है — असली बातचीत के लिए “AI से पूछें” दबाएँ",
  coach: "📞 नया! मुझसे बात करने के लिए यहाँ टैप करें।",
  recIntro: "नमस्ते! 👋 रिक्रूटर के तौर पर मैं दो चीज़ें कर सकता हूँ — किसी रोल के लिए मेरी फिट जाँचें, या स्क्रीनिंग कॉल सेट करें। एक चुनें 👇",
  recFit: "किसी जॉब के लिए मेरी फिट जाँचें",
  recFitSub: "JD पेस्ट करें → ईमानदार, अनुकूलित पिच",
  recSched: "स्क्रीनिंग शेड्यूल करें (Google Meet)",
  recSchedSub: "मेरे कैलेंडर पर 30 मिनट बुक करें",
  callConnecting: "कनेक्ट हो रहा है…",
  callListening: "सुन रहा हूँ…",
  callThinking: "सोच रहा हूँ…",
  callSpeaking: "बोल रहा हूँ…",
  callGreeting: "नमस्ते! आप Kushagra के AI के साथ कॉल पर हैं। मेरे काम, प्रोजेक्ट्स या उपलब्धता के बारे में कुछ भी पूछें।",
  callPrompt: "जब चाहें बोलें — मैं सुन रहा हूँ।",
  callPrivacy: "🔒 निजी — कुछ भी रिकॉर्ड या सेव नहीं होता। स्पीच आपके ब्राउज़र में प्रोसेस होती है।",
  n_recruiter: "रिक्रूटर्स के लिए",
  n_experience: "कार्य अनुभव",
  n_projects: "प्रोजेक्ट्स",
  n_skills: "स्किल्स",
  n_education: "शिक्षा",
  n_contact: "संपर्क",
};

const FR: Dict = {
  searchHint: "Choisis une conversation →",
  tapStatus: "appuie pour voir mon statut →",
  tagline: "backend / systèmes distribués · IA",
  footer: "🔒 Fait par Kushagra · pas le vrai WhatsApp",
  typeMessage: "Écris un message",
  online: "en ligne",
  greeting: "Salut ! 👋 Je suis l'IA de Kushagra — demande-moi tout sur mon expérience, mes projets ou ma disponibilité. Je réponds directement d'après mes notes.",
  tips: "Astuce 👇 appuie sur 📞 en haut pour m'appeler et parler à voix haute, ou 📎 pour mon CV, réserver un appel ou adapter mon profil à un poste.",
  geo: "PS — on dirait que tu nous rends visite depuis {place} 👀 il est {time} chez toi. Merci de passer !",
  q_exp: "Résume ton expérience professionnelle",
  q_proj: "Quel est ton meilleur projet ?",
  q_reloc: "Ouvert au parrainage H1B et à la mobilité ?",
  q_interview: "Pourquoi devrais-je te rencontrer ?",
  askAI: "Demander à l'IA",
  scriptedFooter: "Ceci est un fil pré-écrit — appuie sur « Demander à l'IA » pour une vraie conversation",
  coach: "📞 Nouveau ! Appuie ici pour m'appeler et parler à voix haute.",
  recIntro: "Salut ! 👋 Deux choses en tant que recruteur — voir si je corresponds à un poste, ou planifier un appel. Choisis 👇",
  recFit: "Vérifier si je corresponds à un poste",
  recFitSub: "colle une offre → argumentaire honnête et sur mesure",
  recSched: "Planifier un entretien (Google Meet)",
  recSchedSub: "réserve 30 min sur mon agenda",
  callConnecting: "Connexion…",
  callListening: "J'écoute…",
  callThinking: "Je réfléchis…",
  callSpeaking: "Je parle…",
  callGreeting: "Salut ! Tu es en appel avec l'IA de Kushagra. Demande-moi tout sur mon travail, mes projets ou ma disponibilité.",
  callPrompt: "Parle quand tu veux — je t'écoute.",
  callPrivacy: "🔒 Privé — rien n'est enregistré ni stocké. La voix est traitée par ton navigateur.",
  n_recruiter: "Pour les recruteurs",
  n_experience: "Expérience",
  n_projects: "Projets",
  n_skills: "Compétences",
  n_education: "Formation",
  n_contact: "Contact",
};

const DE: Dict = {
  searchHint: "Wähle einen Chat →",
  tapStatus: "tippe für meinen Status →",
  tagline: "Backend / verteilte Systeme · KI",
  footer: "🔒 Gebaut von Kushagra · nicht das echte WhatsApp",
  typeMessage: "Nachricht schreiben",
  online: "online",
  greeting: "Hey! 👋 Ich bin Kushagras KI — frag mich alles zu meiner Erfahrung, meinen Projekten oder meiner Verfügbarkeit. Ich antworte direkt aus meinen Notizen.",
  tips: "Tipp 👇 tippe oben auf 📞, um mich anzurufen und laut zu sprechen, oder 📎 für meinen Lebenslauf, einen Termin oder eine Passung zu einer Stelle.",
  geo: "PS — sieht aus, als besuchst du uns aus {place} 👀 bei dir ist es {time}. Danke fürs Vorbeischauen!",
  q_exp: "Fasse deine Berufserfahrung zusammen",
  q_proj: "Was ist dein stärkstes Projekt?",
  q_reloc: "Offen für H1B-Sponsoring & Umzug?",
  q_interview: "Warum sollte ich dich interviewen?",
  askAI: "Frag die KI dazu",
  scriptedFooter: "Dies ist ein vorgefertigter Thread — tippe auf „Frag die KI“ für ein echtes Gespräch",
  coach: "📞 Neu! Tippe hier, um mich anzurufen und laut zu sprechen.",
  recIntro: "Hallo! 👋 Zwei Dinge als Recruiter — prüfen, wie ich zu einer Stelle passe, oder ein Gespräch vereinbaren. Wähle 👇",
  recFit: "Passung zu einer Stelle prüfen",
  recFitSub: "Stellenanzeige einfügen → ehrlicher, passender Pitch",
  recSched: "Gespräch vereinbaren (Google Meet)",
  recSchedSub: "buche 30 Min. in meinem Kalender",
  callConnecting: "Verbinde…",
  callListening: "Ich höre zu…",
  callThinking: "Ich denke nach…",
  callSpeaking: "Ich spreche…",
  callGreeting: "Hallo! Du bist in einem Anruf mit Kushagras KI. Frag mich alles zu meiner Arbeit, meinen Projekten oder meiner Verfügbarkeit.",
  callPrompt: "Sprich einfach — ich höre zu.",
  callPrivacy: "🔒 Privat — nichts wird aufgezeichnet oder gespeichert. Sprache verarbeitet dein Browser.",
  n_recruiter: "Für Recruiter",
  n_experience: "Berufserfahrung",
  n_projects: "Projekte",
  n_skills: "Fähigkeiten",
  n_education: "Ausbildung",
  n_contact: "Kontakt",
};

const TABLE: Record<string, Dict> = { en: EN, es: ES, hi: HI, fr: FR, de: DE };

interface LangCtx {
  lang: string;
  setLang: (c: string) => void;
  stt: string;
  t: (key: string, vars?: Record<string, string>) => string;
}

const Ctx = createContext<LangCtx>({ lang: "en", setLang: () => {}, stt: "en-US", t: (k) => EN[k] ?? k });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState("en");

  useEffect(() => {
    const saved = localStorage.getItem("wa-lang");
    if (saved && TABLE[saved]) { setLangState(saved); return; }
    const nav = navigator.language?.slice(0, 2);
    if (nav && TABLE[nav]) setLangState(nav);
  }, []);

  const setLang = (c: string) => { setLangState(c); localStorage.setItem("wa-lang", c); };

  const t = (key: string, vars?: Record<string, string>) => {
    let s = TABLE[lang]?.[key] ?? EN[key] ?? key;
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, v);
    return s;
  };

  const stt = LANGS.find((l) => l.code === lang)?.stt ?? "en-US";

  return <Ctx.Provider value={{ lang, setLang, stt, t }}>{children}</Ctx.Provider>;
}

export const useLang = () => useContext(Ctx);
