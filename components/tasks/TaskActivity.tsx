"use client";

import React, { useMemo } from "react";
import type { ActivityLogEntry } from "@/lib/api/taskApi";
import { useGetUsersQuery } from "@/lib/api/userApi";

// ── Helpers ───────────────────────────────────────────────────────────────
function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-US", {
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

// ── Action label + colors ─────────────────────────────────────────────────
interface ActionMeta {
  label: string;
  iconBg: string;
  iconColor: string;
  icon: React.ReactNode;
}

function getActionMeta(action: string): ActionMeta {
  switch (action) {
    case "created":
      return {
        label: "Task created",
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
        icon: (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        ),
      };
    case "updated":
      return {
        label: "Task updated",
        iconBg: "bg-slate-100",
        iconColor: "text-slate-600",
        icon: (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        ),
      };
    case "submitted":
      return {
        label: "Task submitted for review",
        iconBg: "bg-indigo-100",
        iconColor: "text-indigo-600",
        icon: (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      };
    case "approved":
      return {
        label: "Task approved",
        iconBg: "bg-emerald-100",
        iconColor: "text-emerald-600",
        icon: (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ),
      };
    case "rejected":
      return {
        label: "Task rejected",
        iconBg: "bg-rose-100",
        iconColor: "text-rose-600",
        icon: (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ),
      };
    default:
      return {
        label: action,
        iconBg: "bg-slate-100",
        iconColor: "text-slate-500",
        icon: (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01" />
          </svg>
        ),
      };
  }
}

// ── Props ─────────────────────────────────────────────────────────────────
interface TaskActivityProps {
  activityLog: ActivityLogEntry[];
  /**
   * Optional ISO timestamps keyed by action, used to show approximate
   * timestamps on specific events (submitted_at, approved_at, created_at).
   */
  timestamps?: {
    created_at?: string;
    submitted_at?: string | null;
    approved_at?: string | null;
  };
}

// ── Component ─────────────────────────────────────────────────────────────
export default function TaskActivity({ activityLog, timestamps }: TaskActivityProps) {
  const { data: users = [] } = useGetUsersQuery();
  const usersMap = useMemo(() => new Map(users.map((u) => [u.id, u.full_name])), [users]);

  if (!activityLog || activityLog.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Activity</h3>
        <p className="text-xs text-slate-400 text-center py-6">No activity recorded yet.</p>
      </div>
    );
  }

  /**
   * We can only show approximate timestamps for a few known events
   * because the backend activity_log entries only store action + user_id.
   */
  function getTimestamp(action: string, index: number): string | null {
    if (!timestamps) return null;
    // First entry is always "created"
    if (index === 0 && action === "created" && timestamps.created_at)
      return formatDateTime(timestamps.created_at);
    if (action === "submitted" && timestamps.submitted_at)
      return formatDateTime(timestamps.submitted_at);
    if (action === "approved" && timestamps.approved_at)
      return formatDateTime(timestamps.approved_at);
    return null;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6">
      <h3 className="text-sm font-bold text-slate-900 mb-5">Activity Log</h3>

      <ol className="relative space-y-0" aria-label="Task activity timeline">
        {activityLog.map((entry, i) => {
          const meta = getActionMeta(entry.action);
          const ts = getTimestamp(entry.action, i);
          const isLast = i === activityLog.length - 1;
          const actorName = entry.user_name || usersMap.get(entry.user_id) || `User #${entry.user_id}`;

          return (
            <li key={i} className="relative flex gap-3 pb-5 last:pb-0">
              {/* Connector line */}
              {!isLast && (
                <span
                  className="absolute left-3.5 top-7 bottom-0 w-px bg-slate-100"
                  aria-hidden="true"
                />
              )}

              {/* Icon */}
              <span
                className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center z-10 ${meta.iconBg} ${meta.iconColor}`}
                aria-hidden="true"
              >
                {meta.icon}
              </span>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-xs font-semibold text-slate-800">{meta.label}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  <span className="font-medium text-slate-600">{actorName}</span>
                  {ts && <> · {ts}</>}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
