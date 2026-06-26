"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import Experience from "@/components/sections/Experience";
import Projects from "@/components/sections/Projects";
import Skills from "@/components/sections/Skills";
import Education from "@/components/sections/Education";
import Contact from "@/components/sections/Contact";
import SketchDivider from "@/components/sketch/SketchDivider";
import ScrollProgress from "@/components/sketch/ScrollProgress";
import LeaveNote from "@/components/notes/LeaveNote";
import NotesInbox from "@/components/notes/NotesInbox";

export default function Home() {
  return (
    <div className="paper-bg">
      <ScrollProgress />
      <Navbar />
      <LeaveNote />
      <NotesInbox />
      <main className="relative z-10">
        <Hero />
        <div className="relative">
          <SketchDivider seed={11} className="mx-auto max-w-4xl px-4" />
          <Experience />
          <SketchDivider seed={22} className="mx-auto max-w-4xl px-4" />
          <Projects />
          <SketchDivider seed={33} className="mx-auto max-w-4xl px-4" />
          <Skills />
          <SketchDivider seed={44} className="mx-auto max-w-4xl px-4" />
          <Education />
          <SketchDivider seed={55} className="mx-auto max-w-4xl px-4" />
          <Contact />
        </div>
      </main>
      <Footer />
    </div>
  );
}
