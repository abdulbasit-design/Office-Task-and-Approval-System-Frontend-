"use client";

import React from "react";
import Link from "next/link";
import type { NotificationResponse } from "@/lib/api/notificationApi";
import { useMarkNotificationReadMutation } from "@/lib/api/notificationApi";

// ─────────────────────────────────────────────────────────────────────────────
// Notification type config — maps backend type strings to UI
// ─────────────────────────────────────────────────────────────────────────────
interface TypeMeta {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  accentClass: string;
}

function getTypeMeta(type: string): TypeMeta {
  switch (type) {
    case "TASK_ASSIGNED":
      return {
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
        accentClass: "border-l-blue-400",
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        ),
      };
    case "TASK_SUBMITTED":
    case "TASK_RESUBMITTED":
      return {
        iconBg: "bg-indigo-100",
        iconColor: "text-indigo-600",
        accentClass: "border-l-indigo-400",
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      };
    case "TASK_APPROVED":
      return {
        iconBg: "bg-emerald-100",
        iconColor: "text-emerald-600",
        accentClass: "border-l-emerald-400",
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
              d="M5 13l4 4L19 7" />
          </svg>
        ),
      };
    case "TASK_REJECTED":
      return {
        iconBg: "bg-rose-100",
        iconColor: "text-rose-600",
        accentClass: "border-l-rose-400",
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
              d="M6 18L18 6M6 6l12 12" />
          </svg>
        ),
      };
    case "PASSWORD_RESET_REQUEST":
      return {
        iconBg: "bg-amber-100",
        iconColor: "text-amber-600",
        accentClass: "border-l-amber-400",
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
              d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        ),
      };
    default:
      return {
        iconBg: "bg-slate-100",
        iconColor: "text-slate-500",
        accentClass: "border-l-slate-300",
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        ),
      };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function formatRelativeTime(iso: string): string {
  try {
    const now = Date.now();
    const then = new Date(iso).getTime();
    const diffMs = now - then;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr  = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffSec < 60)  return "Just now";
    if (diffMin < 60)  return `${diffMin}m ago`;
    if (diffHr < 24)   return `${diffHr}h ago`;
    if (diffDay < 7)   return `${diffDay}d ago`;

    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function formatAbsoluteTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// NotificationItem
// ─────────────────────────────────────────────────────────────────────────────
interface NotificationItemProps {
  notification: NotificationResponse;
}

export default function NotificationItem({ notification }: NotificationItemProps) {
  const [markRead, { isLoading: isMarking }] = useMarkNotificationReadMutation();
  const meta = getTypeMeta(notification.type);

  const handleMarkRead = async () => {
    if (notification.is_read || isMarking) return;
    try {
      await markRead(notification.id).unwrap();
    } catch {
      // Silently ignore — the list will re-fetch on next poll
    }
  };

  return (
    <article
      className={`
        relative flex gap-4 px-5 py-4 transition-colors
        border-l-4 ${meta.accentClass}
        ${notification.is_read
          ? "bg-white hover:bg-slate-50/50"
          : "bg-blue-50/40 hover:bg-blue-50/70"
        }
      `}
      aria-label={`${notification.is_read ? "Read" : "Unread"} notification: ${notification.title}`}
    >
      {/* Unread dot */}
      {!notification.is_read && (
        <span
          className="absolute top-4 right-4 w-2 h-2 rounded-full bg-blue-500 shrink-0"
          aria-hidden="true"
        />
      )}

      {/* Type icon */}
      <div
        className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center mt-0.5 ${meta.iconBg} ${meta.iconColor}`}
        aria-hidden="true"
      >
        {meta.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        {/* Title */}
        <p className={`text-sm leading-snug ${notification.is_read ? "font-medium text-slate-700" : "font-bold text-slate-900"}`}>
          {notification.title}
        </p>

        {/* Message */}
        <p className="text-xs text-slate-500 leading-relaxed">{notification.message}</p>

        {/* Footer: time + actions */}
        <div className="flex items-center justify-between gap-3 pt-1 flex-wrap">
          <div className="flex items-center gap-3">
            {/* Relative timestamp with absolute title tooltip */}
            <time
              dateTime={notification.created_at}
              title={formatAbsoluteTime(notification.created_at)}
              className="text-[11px] text-slate-400"
            >
              {formatRelativeTime(notification.created_at)}
            </time>

            {/* Link to the related task if task_id exists */}
            {notification.task_id && (
              <Link
                href={`/tasks/${notification.task_id}`}
                className="text-[11px] text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors"
              >
                View Task →
              </Link>
            )}

            {/* Link to password reset requests if this is a password reset notification */}
            {notification.type === "PASSWORD_RESET_REQUEST" && (
              <Link
                href="/password-reset-requests"
                className="text-[11px] text-amber-600 hover:text-amber-700 hover:underline font-medium transition-colors"
              >
                View Requests →
              </Link>
            )}
          </div>

          {/* Mark as read button — only shown for unread notifications */}
          {!notification.is_read && (
            <button
              id={`mark-read-${notification.id}`}
              onClick={handleMarkRead}
              disabled={isMarking}
              aria-label={`Mark notification "${notification.title}" as read`}
              className="text-[11px] font-semibold text-slate-500 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              {isMarking ? "Marking…" : "Mark as read"}
            </button>
          )}

          {/* Read timestamp */}
          {notification.is_read && notification.read_at && (
            <time
              dateTime={notification.read_at}
              title={formatAbsoluteTime(notification.read_at)}
              className="text-[11px] text-slate-300 shrink-0"
            >
              Read {formatRelativeTime(notification.read_at)}
            </time>
          )}
        </div>
      </div>
    </article>
  );
}
