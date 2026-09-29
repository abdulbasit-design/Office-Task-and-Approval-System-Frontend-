"use client";

import React, { useState } from "react";
import { useGetNotificationsQuery, useMarkNotificationReadMutation } from "@/lib/api/notificationApi";
import NotificationItem from "@/components/notifications/NotificationItem";

// ── Helpers ───────────────────────────────────────────────────────────────
function extractError(err: unknown): string {
  if (err && typeof err === "object") {
    if ("data" in err) {
      const d = (err as { data: { detail?: string } }).data;
      return d?.detail ?? "Failed to load notifications.";
    }
    if ("error" in err) return (err as { error: string }).error;
  }
  return "An unexpected error occurred.";
}

// ── Filter type ───────────────────────────────────────────────────────────
type ReadFilter = "ALL" | "UNREAD" | "READ";

// ── Empty state ───────────────────────────────────────────────────────────
function EmptyState({ filter }: { filter: ReadFilter }) {
  const messages: Record<ReadFilter, { title: string; sub: string }> = {
    ALL:    { title: "No notifications yet",      sub: "Notifications appear here when tasks are assigned, submitted, approved, or rejected." },
    UNREAD: { title: "All caught up!",            sub: "You have no unread notifications." },
    READ:   { title: "No read notifications yet", sub: "Notifications you have marked as read will appear here." },
  };
  const { title, sub } = messages[filter];

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-4">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
        <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-bold text-slate-700">{title}</p>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">{sub}</p>
      </div>
    </div>
  );
}

// ── Skeleton loader ───────────────────────────────────────────────────────
function NotificationSkeleton() {
  return (
    <div className="flex gap-4 px-5 py-4 border-l-4 border-l-slate-200 animate-pulse">
      <div className="w-9 h-9 rounded-full bg-slate-200 shrink-0 mt-0.5" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-slate-200 rounded w-48" />
        <div className="h-3 bg-slate-100 rounded w-full" />
        <div className="h-3 bg-slate-100 rounded w-3/4" />
        <div className="h-3 bg-slate-100 rounded w-20" />
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const {
    data: notifications = [],
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = useGetNotificationsQuery();

  const [markAllRead, { isLoading: isMarkingAll }] = useMarkNotificationReadMutation();
  const [filter, setFilter] = useState<ReadFilter>("ALL");
  const [markAllError, setMarkAllError] = useState<string | null>(null);

  // ── Derived counts ────────────────────────────────────────────────────
  const totalCount  = notifications.length;
  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const readCount   = totalCount - unreadCount;

  // ── Filtered list ─────────────────────────────────────────────────────
  const filtered = notifications.filter((n) => {
    if (filter === "UNREAD") return !n.is_read;
    if (filter === "READ")   return n.is_read;
    return true;
  });

  // ── Mark all unread as read ───────────────────────────────────────────
  /**
   * No bulk endpoint exists. We fire individual PATCH requests for each
   * unread notification. RTK Query cache invalidation on each response
   * keeps the list count up to date.
   */
  async function handleMarkAllRead() {
    setMarkAllError(null);
    const unread = notifications.filter((n) => !n.is_read);
    if (unread.length === 0) return;

    try {
      await Promise.all(unread.map((n) => markAllRead(n.id).unwrap()));
    } catch (err) {
      setMarkAllError(extractError(err));
    }
  }

  // ── Error message ─────────────────────────────────────────────────────
  const errorMsg = extractError(error);

  return (
    <div className="max-w-3xl mx-auto space-y-5">

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          {!isLoading && !isError && (
            <p className="text-xs text-slate-500 mt-0.5">
              {totalCount} total · {unreadCount} unread
            </p>
          )}
        </div>

        {/* Mark all as read */}
        {unreadCount > 0 && !isLoading && !isError && (
          <button
            id="mark-all-read-button"
            onClick={handleMarkAllRead}
            disabled={isMarkingAll || isFetching}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isMarkingAll ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Marking all…
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Mark all as read
              </>
            )}
          </button>
        )}
      </div>

      {/* ── Mark all error ─────────────────────────────────────────────── */}
      {markAllError && (
        <div role="alert" className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
          <svg className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>{markAllError}</span>
        </div>
      )}

      {/* ── API Error ──────────────────────────────────────────────────── */}
      {isError && (
        <div role="alert" className="flex items-start gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-sm">
          <svg className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="font-semibold text-rose-800">Failed to load notifications</p>
            <p className="text-rose-600 text-xs mt-0.5">{errorMsg}</p>
            <button
              onClick={() => refetch()}
              className="mt-2 text-xs font-semibold text-rose-700 underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* ── Filter tabs ────────────────────────────────────────────────── */}
      {!isError && (
        <div className="flex items-center gap-1 p-1 bg-slate-100/80 rounded-xl w-fit">
          {(
            [
              { key: "ALL",    label: "All",    count: totalCount  },
              { key: "UNREAD", label: "Unread", count: unreadCount },
              { key: "READ",   label: "Read",   count: readCount   },
            ] as const
          ).map(({ key, label, count }) => (
            <button
              key={key}
              id={`filter-${key.toLowerCase()}`}
              onClick={() => setFilter(key)}
              aria-pressed={filter === key}
              className={`
                flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors
                ${filter === key
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
                }
              `}
            >
              {label}
              {!isLoading && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  filter === key ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-500"
                }`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* ── Notifications card ─────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">

        {/* Loading state */}
        {isLoading && (
          <div className="divide-y divide-slate-100">
            {[1, 2, 3, 4, 5].map((i) => (
              <NotificationSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Fetching overlay — re-fetching after mutation */}
        {isFetching && !isLoading && (
          <div className="px-5 py-2 bg-blue-50/60 border-b border-blue-100 flex items-center gap-2">
            <svg className="animate-spin h-3.5 w-3.5 text-blue-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-[11px] text-blue-600 font-medium">Updating…</span>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && filtered.length === 0 && (
          <EmptyState filter={filter} />
        )}

        {/* Notification list */}
        {!isLoading && !isError && filtered.length > 0 && (
          <ol
            className="divide-y divide-slate-100"
            aria-label={`${filter === "ALL" ? "All" : filter === "UNREAD" ? "Unread" : "Read"} notifications`}
          >
            {filtered.map((notification) => (
              <li key={notification.id}>
                <NotificationItem notification={notification} />
              </li>
            ))}
          </ol>
        )}
      </div>

      {/* ── Footer note ────────────────────────────────────────────────── */}
      {!isLoading && !isError && totalCount > 0 && (
        <p className="text-[11px] text-slate-400 text-center">
          Showing {filtered.length} of {totalCount} notification{totalCount !== 1 ? "s" : ""}
          {filter !== "ALL" && <> · <button onClick={() => setFilter("ALL")} className="text-blue-500 hover:underline">Show all</button></>}
        </p>
      )}
    </div>
  );
}
