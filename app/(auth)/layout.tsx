import React from "react";
import Link from "next/link";
import BrandMark from "@/components/ui/BrandMark";
import Rosette from "@/components/ui/Rosette";
import ThemeToggle from "@/components/ui/ThemeToggle";

/** Auth frame: an engraved brand panel at left (desktop), the form in a banknote frame at right. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-paper text-ink lg:grid lg:grid-cols-12">
      <aside className="fine-lines hidden border-r border-line bg-paper-raised p-10 lg:sticky lg:top-0 lg:col-span-5 lg:flex lg:h-[100dvh] lg:flex-col xl:p-12">
        <Link href="/" aria-label="Countersign home" className="self-start">
          <BrandMark />
        </Link>
        <div className="flex flex-1 items-center justify-center py-10">
          <Rosette seed={1926} variant="hero" draw className="lathe aspect-square w-full max-w-[400px] text-note-ink/60" />
        </div>
        <p className="font-display text-[26px] leading-tight text-ink">Every decision, countersigned.</p>
      </aside>

      <div className="flex min-h-[100dvh] flex-col lg:col-span-7">
        <header className="flex h-16 items-center justify-between border-b border-line px-4 sm:px-6 lg:justify-end lg:border-b-0 lg:px-8">
          <Link href="/" aria-label="Countersign home" className="lg:hidden">
            <BrandMark />
          </Link>
          <ThemeToggle />
        </header>
        <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:pb-16">
          <div className="frame w-full max-w-[420px] px-6 py-8 sm:p-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
