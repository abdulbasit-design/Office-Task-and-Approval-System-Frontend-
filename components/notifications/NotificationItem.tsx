"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUUpLeft,
  Bell,
  Check,
  CircleNotch,
  ClipboardText,
  PaperPlaneTilt,
  SealCheck,
  type Icon,
} from "@phosphor-icons/react";
import type { NotificationResponse } from "@/lib/api/notificationApi";
import { useMarkNotificationReadMutation } from "@/lib/api/notificationApi";
import Serial from "@/components/ui/Serial";
import { formatDate, formatDateTime } from "@/lib/format";

// Backend type string to icon and ink. Bronze marks the countersign trail only.
function getTypeMeta(type: string): { icon: Icon; tone: string } {
  switch (type) {
    case "TASK_APPROVED":
      return { icon: SealCheck, tone: "text-seal" };
    case "TASK_REJECTED":
      return { icon: ArrowUUpLeft, tone: "text-serial" };
    case "TASK_SUBMITTED":
    case "TASK_RESUBMITTED":
      return { icon: PaperPlaneTilt, tone: "text-seal-ink" };
    case "TASK_ASSIGNED":
      return { icon: ClipboardText, tone: "text-note-ink" };
    default:
      return { icon: Bell, tone: "text-ink-3" };
  }
}

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

    return formatDate(iso);
  } catch {
    return iso;
  }
}

interface NotificationItemProps {
  notification: NotificationResponse;
}

export default function NotificationItem({ notification }: NotificationItemProps) {
  const [markRead, { isLoading: isMarking }] = useMarkNotificationReadMutation();
  const { icon: TypeIcon, tone } = getTypeMeta(notification.type);
  const unread = !notification.is_read;

  const handleMarkRead = async () => {
    if (notification.is_read || isMarking) return;
    try {
      await markRead(notification.id).unwrap();
    } catch {
      // Silently ignore: the list will re-fetch on next poll
    }
  };

  return (
    <article
      className={`flex gap-4 px-5 py-4 transition-colors hover:bg-paper-sunk ${unread ? "bg-paper-raised" : ""}`}
      aria-label={`${notification.is_read ? "Read" : "Unread"} notification: ${notification.title}`}
    >
      <TypeIcon size={20} className={`mt-0.5 shrink-0 ${tone}`} aria-hidden="true" />

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-4">
          <p className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-0.5">
            <span className={`text-[15px] leading-snug ${unread ? "font-semibold text-ink" : "font-medium text-ink-2"}`}>
              {notification.title}
            </span>
            {unread && <span className="caps text-note-ink">Unread</span>}
          </p>
          <time
            dateTime={notification.created_at}
            title={formatDateTime(notification.created_at)}
            className="shrink-0 whitespace-nowrap text-[13px] text-ink-3 tabular"
          >
            {formatRelativeTime(notification.created_at)}
          </time>
        </div>

        <p className="mt-1 text-[14px] leading-relaxed text-ink-2">{notification.message}</p>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            {notification.task_id && (
              <Link
                href={`/tasks/${notification.task_id}`}
                className="group inline-flex items-center gap-2 rounded-sm text-[13px] font-semibold text-note-ink"
              >
                <Serial id={notification.task_id} />
                <span className="inline-flex items-center gap-1 group-hover:underline">
                  View task <ArrowRight size={13} weight="bold" aria-hidden="true" />
                </span>
              </Link>
            )}

            {notification.type === "PASSWORD_RESET_REQUEST" && (
              <Link
                href="/password-reset-requests"
                className="inline-flex items-center gap-1 rounded-sm text-[13px] font-semibold text-note-ink hover:underline"
              >
                View requests <ArrowRight size={13} weight="bold" aria-hidden="true" />
              </Link>
            )}
          </div>

          {unread && (
            <button
              id={`mark-read-${notification.id}`}
              onClick={handleMarkRead}
              disabled={isMarking}
              aria-label={`Mark notification "${notification.title}" as read`}
              className="btn btn-ghost -mr-2.5 min-h-8 px-2.5 text-[13px]"
            >
              {isMarking ? (
                <CircleNotch size={14} className="animate-spin" aria-hidden="true" />
              ) : (
                <Check size={14} weight="bold" aria-hidden="true" />
              )}
              {isMarking ? "Marking…" : "Mark as read"}
            </button>
          )}

          {notification.is_read && notification.read_at && (
            <time
              dateTime={notification.read_at}
              title={formatDateTime(notification.read_at)}
              className="shrink-0 text-[13px] text-ink-3 tabular"
            >
              Read {formatRelativeTime(notification.read_at)}
            </time>
          )}
        </div>
      </div>
    </article>
  );
}
