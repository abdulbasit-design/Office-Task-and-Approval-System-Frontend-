import React from "react";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";
import type { TaskResponse } from "@/lib/api/taskApi";
import { PriorityBadge, StatusBadge } from "@/components/tasks/TaskStatusBadge";
import Rosette from "@/components/ui/Rosette";
import Serial from "@/components/ui/Serial";
import { dueLabel, formatDate } from "@/lib/format";

type Perspective = "approver" | "assignee";

interface TaskQueueProps {
  title: string;
  tasks: TaskResponse[];
  perspective: Perspective;
  emptyTitle: string;
  emptyBody: string;
  /** The primary queue gets the engraved frame; secondary lists sit quieter */
  primary?: boolean;
}

function byDeadline(a: TaskResponse, b: TaskResponse) {
  return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
}

function QueueRow({ task, perspective }: { task: TaskResponse; perspective: Perspective }) {
  const due = dueLabel(task.deadline);
  const who =
    perspective === "approver"
      ? task.status === "SUBMITTED"
        ? `${task.assigned_to_name ?? "Assignee"}, submitted ${formatDate(task.submitted_at)}`
        : `With ${task.assigned_to_name ?? "assignee"}`
      : `From ${task.created_by_name ?? "your manager"}`;

  return (
    <li>
      <Link
        href={`/tasks/${task.id}`}
        className="group grid grid-cols-[1fr_auto] gap-x-5 gap-y-2 px-5 py-4 transition-colors hover:bg-paper-sunk sm:grid-cols-[7.5rem_1fr_auto] sm:items-center"
      >
        <Serial id={task.id} className="hidden sm:inline-flex" />
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold text-ink group-hover:text-note-ink">{task.title}</p>
          <p className="mt-0.5 truncate text-[13px] text-ink-3">{who}</p>
          {task.status === "REJECTED" && task.rejection_reason && (
            <p className="mt-1.5 line-clamp-2 font-display text-[15px] italic leading-snug text-serial">
              Returned: &ldquo;{task.rejection_reason}&rdquo;
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1.5 text-right">
          <span className={`tabular text-[13px] font-medium ${due.overdue ? "text-serial" : due.soon ? "text-seal-ink" : "text-ink-2"}`}>
            {due.text}
          </span>
          <span className="flex items-center gap-3">
            {perspective === "approver" && task.status !== "SUBMITTED" && <StatusBadge status={task.status} />}
            <PriorityBadge priority={task.priority} />
          </span>
        </div>
      </Link>
    </li>
  );
}

export default function TaskQueue({ title, tasks, perspective, emptyTitle, emptyBody, primary = false }: TaskQueueProps) {
  const sorted = [...tasks].sort(byDeadline);
  return (
    <section aria-label={title} className={primary ? "frame" : "panel"}>
      <header className="flex items-baseline justify-between gap-4 border-b border-line px-5 pb-3 pt-5">
        <h2 className={`font-display leading-tight text-ink ${primary ? "text-[24px]" : "text-[20px]"}`}>{title}</h2>
        <span className="font-display text-[22px] leading-none text-ink-3 tabular">{sorted.length}</span>
      </header>

      {sorted.length === 0 ? (
        <div className="flex items-center gap-5 px-5 py-10">
          <Rosette seed={title.length * 31} variant="mark" className="h-14 w-14 shrink-0 text-line-strong" />
          <div>
            <p className="font-semibold text-ink">{emptyTitle}</p>
            <p className="mt-1 max-w-[46ch] text-[14px] text-ink-3">{emptyBody}</p>
          </div>
        </div>
      ) : (
        <ul className="divide-y divide-line">
          {sorted.slice(0, primary ? 8 : 5).map((t) => (
            <QueueRow key={t.id} task={t} perspective={perspective} />
          ))}
        </ul>
      )}

      {sorted.length > (primary ? 8 : 5) && (
        <Link
          href="/tasks"
          className="flex items-center justify-end gap-1.5 border-t border-line px-5 py-3 text-[14px] font-semibold text-note-ink hover:underline"
        >
          All {sorted.length} tasks <ArrowRight size={14} weight="bold" />
        </Link>
      )}
    </section>
  );
}
