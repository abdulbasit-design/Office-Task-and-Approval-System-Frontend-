"use client";

import React, { useMemo } from "react";
import type { ActivityLogEntry } from "@/lib/api/taskApi";
import { useGetUsersQuery } from "@/lib/api/userApi";
import { formatDateTime } from "@/lib/format";

const ACTION_LABEL: Record<string, string> = {
  created: "Created and assigned the task",
  updated: "Edited the task",
  submitted: "Submitted for review",
  approved: "Approved and countersigned",
  rejected: "Rejected with a reason",
};

interface TaskActivityProps {
  activityLog: ActivityLogEntry[];
  /** The assignee's id: their acts sit on the left, everyone else's on the right */
  assigneeId: number;
  /**
   * Known timestamps. The backend log stores only action + user, so these
   * attach to the first "created" and the latest "submitted" / "approved".
   */
  timestamps?: {
    created_at?: string;
    submitted_at?: string | null;
    approved_at?: string | null;
  };
  /** Latest note and reason, shown on the latest matching entry */
  notes?: {
    submission?: string | null;
    rejection?: string | null;
  };
}

/** The task's record as a two-party ledger along one time rule. */
export default function TaskActivity({ activityLog, assigneeId, timestamps, notes }: TaskActivityProps) {
  const { data: users = [] } = useGetUsersQuery();
  const usersMap = useMemo(() => new Map(users.map((u) => [u.id, u.full_name])), [users]);

  const log = activityLog ?? [];
  const lastIndex = (action: string) => log.map((e) => e.action).lastIndexOf(action);

  function stamp(action: string, i: number): string | null {
    if (action === "created" && i === 0) return formatDateTime(timestamps?.created_at);
    if (action === "submitted" && i === lastIndex("submitted")) return formatDateTime(timestamps?.submitted_at);
    if (action === "approved" && i === lastIndex("approved")) return formatDateTime(timestamps?.approved_at);
    return null;
  }

  function quote(action: string, i: number): string | null {
    if (action === "submitted" && i === lastIndex("submitted")) return notes?.submission ?? null;
    if (action === "rejected" && i === lastIndex("rejected")) return notes?.rejection ?? null;
    return null;
  }

  return (
    <section aria-labelledby="trail-heading" className="panel px-5 py-6 sm:px-8">
      <h2 id="trail-heading" className="font-display text-[22px] leading-tight text-ink">The record</h2>

      {log.length === 0 ? (
        <p className="mt-4 text-ink-3">No activity recorded yet.</p>
      ) : (
        <>
          <div className="caps mt-5 hidden grid-cols-2 text-ink-3 sm:grid">
            <span className="pr-6 text-right">Assignee</span>
            <span className="pl-6">Approver</span>
          </div>
          <ol className="relative mt-3 space-y-5" aria-label="Task activity, oldest first">
            <span aria-hidden="true" className="absolute bottom-1 left-[5px] top-1 border-l border-line-strong sm:left-1/2" />
            {log.map((entry, i) => {
              const assignee = entry.user_id === assigneeId;
              const actor = entry.user_name || usersMap.get(entry.user_id) || `User #${entry.user_id}`;
              const ts = stamp(entry.action, i);
              const q = quote(entry.action, i);
              const tone =
                entry.action === "approved"
                  ? "border-seal bg-seal"
                  : entry.action === "rejected"
                    ? "border-serial bg-serial-tint"
                    : assignee
                      ? "border-seal bg-seal-tint"
                      : "border-note-ink bg-note-tint";
              return (
                <li key={i} className="relative grid pl-7 sm:grid-cols-2 sm:pl-0">
                  <span
                    aria-hidden="true"
                    className={`absolute left-0 top-1.5 h-[11px] w-[11px] rotate-45 border sm:left-1/2 sm:-translate-x-1/2 ${tone}`}
                  />
                  <div className={assignee ? "sm:pr-6 sm:text-right" : "sm:col-start-2 sm:pl-6"}>
                    <p className="text-[15px] font-semibold text-ink">{ACTION_LABEL[entry.action] ?? entry.action}</p>
                    <p className="text-[13px] text-ink-3">
                      <span className="sm:hidden">{assignee ? "Assignee: " : "Approver: "}</span>
                      {actor}
                      {ts && <span className="tabular">, {ts}</span>}
                    </p>
                    {q && (
                      <p className={`mt-1 font-display text-[16px] italic leading-snug ${entry.action === "rejected" ? "text-serial" : "text-ink-2"}`}>
                        &ldquo;{q}&rdquo;
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </>
      )}
    </section>
  );
}
