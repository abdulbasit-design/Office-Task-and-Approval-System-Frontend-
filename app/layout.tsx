import type { Metadata } from "next";
import Script from "next/script";
import { Archivo, Azeret_Mono, Bodoni_Moda } from "next/font/google";
import "./globals.css";
import StoreProvider from "@/lib/providers";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  axes: ["opsz"],
  style: ["normal", "italic"],
});

const azeret = Azeret_Mono({
  variable: "--font-azeret",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Countersign",
  description: "Assign work, review submissions, and countersign every decision on the record.",
};

// Runs before paint so a pinned theme or a folded sidebar never flashes the other state.
const themeScript = `try{var d=document.documentElement,t=localStorage.getItem("theme");if(t==="light"||t==="dark")d.dataset.theme=t;if(localStorage.getItem("sidebar")==="collapsed")d.dataset.sidebar="collapsed"}catch(e){}`;

const directionContract = `<!--
THESIS: Every decision is a note of value: numbered, engraved, countersigned. Refuses the slate-card SaaS dashboard of stat tiles and pill badges.
OWN-WORLD: Neutral grey security-paper ground, charcoal intaglio ink for text and actions, flat bronze only for seals and the submitted state, green only for approved, numbering red for serials, overdue and rejection. Square 2px frames with double engraved rules, generated guilloche rosettes, Bodoni Moda engraved caps, Archivo text, Azeret Mono serials.
STORY: A manager sees what awaits their countersignature, decides with the note and trail on one screen, and watches the seal print.
FIRST VIEWPORT: App: Bodoni greeting, summary and dateline over one denomination strip; the countersign queue owns the main column. Landing: the tagline "Every decision, countersigned." at left under the engraved Countersign wordmark, a live-drawn specimen note at right, Sign in as the primary action.
AMENDED: 2026-10-09 to the owner's decisions: name Countersign, Charcoal + Bronze palette, the approved landing hero.
FORM: Treasury Note, grounded list #3, seed 07c05de7.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
-->`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${bodoni.variable} ${azeret.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <div hidden dangerouslySetInnerHTML={{ __html: directionContract }} />
        <Script id="theme-init" strategy="beforeInteractive">{themeScript}</Script>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
