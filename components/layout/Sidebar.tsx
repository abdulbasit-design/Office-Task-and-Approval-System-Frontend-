"use client";

import React, { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Buildings,
  CaretLeft,
  CaretRight,
  ClipboardText,
  House,
  Key,
  UserCircle,
  UsersThree,
  X,
} from "@phosphor-icons/react";
import { useGetMeQuery } from "@/lib/api/authApi";
import BrandMark from "@/components/ui/BrandMark";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface SidebarProps {
  /** Whether the mobile drawer is open */
  mobileOpen: boolean;
  /** Close the mobile drawer */
  onClose: () => void;
}

const WORK: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: House },
  { label: "Tasks", href: "/tasks", icon: ClipboardText },
  { label: "Notifications", href: "/notifications", icon: Bell },
];

const ADMIN: NavItem[] = [
  { label: "Users", href: "/users", icon: UsersThree },
  { label: "Departments", href: "/departments", icon: Buildings },
  { label: "Password Resets", href: "/password-reset-requests", icon: Key },
];

// Folded state lives on <html data-sidebar> (set before paint in the root
// layout) so the rail never jumps on load; React only mirrors it.
const railListeners = new Set<() => void>();
const readCollapsed = () => document.documentElement.dataset.sidebar === "collapsed";
function setCollapsed(collapsed: boolean) {
  if (collapsed) document.documentElement.dataset.sidebar = "collapsed";
  else delete document.documentElement.dataset.sidebar;
  try {
    if (collapsed) localStorage.setItem("sidebar", "collapsed");
    else localStorage.removeItem("sidebar");
  } catch {
    // storage blocked: the fold still applies for this page view
  }
  railListeners.forEach((l) => l());
}
function subscribeRail(listener: () => void) {
  railListeners.add(listener);
  return () => {
    railListeners.delete(listener);
  };
}

const typing = (el: EventTarget | null) =>
  el instanceof HTMLElement && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName));

export default function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: currentUser } = useGetMeQuery();
  const isAdmin = currentUser?.role === "admin";
  const collapsed = useSyncExternalStore(subscribeRail, readCollapsed, () => false);

  // A folded rail peeks open over the page on hover or keyboard focus
  const [peek, setPeek] = useState(false);
  const peekTimer = useRef<number | undefined>(undefined);
  const schedulePeek = (open: boolean, delay: number) => {
    window.clearTimeout(peekTimer.current);
    peekTimer.current = window.setTimeout(() => setPeek(open), delay);
  };
  const toggle = () => {
    window.clearTimeout(peekTimer.current);
    setPeek(false);
    setCollapsed(!readCollapsed());
  };

  // "[" folds and unfolds, as in most workspace tools
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "[" || e.metaKey || e.ctrlKey || e.altKey || typing(e.target)) return;
      e.preventDefault();
      window.clearTimeout(peekTimer.current);
      setPeek(false);
      setCollapsed(!readCollapsed());
    };
    document.addEventListener("keydown", onKey);
    const timer = peekTimer;
    return () => {
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(timer.current);
    };
  }, []);

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  const renderItem = (item: NavItem) => {
    const active = isActive(item.href);
    const Icon = item.icon;
    return (
      <li key={item.href}>
        <Link
          href={item.href}
          onClick={onClose}
          aria-current={active ? "page" : undefined}
          className={`flex items-center gap-3 rounded-sm px-3 py-2 text-[14px] transition-colors duration-150 collapsed:w-11 ${
            active
              ? "bg-note-tint font-semibold text-note-ink shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--note-ink)_22%,transparent)]"
              : "text-ink-2 hover:bg-paper-sunk hover:text-ink"
          }`}
        >
          <Icon size={19} weight={active ? "fill" : "regular"} className="shrink-0" aria-hidden="true" />
          <span className="fold-label truncate">{item.label}</span>
        </Link>
      </li>
    );
  };

  const group = (label: string, items: NavItem[]) => (
    <div>
      <div className="relative px-3 pb-2">
        <p className="fold-label caps whitespace-nowrap text-ink-3">{label}</p>
        <span aria-hidden="true" className="fold-rule absolute inset-x-1 top-[7px] border-t border-line-strong" />
      </div>
      <ul className="space-y-0.5" role="list">{items.map(renderItem)}</ul>
    </div>
  );

  // Icons sit at a fixed x in both states (rail centre is 36px), so folding
  // narrows the panel around them instead of shuffling the layout.
  const navContent = (
    <nav aria-label="Main navigation" className="flex h-full w-full min-w-60 flex-col">
      <div className="flex h-16 shrink-0 items-center border-b border-line px-5">
        <Link href="/dashboard" onClick={onClose} aria-label="Countersign dashboard">
          <BrandMark />
        </Link>
      </div>

      <div className="flex-1 space-y-7 overflow-y-auto overflow-x-hidden px-[14px] py-6">
        {group("Work", WORK)}
        {isAdmin && group("Administration", ADMIN)}
      </div>

      <div className="border-t border-line px-[14px] py-3">
        <ul role="list">{renderItem({ label: "Profile", href: "/profile", icon: UserCircle })}</ul>
        <button
          type="button"
          onClick={toggle}
          aria-controls="desktop-sidebar"
          aria-expanded={!collapsed}
          aria-keyshortcuts="["
          className="mt-0.5 hidden w-full items-center gap-3 rounded-sm px-3 py-2 text-[14px] text-ink-3 transition-colors hover:bg-paper-sunk hover:text-ink lg:flex"
        >
          {collapsed ? <CaretRight size={19} aria-hidden="true" /> : <CaretLeft size={19} aria-hidden="true" />}
          <span className="fold-label flex flex-1 items-center justify-between whitespace-nowrap">
            {collapsed ? "Keep open" : "Fold sidebar"}
            <kbd className="rounded-sm border border-line px-1.5 font-mono text-[11px] text-ink-3">[</kbd>
          </span>
        </button>
      </div>
    </nav>
  );

  return (
    <>
      {/* Desktop: the footprint narrows to a rail; the panel inside can peek open over the page */}
      <aside
        id="desktop-sidebar"
        data-rail
        data-peek={collapsed && peek ? "" : undefined}
        aria-label="Application sidebar"
        onMouseEnter={() => collapsed && schedulePeek(true, 160)}
        onMouseLeave={() => schedulePeek(false, 240)}
        onFocus={() => collapsed && schedulePeek(true, 0)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) schedulePeek(false, 0);
        }}
        className="group/rail sticky top-0 z-40 hidden h-screen w-60 shrink-0 transition-[width] duration-[460ms] ease-[var(--ease-out-expo)] folded:w-[72px] motion-reduce:transition-none lg:block"
      >
        <div className="absolute inset-y-0 left-0 w-60 border-r border-line bg-paper-raised transition-[width,box-shadow] duration-[460ms] ease-[var(--ease-out-expo)] collapsed:w-[72px] group-data-[peek]/rail:shadow-[18px_0_44px_-18px_rgb(var(--shadow-color)/0.4)] motion-reduce:transition-none">
          <div className="h-full overflow-hidden">{navContent}</div>

          {/* The engraved edge is the handle: hover reveals the tab, click folds or unfolds */}
          <span aria-hidden="true" className="fine-lines absolute inset-y-0 right-0 w-1.5 border-l border-line transition-colors group-hover/rail:border-line-strong" />
          <button
            type="button"
            onClick={toggle}
            tabIndex={-1}
            aria-hidden="true"
            title={collapsed ? (peek ? "Keep open  [" : "Unfold  [") : "Fold  ["}
            className="absolute right-0 top-1/2 z-10 flex h-12 w-5 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-sm border border-line-strong bg-paper-raised text-ink-3 opacity-0 shadow-[0_6px_16px_-8px_rgb(var(--shadow-color)/0.45)] transition-[opacity,color,transform] duration-200 hover:text-ink group-hover/rail:opacity-100"
          >
            {collapsed ? <CaretRight size={12} weight="bold" /> : <CaretLeft size={12} weight="bold" />}
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-ink/40 lg:hidden" aria-hidden="true" onClick={onClose} />
      )}
      <aside
        id="mobile-sidebar"
        aria-label="Application sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col overflow-hidden border-r border-line bg-paper-raised transition-transform duration-300 ease-[var(--ease-out-expo)] lg:hidden ${
          mobileOpen ? "translate-x-0 shadow-[12px_0_40px_-12px_rgb(var(--shadow-color)/0.35)]" : "-translate-x-full"
        }`}
      >
        <button onClick={onClose} aria-label="Close sidebar" className="btn btn-ghost absolute right-2 top-3 z-10 w-9 min-h-9 px-0">
          <X size={18} />
        </button>
        {navContent}
      </aside>
    </>
  );
}
