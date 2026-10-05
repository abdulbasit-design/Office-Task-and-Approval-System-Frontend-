"use client";

import React from "react";
import Link from "next/link";
import type { TaskResponse } from "@/lib/api/taskApi";
import { StatusBadge, PriorityBadge } from "./TaskStatusBadge";

// ── Helpers ───────────────────────────────────────────────────────────────
function formatDeadline(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function isOverdue(deadline: string, status: TaskResponse["status"]): boolean {
  if (status === "APPROVED") return false;
  return new Date(deadline) < new Date();
}

// ── Props ─────────────────────────────────────────────────────────────────
interface TaskCardProps {
  task: TaskResponse;
}

// ── TaskCard ──────────────────────────────────────────────────────────────
export default function TaskCard({ task }: TaskCardProps) {
  const overdue = isOverdue(task.deadline, task.status);

  return (
    <article
      className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-5 flex flex-col gap-3 hover:shadow-[0_4px_20px_rgba(0,0,0,0.07)] transition-shadow"
      aria-label={`Task: ${task.title}`}
    >
      {/* Top row: badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <StatusBadge status={task.status} />
        <PriorityBadge priority={task.priority} />
        {overdue && (
          <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
            Overdue
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
        {task.title}
      </h3>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Assignee & Department */}
      {(task.assigned_to_name || task.department_name) && (
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="font-medium text-slate-700 truncate">{task.assigned_to_name || `User #${task.assigned_to}`}</span>
          {task.department_name && (
            <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 font-medium shrink-0">
              {task.department_name}
            </span>
          )}
        </div>
      )}

      {/* Deadline */}
      <div className={`flex items-center gap-1.5 text-xs mt-auto ${overdue ? "text-rose-600 font-semibold" : "text-slate-500"}`}>
        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>{formatDeadline(task.deadline)}</span>
      </div>

      {/* Footer: View link */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] text-slate-400">ID #{task.id}</span>
        <Link
          href={`/tasks/${task.id}`}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1 transition-colors"
          aria-label={`View details for task: ${task.title}`}
        >
          View details
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </article>
  );
}
