import React from "react";
import type { TaskResponse } from "@/lib/api/taskApi";

// Re-export TaskResponse so consumers don't need a separate import
export type { TaskResponse };

const statusConfig: Record<
  string,
  { label: string; badgeClasses: string; dotClasses: string }
> = {
  PENDING: {
    label: "Pending",
    badgeClasses: "bg-amber-50 text-amber-700 border-amber-200",
    dotClasses: "bg-amber-500",
  },
  SUBMITTED: {
    label: "Submitted",
    badgeClasses: "bg-indigo-50 text-indigo-700 border-indigo-200",
    dotClasses: "bg-indigo-500",
  },
  APPROVED: {
    label: "Approved",
    badgeClasses: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dotClasses: "bg-emerald-500",
  },
  REJECTED: {
    label: "Rejected",
    badgeClasses: "bg-rose-50 text-rose-700 border-rose-200",
    dotClasses: "bg-rose-500",
  },
};

const priorityConfig: Record<
  string,
  { label: string; badgeClasses: string }
> = {
  HIGH: {
    label: "High",
    badgeClasses: "bg-rose-50 text-rose-700 border-rose-200 font-semibold",
  },
  MEDIUM: {
    label: "Medium",
    badgeClasses: "bg-amber-50 text-amber-700 border-amber-200 font-medium",
  },
  LOW: {
    label: "Low",
    badgeClasses: "bg-slate-100 text-slate-600 border-slate-200 font-medium",
  },
};

/** Format an ISO datetime string to a short readable date, e.g. "Oct 05, 2026" */
function formatDeadline(isoString: string): string {
  try {
    return new Date(isoString).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  } catch {
    return isoString;
  }
}

interface RecentTasksProps {
  /** Real task data from RTK Query — up to first 5 are displayed */
  tasks: TaskResponse[];
}

export default function RecentTasks({ tasks }: RecentTasksProps) {
  // Show the 5 most recently created tasks (backend returns them sorted by id)
  const displayTasks = tasks.slice(0, 5);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
      {/* Card Header */}
      <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Recent Tasks
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor and track your most recent assignments and deadlines.
          </p>
        </div>
        <span className="hidden sm:inline-flex items-center text-xs font-medium text-slate-500 bg-slate-100/80 px-2.5 py-1 rounded-full border border-slate-200/60">
          {tasks.length} task{tasks.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Empty state */}
      {displayTasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-14 text-slate-400 gap-3">
          <svg
            className="w-10 h-10 text-slate-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <p className="text-sm font-medium text-slate-500">No tasks yet</p>
          <p className="text-xs text-slate-400">
            Tasks assigned to you will appear here.
          </p>
        </div>
      )}

      {/* Responsive Table */}
      {displayTasks.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th scope="col" className="px-5 py-3.5">
                  Task Title
                </th>
                <th scope="col" className="px-4 py-3.5">
                  Status
                </th>
                <th scope="col" className="px-4 py-3.5">
                  Priority
                </th>
                <th
                  scope="col"
                  className="px-5 py-3.5 text-right sm:text-left"
                >
                  Deadline
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayTasks.map((task) => {
                const status =
                  statusConfig[task.status] ?? statusConfig.PENDING;
                const priority =
                  priorityConfig[task.priority] ?? priorityConfig.MEDIUM;

                return (
                  <tr
                    key={task.id}
                    className="hover:bg-slate-50/60 transition-colors group"
                  >
                    {/* Title */}
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {task.title}
                      </div>
                      {task.description && (
                        <span className="text-[11px] text-slate-400 font-medium line-clamp-1">
                          {task.description}
                        </span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${status.badgeClasses}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${status.dotClasses}`}
                          aria-hidden="true"
                        />
                        {status.label}
                      </span>
                    </td>

                    {/* Priority Badge */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-xs border ${priority.badgeClasses}`}
                      >
                        {priority.label}
                      </span>
                    </td>

                    {/* Deadline */}
                    <td className="px-5 py-4 whitespace-nowrap text-right sm:text-left text-slate-600">
                      <div className="inline-flex items-center gap-1.5 text-xs">
                        <svg
                          className="w-3.5 h-3.5 text-slate-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span>{formatDeadline(task.deadline)}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
