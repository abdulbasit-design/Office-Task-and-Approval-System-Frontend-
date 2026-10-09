"use client";

import React, { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { Bell, CaretDown, List, SignOut, UserCircle } from "@phosphor-icons/react";
import { clearAccessToken } from "@/lib/slices/authSlice";
import { useLogoutMutation, useGetMeQuery } from "@/lib/api/authApi";
import { apiSlice, clearProactiveTimer } from "@/lib/api/apiSlice";
import NotificationBadge from "@/components/notifications/NotificationBadge";
import ThemeToggle from "@/components/ui/ThemeToggle";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/tasks/create": "New Task",
  "/tasks": "Tasks",
  "/notifications": "Notifications",
  "/users": "Users",
  "/password-reset-requests": "Password Resets",
  "/departments": "Departments",
  "/profile": "Profile",
};

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  for (const [route, title] of Object.entries(PAGE_TITLES)) {
    if (pathname.startsWith(route)) return title;
  }
  return "Countersign";
}

interface HeaderProps {
  onMenuToggle: () => void;
}

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
    <header className="sticky top-0 z-30 border-b border-line bg-paper">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-2">
          <button
            id="sidebar-menu-toggle"
            onClick={onMenuToggle}
            aria-label="Open sidebar menu"
            aria-controls="mobile-sidebar"
            className="btn btn-ghost -ml-2 w-9 min-h-9 shrink-0 px-0 lg:hidden"
          >
            <List size={20} />
          </button>
          <h1 className="truncate font-display text-[24px] leading-none text-ink">{pageTitle}</h1>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <ThemeToggle />

          <button
            id="notification-bell-button"
            aria-label="View notifications"
            onClick={() => router.push("/notifications")}
            className="btn btn-ghost relative w-9 min-h-9 px-0"
          >
            <Bell size={19} />
            <NotificationBadge />
          </button>

          <div className="relative ml-1" ref={dropdownRef}>
            <button
              id="user-menu-button"
              aria-label="Open user menu"
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
              onClick={() => setDropdownOpen((o) => !o)}
              className="flex items-center gap-2.5 rounded-sm py-1 pl-1 pr-2 transition-colors hover:bg-paper-sunk"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-note-ink/40 bg-note-tint font-display text-[13px] text-note-ink">
                {initials}
              </span>
              <span className="hidden text-left sm:block">
                <span className="block max-w-[140px] truncate text-[13px] font-semibold leading-tight text-ink">{fullName}</span>
                <span className="block text-[12px] capitalize leading-tight text-ink-3">{userRole}</span>
              </span>
              <CaretDown
                size={12}
                weight="bold"
                className={`hidden text-ink-3 transition-transform duration-200 sm:block ${dropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {dropdownOpen && (
              <div
                role="menu"
                aria-labelledby="user-menu-button"
                className="panel absolute right-0 z-50 mt-2 w-56 py-1 shadow-[0_16px_40px_-16px_rgb(var(--shadow-color)/0.4)]"
              >
                <div className="border-b border-line px-4 py-3">
                  <p className="truncate text-[13px] font-semibold text-ink">{fullName}</p>
                  <p className="mt-0.5 text-[12px] capitalize text-ink-3">
                    {userRole}
                    {currentUser ? (currentUser.is_active ? ", active" : ", inactive") : ""}
                  </p>
                </div>
                <button
                  role="menuitem"
                  onClick={() => {
                    setDropdownOpen(false);
                    router.push("/profile");
                  }}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[14px] text-ink-2 transition-colors hover:bg-paper-sunk hover:text-ink"
                >
                  <UserCircle size={17} />
                  View profile
                </button>
                <button
                  role="menuitem"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex w-full items-center gap-2.5 border-t border-line px-4 py-2.5 text-left text-[14px] text-serial transition-colors hover:bg-serial-tint disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <SignOut size={17} />
                  {isLoggingOut ? "Signing out..." : "Sign out"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
