"use client";

import React from "react";
import Link from "next/link";
import type { TaskResponse } from "@/lib/api/taskApi";
import { StatusBadge, PriorityBadge } from "./TaskStatusBadge";

// ── Helpers ───────────────────────────────────────────────────────────────
function formatDeadline(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
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
interface TaskTableProps {
  tasks: TaskResponse[];
  isLoading?: boolean;
}

// ── Skeleton row ─────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-slate-100 animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <td key={i} className="px-5 py-4">
          <div className="h-3.5 bg-slate-200 rounded w-3/4" />
        </td>
      ))}
    </tr>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <tr>
      <td colSpan={5}>
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
          <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-600">No tasks found</p>
            <p className="text-xs text-slate-400 mt-1">Tasks assigned to or created by you will appear here.</p>
          </div>
        </div>
      </td>
    </tr>
  );
}

// ── TaskTable ─────────────────────────────────────────────────────────────
export default function TaskTable({ tasks, isLoading = false }: TaskTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
      {/* Scrollable table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm" role="table" aria-label="Tasks list">
          {/* Header */}
          <thead className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th scope="col" className="px-5 py-3.5">Task</th>
              <th scope="col" className="px-4 py-3.5 hidden sm:table-cell">Assigned To</th>
              <th scope="col" className="px-4 py-3.5 hidden md:table-cell">Status</th>
              <th scope="col" className="px-4 py-3.5 hidden lg:table-cell">Priority</th>
              <th scope="col" className="px-4 py-3.5 hidden xl:table-cell">Deadline</th>
              <th scope="col" className="px-5 py-3.5 text-right">View</th>
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </>
            ) : tasks.length === 0 ? (
              <EmptyState />
            ) : (
              tasks.map((task) => {
                const overdue = isOverdue(task.deadline, task.status);

                return (
                  <tr
                    key={task.id}
                    className="hover:bg-slate-50/60 transition-colors group"
                  >
                    {/* Title + description */}
                    <td className="px-5 py-4 max-w-xs">
                      <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 text-sm">
                        {task.title}
                      </div>
                      {task.description && (
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                          {task.description}
                        </p>
                      )}
                      {/* Mobile: show assignee + badges inline */}
                      <div className="flex items-center gap-2 mt-1.5 sm:hidden flex-wrap">
                        <span className="text-[11px] text-slate-600 font-medium">
                          {task.assigned_to_name || `User #${task.assigned_to}`}
                        </span>
                        <StatusBadge status={task.status} />
                        <PriorityBadge priority={task.priority} />
                        {overdue && (
                          <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
                            Overdue
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Assigned To */}
                    <td className="px-4 py-4 whitespace-nowrap hidden sm:table-cell">
                      <div className="font-medium text-slate-800 text-xs">
                        {task.assigned_to_name || `User #${task.assigned_to}`}
                      </div>
                      {task.department_name && (
                        <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-medium border border-blue-100 mt-0.5 inline-block">
                          {task.department_name}
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4 whitespace-nowrap hidden sm:table-cell">
                      <StatusBadge status={task.status} />
                    </td>

                    {/* Priority */}
                    <td className="px-4 py-4 whitespace-nowrap hidden md:table-cell">
                      <PriorityBadge priority={task.priority} />
                    </td>

                    {/* Deadline */}
                    <td className="px-4 py-4 whitespace-nowrap hidden lg:table-cell">
                      <div className={`inline-flex items-center gap-1.5 text-xs ${overdue ? "text-rose-600 font-semibold" : "text-slate-600"}`}>
                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDeadline(task.deadline)}
                        {overdue && <span className="text-[10px] text-rose-500 font-bold ml-1">Overdue</span>}
                      </div>
                    </td>

                    {/* View link */}
                    <td className="px-5 py-4 whitespace-nowrap text-right">
                      <Link
                        href={`/tasks/${task.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                        aria-label={`View task: ${task.title}`}
                      >
                        View
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
