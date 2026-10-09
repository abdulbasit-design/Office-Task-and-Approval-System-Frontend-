"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, Bell, Checks } from "@phosphor-icons/react";
import { useGetNotificationsQuery, useMarkNotificationReadMutation } from "@/lib/api/notificationApi";
import type { NotificationResponse } from "@/lib/api/notificationApi";
import NotificationBadge from "./NotificationBadge";
import { formatRelativeTime, getTypeMeta } from "./NotificationItem";
import CloseOnEscape from "@/components/ui/CloseOnEscape";
import Rosette from "@/components/ui/Rosette";
import Serial from "@/components/ui/Serial";

const SHOWN = 6;

/** Header bell: recent notifications in a dropdown, with a way through to the full list. */
export default function NotificationsMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: notifications = [], isLoading } = useGetNotificationsQuery();
  const [markRead] = useMarkNotificationReadMutation();
  const [open, setOpen] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const recent = [...notifications]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, SHOWN);
  const unread = notifications.filter((n) => !n.is_read);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // Opening a notification marks it read, then follows it to its task
  async function openItem(n: NotificationResponse) {
    setOpen(false);
    if (!n.is_read) markRead(n.id).unwrap().catch(() => {});
    if (n.task_id) router.push(`/tasks/${n.task_id}`);
  }

  async function markAll() {
    setMarkingAll(true);
    try {
      await Promise.all(unread.map((n) => markRead(n.id).unwrap()));
    } catch {
      // individual failures leave those items unread; the list shows the truth
    } finally {
      setMarkingAll(false);
    }
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        id="notification-bell-button"
        type="button"
        aria-label={unread.length ? `Notifications, ${unread.length} unread` : "Notifications"}
        aria-expanded={open}
        aria-controls="notifications-menu"
        onClick={() => setOpen((o) => !o)}
        className={`btn btn-ghost relative w-9 min-h-9 px-0 ${open || pathname === "/notifications" ? "bg-paper-sunk text-ink" : ""}`}
      >
        <Bell size={19} weight={open ? "fill" : "regular"} />
        <NotificationBadge />
      </button>

      {open && (
        <div
          id="notifications-menu"
          role="dialog"
          aria-label="Notifications"
          className="menu-in panel fixed inset-x-3 top-16 z-50 overflow-hidden shadow-[0_20px_50px_-20px_rgb(var(--shadow-color)/0.45)] sm:absolute sm:inset-x-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-[400px]"
        >
          <CloseOnEscape onClose={() => setOpen(false)} />

          <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
            <div>
              <h2 className="font-display text-[20px] leading-tight text-ink">Notifications</h2>
              <p className="text-[12px] text-ink-3">{unread.length ? `${unread.length} unread` : "All caught up"}</p>
            </div>
            {unread.length > 0 && (
              <button type="button" onClick={markAll} disabled={markingAll} className="btn btn-ghost min-h-8 px-2 text-[13px]">
                <Checks size={15} /> {markingAll ? "Marking..." : "Mark all as read"}
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-3 p-4" aria-busy="true">
              {[0, 1, 2].map((i) => <div key={i} className="h-12 animate-pulse bg-paper-sunk" />)}
            </div>
          ) : recent.length === 0 ? (
            <div className="flex items-center gap-4 px-4 py-8">
              <Rosette seed={42} variant="mark" className="h-12 w-12 shrink-0 text-line-strong" />
              <div>
                <p className="font-semibold text-ink">You&apos;re all caught up.</p>
                <p className="text-[13px] text-ink-3">Assignments, submissions and decisions will appear here.</p>
              </div>
            </div>
          ) : (
            <ul className="max-h-[min(420px,60vh)] divide-y divide-line overflow-y-auto">
              {recent.map((n, i) => {
                const { icon: TypeIcon, tone } = getTypeMeta(n.type);
                return (
                  <li key={n.id} className="rise" style={{ "--i": i } as React.CSSProperties}>
                    <button
                      type="button"
                      onClick={() => openItem(n)}
                      className={`group flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-paper-sunk ${n.is_read ? "" : "bg-paper-raised"}`}
                    >
                      <TypeIcon size={18} className={`mt-0.5 shrink-0 ${tone}`} aria-hidden="true" />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-3">
                          <span className={`truncate text-[14px] ${n.is_read ? "text-ink-2" : "font-semibold text-ink"}`}>{n.title}</span>
                          <span className="shrink-0 text-[12px] text-ink-3 tabular">{formatRelativeTime(n.created_at)}</span>
                        </span>
                        <span className="mt-0.5 line-clamp-2 block text-[13px] text-ink-3">{n.message}</span>
                        {n.task_id && <Serial id={n.task_id} className="mt-1" />}
                      </span>
                      {!n.is_read && <span className="sr-only">Unread</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="group flex items-center justify-center gap-1.5 border-t border-line bg-paper-sunk px-4 py-3 text-[14px] font-semibold text-note-ink hover:underline"
          >
            View all notifications <ArrowRight size={14} weight="bold" className="nudge" />
          </Link>
        </div>
      )}
    </div>
  );
}
