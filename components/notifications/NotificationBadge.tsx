"use client";

import React from "react";
import { useGetNotificationsQuery } from "@/lib/api/notificationApi";

/**
 * NotificationBadge — live unread count pill.
 *
 * Calls GET /notifications via RTK Query and derives the unread count
 * from the returned list (is_read === false). No dedicated unread-count
 * endpoint exists in the backend.
 *
 * Renders:
 *   - Nothing     if all notifications are read (count === 0)
 *   - A small red dot  if there are 1–9 unread
 *   - "9+" pill   if there are 10+ unread
 *
 * Skips the query when `skip` prop is true (e.g., unauthenticated).
 */
interface NotificationBadgeProps {
  /** Skip the API call — use when the user is not authenticated */
  skip?: boolean;
}

export default function NotificationBadge({ skip = false }: NotificationBadgeProps) {
  const { data: notifications } = useGetNotificationsQuery(undefined, { skip });

  const unreadCount = notifications
    ? notifications.filter((n) => !n.is_read).length
    : 0;

  if (unreadCount === 0) return null;

  const label = unreadCount > 9 ? "9+" : String(unreadCount);

  return (
    <span
      aria-label={`${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`}
      className={`
        absolute flex items-center justify-center
        bg-red-500 text-white font-bold border-2 border-white
        rounded-full leading-none
        ${unreadCount > 9
          ? "top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 text-[9px]"
          : "top-1 right-1 w-4 h-4 text-[9px]"
        }
      `}
    >
      {label}
    </span>
  );
}
