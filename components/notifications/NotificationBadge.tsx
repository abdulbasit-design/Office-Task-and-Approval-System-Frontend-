"use client";

import React from "react";
import { useGetNotificationsQuery } from "@/lib/api/notificationApi";

/**
 * NotificationBadge — live unread count.
 *
 * Calls GET /notifications via RTK Query and derives the unread count
 * from the returned list (is_read === false). No dedicated unread-count
 * endpoint exists in the backend. Renders nothing when everything is read.
 */
interface NotificationBadgeProps {
  /** Skip the API call — use when the user is not authenticated */
  skip?: boolean;
}

export default function NotificationBadge({ skip = false }: NotificationBadgeProps) {
  const { data: notifications } = useGetNotificationsQuery(undefined, { skip });

  const unreadCount = notifications ? notifications.filter((n) => !n.is_read).length : 0;
  if (unreadCount === 0) return null;

  return (
    <span
      aria-label={`${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`}
      className="absolute right-0.5 top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full border-2 border-paper bg-serial-fill px-1 font-mono text-[9px] font-semibold leading-none text-white"
    >
      {unreadCount > 9 ? "9+" : unreadCount}
    </span>
  );
}
