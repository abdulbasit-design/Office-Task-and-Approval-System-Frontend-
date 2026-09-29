"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

/**
 * AppShell — the authenticated application frame.
 *
 * Layout:
 *   ┌──────────┬────────────────────────────────┐
 *   │          │  Header (sticky top)           │
 *   │ Sidebar  ├────────────────────────────────┤
 *   │ (fixed)  │  main > {children}             │
 *   │          │                                │
 *   └──────────┴────────────────────────────────┘
 *
 * - Desktop (≥ lg): sidebar is always visible as a fixed left column.
 * - Mobile (< lg):  sidebar is hidden behind a slide-in drawer,
 *                   toggled by the hamburger button in Header.
 *
 * Children (page content) are rendered inside a scrollable main area.
 * The AppShell itself does not contain any auth logic — it relies on
 * the existing Redux auth state and the dashboard layout.
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* ── Sidebar ──────────────────────────────────────────────── */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {/* ── Right Column: Header + Page Content ──────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Sticky header with mobile menu toggle */}
        <Header onMenuToggle={() => setMobileSidebarOpen((o) => !o)} />

        {/* Scrollable page content area */}
        <main
          id="main-content"
          className="flex-1 overflow-y-auto"
          role="main"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
