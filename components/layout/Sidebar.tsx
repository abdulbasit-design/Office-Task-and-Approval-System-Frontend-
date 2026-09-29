"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// ── Nav Item Type ─────────────────────────────────────────────────────
interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

// ── Icons ─────────────────────────────────────────────────────────────
function DashboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function TasksIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  );
}

function NotificationsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function DepartmentsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}

function ProfileIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

// ── Brand Logo ────────────────────────────────────────────────────────
function BrandLogo() {
  return (
    <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
      <svg width="18" height="18" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="5.5" y="4.5" width="17" height="19.5" rx="3.5" fill="#1e293b" />
        <rect x="9" y="3" width="10" height="3.5" rx="1.75" fill="#475569" />
        <rect x="11" y="4" width="6" height="1.5" rx="0.75" fill="#94a3b8" />
        <line x1="9" y1="10.5" x2="16" y2="10.5" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="9" y1="14" x2="14" y2="14" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="18.5" cy="19.5" r="4" fill="#2563eb" stroke="#1e293b" strokeWidth="1.5" />
        <path d="M16.8 19.5L17.9 20.6L20.2 18.3" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

// ── Nav Items Config ──────────────────────────────────────────────────
const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard",     href: "/dashboard",     icon: <DashboardIcon     className="w-5 h-5" /> },
  { label: "Tasks",         href: "/tasks",         icon: <TasksIcon         className="w-5 h-5" /> },
  { label: "Notifications", href: "/notifications", icon: <NotificationsIcon className="w-5 h-5" /> },
  { label: "Users",         href: "/users",         icon: <UsersIcon         className="w-5 h-5" /> },
  { label: "Departments",   href: "/departments",   icon: <DepartmentsIcon   className="w-5 h-5" /> },
  { label: "Profile",       href: "/profile",       icon: <ProfileIcon       className="w-5 h-5" /> },
];

// ── Props ─────────────────────────────────────────────────────────────
interface SidebarProps {
  /** Whether the mobile drawer is open */
  mobileOpen: boolean;
  /** Close the mobile drawer */
  onClose: () => void;
}

// ── Sidebar ───────────────────────────────────────────────────────────
export default function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const navContent = (
    <nav aria-label="Main navigation" className="flex flex-col h-full">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100">
        <BrandLogo />
        <div>
          <p className="text-[11px] font-bold text-slate-800 tracking-tight leading-tight">Office Task &amp;</p>
          <p className="text-[11px] font-bold text-slate-800 tracking-tight leading-tight">Approval System</p>
        </div>
      </div>

      {/* Nav Items */}
      <ul className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto" role="list">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onClose}
                aria-current={isActive ? "page" : undefined}
                className={`
                  group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-150 ease-in-out
                  ${isActive
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }
                `}
              >
                <span className={`shrink-0 transition-colors ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"}`}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70 shrink-0" aria-hidden="true" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Footer tag */}
      <div className="px-5 py-4 border-t border-slate-100">
        <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
          v1.0 · Internal Use Only
        </p>
      </div>
    </nav>
  );

  return (
    <>
      {/* ── Desktop Sidebar (always visible ≥ lg) ─────────────────── */}
      <aside
        aria-label="Application sidebar"
        className="hidden lg:flex flex-col w-60 shrink-0 bg-white border-r border-slate-200/80 h-screen sticky top-0 overflow-hidden"
      >
        {navContent}
      </aside>

      {/* ── Mobile Drawer Backdrop ─────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          aria-hidden="true"
          onClick={onClose}
        />
      )}

      {/* ── Mobile Drawer ──────────────────────────────────────────── */}
      <aside
        id="mobile-sidebar"
        aria-label="Application sidebar"
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200
          transform transition-transform duration-300 ease-in-out lg:hidden
          flex flex-col overflow-hidden
          ${mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
        `}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close sidebar"
          className="absolute top-3.5 right-3 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {navContent}
      </aside>
    </>
  );
}
