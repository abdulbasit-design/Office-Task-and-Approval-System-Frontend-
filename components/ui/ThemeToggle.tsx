"use client";

import React, { useState, useSyncExternalStore } from "react";
import { Desktop, Moon, Sun } from "@phosphor-icons/react";

type Theme = "system" | "light" | "dark";

const ORDER: Theme[] = ["system", "light", "dark"];
const LABEL: Record<Theme, string> = { system: "System theme", light: "Light theme", dark: "Dark theme" };
const listeners = new Set<() => void>();

function read(): Theme {
  try {
    const t = localStorage.getItem("theme");
    return t === "light" || t === "dark" ? t : "system";
  } catch {
    return "system";
  }
}

function apply(theme: Theme) {
  try {
    if (theme === "system") localStorage.removeItem("theme");
    else localStorage.setItem("theme", theme);
  } catch {
    // storage blocked: the choice still applies for this page view
  }
  if (theme === "system") delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = theme;
  listeners.forEach((l) => l());
}

/** Apply the theme; where supported, the new one washes across the page (CSS in globals.css). */
function switchTo(theme: Theme) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (typeof document.startViewTransition !== "function" || reduce) apply(theme);
  else document.startViewTransition(() => apply(theme));
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Cycles System, Light, Dark. The icon shows the current setting. */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, read, () => "system" as Theme);
  const [turned, setTurned] = useState(false);
  const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length];
  const Icon = theme === "light" ? Sun : theme === "dark" ? Moon : Desktop;

  return (
    <button
      type="button"
      onClick={() => {
        setTurned(true);
        switchTo(next);
      }}
      aria-label={`${LABEL[theme]}. Switch to ${LABEL[next].toLowerCase()}`}
      title={`${LABEL[theme]} (click for ${LABEL[next].toLowerCase()})`}
      className={`btn btn-ghost w-9 min-h-9 px-0 ${className}`}
    >
      {/* Re-keyed per theme so the quarter turn replays on each click, never on load */}
      <Icon key={theme} size={18} weight="regular" className={turned ? "icon-turn" : undefined} />
    </button>
  );
}
