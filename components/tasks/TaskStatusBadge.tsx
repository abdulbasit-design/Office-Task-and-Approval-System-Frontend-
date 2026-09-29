import React from "react";
import type { TaskResponse } from "@/lib/api/taskApi";

type Status = TaskResponse["status"];
type Priority = TaskResponse["priority"];

// ── Status config ─────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  Status,
  { label: string; badge: string; dot: string }
> = {
  PENDING: {
    label: "Pending",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  SUBMITTED: {
    label: "Submitted",
    badge: "bg-indigo-50 text-indigo-700 border-indigo-200",
    dot: "bg-indigo-500",
  },
  APPROVED: {
    label: "Approved",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  REJECTED: {
    label: "Rejected",
    badge: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
  },
};

// ── Priority config ───────────────────────────────────────────────────────
const PRIORITY_CONFIG: Record<
  Priority,
  { label: string; badge: string }
> = {
  HIGH: {
    label: "High",
    badge: "bg-rose-50 text-rose-700 border-rose-200 font-semibold",
  },
  MEDIUM: {
    label: "Medium",
    badge: "bg-amber-50 text-amber-700 border-amber-200 font-medium",
  },
  LOW: {
    label: "Low",
    badge: "bg-slate-100 text-slate-600 border-slate-200 font-medium",
  },
};

// ── StatusBadge ───────────────────────────────────────────────────────────
export function StatusBadge({ status }: { status: Status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${cfg.badge}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} aria-hidden="true" />
      {cfg.label}
    </span>
  );
}

// ── PriorityBadge ─────────────────────────────────────────────────────────
export function PriorityBadge({ priority }: { priority: Priority }) {
  const cfg = PRIORITY_CONFIG[priority] ?? PRIORITY_CONFIG.MEDIUM;
  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded text-xs border ${cfg.badge}`}
    >
      {cfg.label}
    </span>
  );
}

// Re-export config for reuse
export { STATUS_CONFIG, PRIORITY_CONFIG };
