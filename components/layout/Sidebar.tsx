"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Buildings,
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

export default function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: currentUser } = useGetMeQuery();
  const isAdmin = currentUser?.role === "admin";

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
          className={`flex items-center gap-3 rounded-sm px-3 py-2 text-[14px] transition-colors duration-150 ${
            active
              ? "bg-note-tint font-semibold text-note-ink shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--note-ink)_30%,transparent)]"
              : "text-ink-2 hover:bg-paper-sunk hover:text-ink"
          }`}
        >
          <Icon size={19} weight={active ? "fill" : "regular"} className="shrink-0" aria-hidden="true" />
          <span className="truncate">{item.label}</span>
        </Link>
      </li>
    );
  };

  const navContent = (
    <nav aria-label="Main navigation" className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b border-line px-5">
        <Link href="/dashboard" onClick={onClose} aria-label="Countersign dashboard">
          <BrandMark />
        </Link>
      </div>

      <div className="flex-1 space-y-7 overflow-y-auto px-3 py-6">
        <div>
          <p className="caps px-3 pb-2 text-ink-3">Work</p>
          <ul className="space-y-0.5" role="list">{WORK.map(renderItem)}</ul>
        </div>
        {isAdmin && (
          <div>
            <p className="caps px-3 pb-2 text-ink-3">Administration</p>
            <ul className="space-y-0.5" role="list">{ADMIN.map(renderItem)}</ul>
          </div>
        )}
      </div>

      <div className="border-t border-line px-3 py-3">
        <ul role="list">{renderItem({ label: "Profile", href: "/profile", icon: UserCircle })}</ul>
      </div>
    </nav>
  );

  return (
    <>
      {/* Desktop: a fixed column with an engraved fine-line edge */}
      <aside
        aria-label="Application sidebar"
        className="sticky top-0 hidden h-screen w-60 shrink-0 overflow-hidden border-r border-line bg-paper-raised lg:flex lg:flex-col"
      >
        {navContent}
        <span aria-hidden="true" className="fine-lines absolute inset-y-0 right-0 w-1.5 border-l border-line" />
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
        <button onClick={onClose} aria-label="Close sidebar" className="btn btn-ghost absolute right-2 top-3 w-9 min-h-9 px-0">
          <X size={18} />
        </button>
        {navContent}
      </aside>
    </>
  );
}
