import React from "react";
import type { TaskResponse } from "@/lib/api/taskApi";

type Status = TaskResponse["status"];
type Priority = TaskResponse["priority"];

// Status reads like an overprint on a note: square, small caps, one ink per state.
// Bronze is reserved for "Submitted", the state waiting on a countersignature.
const STATUS_CONFIG: Record<Status, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "text-ink-2 border-line-strong bg-paper-sunk" },
  SUBMITTED: { label: "Submitted", className: "text-seal-ink border-seal bg-seal-tint" },
  APPROVED: { label: "Approved", className: "text-ok border-ok/60 bg-ok-tint" },
  REJECTED: { label: "Rejected", className: "text-serial border-serial/60 bg-serial-tint" },
};

const PRIORITY_CONFIG: Record<Priority, { label: string; className: string; bars: number }> = {
  HIGH: { label: "High", className: "text-serial", bars: 3 },
  MEDIUM: { label: "Medium", className: "text-ink-2", bars: 2 },
  LOW: { label: "Low", className: "text-ink-3", bars: 1 },
};

export function StatusBadge({ status }: { status: Status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;
  return (
    <span className={`caps inline-flex items-center h-6 px-2 rounded-sm border ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

/** Priority as engraved weight marks: one, two or three rules. */
export function PriorityBadge({ priority }: { priority: Priority }) {
  const cfg = PRIORITY_CONFIG[priority] ?? PRIORITY_CONFIG.MEDIUM;
  return (
    <span className={`caps inline-flex items-center gap-1.5 ${cfg.className}`}>
      <span className="inline-flex flex-col gap-[2px]" aria-hidden="true">
        {[3, 2, 1].map((n) => (
          <span key={n} className={`block h-[2px] w-3 bg-current ${n > cfg.bars ? "opacity-20" : ""}`} />
        ))}
      </span>
      {cfg.label}
    </span>
  );
}

export { STATUS_CONFIG, PRIORITY_CONFIG };
