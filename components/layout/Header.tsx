"use client";

import React, { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { clearAccessToken } from "@/lib/slices/authSlice";
import { useLogoutMutation, useGetMeQuery } from "@/lib/api/authApi";
import { apiSlice, clearProactiveTimer } from "@/lib/api/apiSlice";
import NotificationBadge from "@/components/notifications/NotificationBadge";

// ── Page title map ────────────────────────────────────────────────────────
const PAGE_TITLES: Record<string, string> = {
  "/dashboard":               "Dashboard",
  "/tasks":                   "Tasks",
  "/notifications":           "Notifications",
  "/users":                   "Users",
  "/password-reset-requests": "Password Reset Requests",
  "/departments":             "Departments",
  "/profile":                 "Profile",
};


function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  for (const [route, title] of Object.entries(PAGE_TITLES)) {
    if (route !== "/" && pathname.startsWith(route)) return title;
  }
  return "Office Task & Approval System";
}

// ── Icons ─────────────────────────────────────────────────────────────────
function BellIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );
}

function HamburgerIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}

function ProfileMenuIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────
interface HeaderProps {
  onMenuToggle: () => void;
}

// ── Header ────────────────────────────────────────────────────────────────
export default function Header({ onMenuToggle }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();
  const { data: currentUser } = useGetMeQuery();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const pageTitle = getPageTitle(pathname);

  const fullName = currentUser?.full_name?.trim() || "User";
  const userRole = currentUser?.role || "user";
  const initials = currentUser?.full_name
    ? currentUser.full_name
        .split(" ")
        .map((n) => n[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  // Close dropdown on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setDropdownOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    try {
      await logout().unwrap();
    } catch {
      // Even if the server call fails, clear the local access token
    } finally {
      clearProactiveTimer();
      dispatch(clearAccessToken());
      dispatch(apiSlice.util.resetApiState());
      router.push("/login");
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between h-14 sm:h-16 px-4 sm:px-6">

        {/* Left: Mobile menu toggle + Page title */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Hamburger — only visible on mobile */}
          <button
            id="sidebar-menu-toggle"
            onClick={onMenuToggle}
            aria-label="Open sidebar menu"
            aria-controls="mobile-sidebar"
            className="lg:hidden -ml-1 p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors focus:outline-none shrink-0"
          >
            <HamburgerIcon />
          </button>

          {/* Page title */}
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate">
              {pageTitle}
            </h1>
          </div>
        </div>

        {/* Right: Notifications + User menu */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">

          {/* ── Notification bell — live badge from real API ── */}
          <button
            id="notification-bell-button"
            aria-label="View notifications"
            onClick={() => router.push("/notifications")}
            className="relative w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors focus:outline-none"
          >
            <BellIcon />
            {/*
              NotificationBadge fetches GET /notifications via RTK Query and
              derives the unread count client-side (filter is_read === false).
              Renders nothing when count is 0, a numeric pill otherwise.
            */}
            <NotificationBadge />
          </button>

          {/* User avatar + dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              id="user-menu-button"
              aria-label="Open user menu"
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
              onClick={() => setDropdownOpen((o) => !o)}
              className="flex items-center gap-2 p-1 pr-2 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none group"
            >
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0">
                {initials}
              </div>
              {/* Name + role — hidden on very small screens */}
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-slate-800 leading-tight max-w-[130px] truncate">{fullName}</p>
                <p className="text-[11px] text-slate-500 capitalize">{userRole}</p>
              </div>
              {/* Chevron */}
              <svg
                className={`hidden sm:block w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div
                role="menu"
                aria-labelledby="user-menu-button"
                className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-lg shadow-slate-200/60 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
              >
                {/* User info header */}
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-800 truncate">{fullName}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 capitalize">
                    {userRole} {currentUser ? (currentUser.is_active ? "· Active" : "· Inactive") : ""}
                  </p>
                </div>

                {/* Profile link */}
                <button
                  role="menuitem"
                  onClick={() => { setDropdownOpen(false); router.push("/profile"); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors text-left"
                >
                  <span className="text-slate-400"><ProfileMenuIcon /></span>
                  View Profile
                </button>

                <div className="h-px bg-slate-100 mx-3 my-1" />

                {/* Logout */}
                <button
                  role="menuitem"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left disabled:opacity-60 disabled:cursor-not-allowed rounded-b-2xl"
                >
                  <span><LogoutIcon /></span>
                  {isLoggingOut ? "Signing out..." : "Sign Out"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
