import type { Metadata } from "next";
import { Nunito, Caveat, Kalam, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@vercel/analytics/next";
import SmoothScroll from "@/components/providers/SmoothScroll";
import SketchDefs from "@/components/sketch/SketchDefs";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  display: "swap",
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const kalam = Kalam({
  variable: "--font-kalam",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kushagra Sinha — Backend Engineer",
  description:
    "Backend software engineer with 4 years of production experience in distributed systems, AI tooling, and payments infrastructure. Graduating MS Northeastern, July 2026.",
  openGraph: {
    title: "Kushagra Sinha — Backend Engineer",
    description:
      "Ask my AI assistant anything about my experience at Tesla, Qualcomm, Zomato, and Bluestone.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${nunito.variable} ${caveat.variable} ${kalam.variable} ${jetbrains.variable}`}
    >
      <body className="min-h-full antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <SketchDefs />
          <SmoothScroll />
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
