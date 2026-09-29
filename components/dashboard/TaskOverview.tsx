import React from "react";
import type { TaskResponse } from "@/lib/api/taskApi";

/**
 * StatusBreakdown is derived from real TaskResponse[] in the dashboard page.
 * Matches the exact status values produced by the FastAPI backend:
 *   PENDING | SUBMITTED | APPROVED | REJECTED
 */
export interface StatusBreakdown {
  pending: number;
  submitted: number;
  approved: number;
  rejected: number;
}

/**
 * Derive a StatusBreakdown by counting tasks per status.
 * Called by the dashboard page — keeps logic co-located with data fetching.
 */
export function deriveBreakdown(tasks: TaskResponse[]): StatusBreakdown {
  return tasks.reduce<StatusBreakdown>(
    (acc, task) => {
      switch (task.status) {
        case "PENDING":
          acc.pending += 1;
          break;
        case "SUBMITTED":
          acc.submitted += 1;
          break;
        case "APPROVED":
          acc.approved += 1;
          break;
        case "REJECTED":
          acc.rejected += 1;
          break;
      }
      return acc;
    },
    { pending: 0, submitted: 0, approved: 0, rejected: 0 }
  );
}

interface StatusBarItem {
  key: keyof StatusBreakdown;
  label: string;
  count: number;
  barColor: string;
  dotColor: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
}

interface TaskOverviewProps {
  /** Real status breakdown derived from backend task data */
  breakdown: StatusBreakdown;
  /** Total count of all tasks (passed from parent to avoid re-computing) */
  total: number;
}

export default function TaskOverview({ breakdown, total }: TaskOverviewProps) {
  const items: StatusBarItem[] = [
    {
      key: "approved",
      label: "Approved",
      count: breakdown.approved,
      barColor: "bg-emerald-500",
      dotColor: "bg-emerald-500",
      textColor: "text-emerald-700",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
    },
    {
      key: "pending",
      label: "Pending",
      count: breakdown.pending,
      barColor: "bg-amber-400",
      dotColor: "bg-amber-400",
      textColor: "text-amber-700",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
    },
    {
      key: "submitted",
      label: "Submitted",
      count: breakdown.submitted,
      barColor: "bg-indigo-400",
      dotColor: "bg-indigo-400",
      textColor: "text-indigo-700",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200",
    },
    {
      key: "rejected",
      label: "Rejected",
      count: breakdown.rejected,
      barColor: "bg-rose-400",
      dotColor: "bg-rose-400",
      textColor: "text-rose-700",
      bgColor: "bg-rose-50",
      borderColor: "border-rose-200",
    },
  ];

  const getPercent = (count: number) =>
    total === 0 ? 0 : Math.round((count / total) * 100);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-5 sm:p-6">
      {/* Card Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Task Overview
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Breakdown of all tasks by current status.
          </p>
        </div>
        <div className="text-right shrink-0 ml-4">
          <span className="text-2xl font-bold text-slate-900">{total}</span>
          <p className="text-[11px] text-slate-500 font-medium">Total Tasks</p>
        </div>
      </div>

      {/* Empty State */}
      {total === 0 && (
        <div className="flex flex-col items-center justify-center py-6 text-slate-400 gap-2">
          <svg
            className="w-8 h-8 text-slate-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
            />
          </svg>
          <p className="text-xs text-slate-500">No task data to display.</p>
        </div>
      )}

      {/* Stacked Progress Bar */}
      {total > 0 && (
        <>
          <div className="flex h-3 rounded-full overflow-hidden gap-px mb-5">
            {items.map((item) => {
              const pct = getPercent(item.count);
              if (pct === 0) return null;
              return (
                <div
                  key={item.key}
                  className={`${item.barColor} transition-all duration-500`}
                  style={{ width: `${pct}%` }}
                  title={`${item.label}: ${item.count} (${pct}%)`}
                  role="presentation"
                />
              );
            })}
          </div>

          {/* Status Legend Rows */}
          <div className="space-y-2.5">
            {items.map((item) => {
              const pct = getPercent(item.count);
              return (
                <div key={item.key} className="flex items-center gap-3">
                  {/* Label */}
                  <div className="flex items-center gap-2 w-28 shrink-0">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${item.dotColor} shrink-0`}
                      aria-hidden="true"
                    />
                    <span className="text-xs font-medium text-slate-700 truncate">
                      {item.label}
                    </span>
                  </div>

                  {/* Bar */}
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${item.barColor} transition-all duration-700`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  {/* Count & Percent */}
                  <div className="flex items-center gap-2 shrink-0 min-w-[60px] justify-end">
                    <span
                      className={`text-xs font-semibold px-1.5 py-0.5 rounded border ${item.bgColor} ${item.textColor} ${item.borderColor}`}
                    >
                      {item.count}
                    </span>
                    <span className="text-xs text-slate-400 w-8 text-right">
                      {pct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
