"use client";

import React, { useState } from "react";
import { ArrowClockwise, Checks, CircleNotch, WarningCircle } from "@phosphor-icons/react";
import { useGetNotificationsQuery, useMarkNotificationReadMutation } from "@/lib/api/notificationApi";
import type { NotificationResponse } from "@/lib/api/notificationApi";
import NotificationItem from "@/components/notifications/NotificationItem";
import Rosette from "@/components/ui/Rosette";
import { formatDate } from "@/lib/format";

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

/** "Today", "Yesterday", or "12 Oct 2026", by local calendar day. */
function dayLabel(iso: string, now = new Date()): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return formatDate(iso);
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const days = Math.round((startOf(now) - startOf(d)) / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return formatDate(iso);
}

/** Groups keep the API order (newest first); items of the same day share a group. */
function groupByDay(items: NotificationResponse[]): [string, NotificationResponse[]][] {
  const groups = new Map<string, NotificationResponse[]>();
  for (const n of items) {
    const label = dayLabel(n.created_at);
    const group = groups.get(label);
    if (group) group.push(n);
    else groups.set(label, [n]);
  }
  return [...groups];
}

// ── Filter type ───────────────────────────────────────────────────────────
type ReadFilter = "ALL" | "UNREAD" | "READ";

// ── Empty state ───────────────────────────────────────────────────────────
function EmptyState({ filter }: { filter: ReadFilter }) {
  const messages: Record<ReadFilter, { title: string; sub: string }> = {
    ALL:    { title: "You're all caught up.",     sub: "Notifications appear here when tasks are assigned, submitted, approved or returned." },
    UNREAD: { title: "You're all caught up.",     sub: "You have no unread notifications." },
    READ:   { title: "No read notifications yet.", sub: "Notifications you mark as read appear here." },
  };
  const { title, sub } = messages[filter];

  return (
    <div className="flex items-center gap-5 px-5 py-12">
      <Rosette seed={filter.length * 31} variant="mark" className="h-14 w-14 shrink-0 text-line-strong" />
      <div>
        <p className="font-semibold text-ink">{title}</p>
        <p className="mt-1 max-w-[46ch] text-[14px] text-ink-3">{sub}</p>
      </div>
    </div>
  );
}

// ── Skeleton loader ───────────────────────────────────────────────────────
function NotificationSkeleton() {
  return (
    <div className="flex gap-4 px-5 py-4 animate-pulse">
      <div className="mt-0.5 h-5 w-5 shrink-0 rounded-sm bg-paper-sunk" />
      <div className="flex-1 space-y-2.5">
        <div className="flex justify-between gap-4">
          <div className="h-4 w-56 max-w-[60%] rounded-sm bg-paper-sunk" />
          <div className="h-3.5 w-12 rounded-sm bg-paper-sunk" />
        </div>
        <div className="h-3.5 w-full rounded-sm bg-paper-sunk" />
        <div className="h-3.5 w-28 rounded-sm bg-paper-sunk" />
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

  const summary =
    totalCount === 0
      ? "No notifications yet."
      : unreadCount === 0
        ? `Nothing unread. ${totalCount} notification${totalCount !== 1 ? "s" : ""} on record.`
        : null;

  return (
    <div className="max-w-3xl mx-auto space-y-5">

      {/* ── Summary and mark all ───────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-h-10 flex items-center">
          {isLoading && <div className="h-4 w-44 animate-pulse rounded-sm bg-paper-sunk" />}
          {!isLoading && !isError && (
            <p className="text-ink-2">
              {summary ?? (
                <>
                  <span className="font-semibold text-ink tabular">{unreadCount}</span> unread of{" "}
                  <span className="tabular">{totalCount}</span> notification{totalCount !== 1 ? "s" : ""}.
                </>
              )}
            </p>
          )}
        </div>

        {unreadCount > 0 && !isLoading && !isError && (
          <button
            id="mark-all-read-button"
            onClick={handleMarkAllRead}
            disabled={isMarkingAll || isFetching}
            className="btn btn-secondary self-start sm:self-auto"
          >
            {isMarkingAll ? (
              <>
                <CircleNotch size={16} className="animate-spin" aria-hidden="true" />
                Marking all…
              </>
            ) : (
              <>
                <Checks size={16} aria-hidden="true" />
                Mark all as read
              </>
            )}
          </button>
        )}
      </div>

      {/* ── Mark all error ─────────────────────────────────────────────── */}
      {markAllError && (
        <div role="alert" className="flex items-start gap-3 rounded-sm border border-serial/50 bg-serial-tint p-4 text-[14px]">
          <WarningCircle size={20} className="mt-0.5 shrink-0 text-serial" aria-hidden="true" />
          <div>
            <p className="font-semibold text-ink">Some notifications could not be marked as read</p>
            <p className="mt-0.5 text-ink-2">{markAllError}</p>
          </div>
        </div>
      )}

      {/* ── API Error ──────────────────────────────────────────────────── */}
      {isError && (
        <div role="alert" className="flex items-start gap-3 rounded-sm border border-serial/50 bg-serial-tint p-4 text-[14px]">
          <WarningCircle size={20} className="mt-0.5 shrink-0 text-serial" aria-hidden="true" />
          <div>
            <p className="font-semibold text-ink">Notifications could not be loaded</p>
            <p className="mt-0.5 text-ink-2">{errorMsg}</p>
            <button onClick={() => refetch()} className="btn btn-secondary mt-3 min-h-9">
              <ArrowClockwise size={16} aria-hidden="true" />
              Try again
            </button>
          </div>
        </div>
      )}

      {/* ── Filter: segmented control ──────────────────────────────────── */}
      {!isError && (
        <div role="group" aria-label="Filter notifications" className="flex flex-wrap items-center gap-1">
          {(
            [
              { key: "ALL",    label: "All",    count: totalCount  },
              { key: "UNREAD", label: "Unread", count: unreadCount },
              { key: "READ",   label: "Read",   count: readCount   },
            ] as const
          ).map(({ key, label, count }) => {
            const active = filter === key;
            return (
              <button
                key={key}
                id={`filter-${key.toLowerCase()}`}
                onClick={() => setFilter(key)}
                aria-pressed={active}
                className={`btn btn-ghost min-h-9 px-3 ${active ? "bg-note-tint text-note-ink" : ""}`}
              >
                {label}
                {!isLoading && (
                  <span className={`tabular font-medium ${active ? "text-note-ink" : "text-ink-3"}`}>{count}</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Notifications ledger ───────────────────────────────────────── */}
      <div className="panel overflow-hidden">

        {/* Loading state */}
        {isLoading && (
          <div aria-busy="true" aria-label="Loading notifications">
            <div className="h-9 border-b border-line bg-paper-sunk" />
            <div className="divide-y divide-line">
              {[1, 2, 3, 4, 5].map((i) => (
                <NotificationSkeleton key={i} />
              ))}
            </div>
          </div>
        )}

        {/* Fetching indicator: re-fetching after a mutation */}
        {isFetching && !isLoading && (
          <div className="flex items-center gap-2 border-b border-line px-5 py-2 text-[13px] text-ink-3">
            <CircleNotch size={14} className="animate-spin" aria-hidden="true" />
            <span>Updating…</span>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && filtered.length === 0 && (
          <EmptyState filter={filter} />
        )}

        {/* Notification list, grouped by day */}
        {!isLoading && !isError && filtered.length > 0 && (
          <ol
            className="divide-y divide-line"
            aria-label={`${filter === "ALL" ? "All" : filter === "UNREAD" ? "Unread" : "Read"} notifications`}
          >
            {groupByDay(filtered).map(([label, items]) => (
              <li key={label}>
                <h2 className="caps border-b border-line bg-paper-sunk px-5 py-2.5 text-ink-3">{label}</h2>
                <ol className="divide-y divide-line">
                  {items.map((notification) => (
                    <li key={notification.id}>
                      <NotificationItem notification={notification} />
                    </li>
                  ))}
                </ol>
              </li>
            ))}
          </ol>
        )}
      </div>

      {/* ── Footer note ────────────────────────────────────────────────── */}
      {!isLoading && !isError && totalCount > 0 && (
        <p className="text-center text-[13px] text-ink-3">
          Showing <span className="tabular">{filtered.length}</span> of <span className="tabular">{totalCount}</span> notification{totalCount !== 1 ? "s" : ""}.
          {filter !== "ALL" && (
            <>
              {" "}
              <button onClick={() => setFilter("ALL")} className="rounded-sm font-semibold text-note-ink hover:underline">
                Show all
              </button>
            </>
          )}
        </p>
      )}
    </div>
  );
}
