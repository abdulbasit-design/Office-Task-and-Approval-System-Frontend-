"use client";

import React from "react";
import Link from "next/link";
import { CaretRight } from "@phosphor-icons/react";
import type { TaskResponse } from "@/lib/api/taskApi";
import { useGetMeQuery } from "@/lib/api/authApi";
import { StatusBadge, PriorityBadge } from "./TaskStatusBadge";
import Rosette from "@/components/ui/Rosette";
import Serial from "@/components/ui/Serial";
import { dueLabel, formatDate } from "@/lib/format";

interface TaskTableProps {
  tasks: TaskResponse[];
  isLoading?: boolean;
  /** Whether filters are narrowing the list (changes the empty message) */
  filtered?: boolean;
}

function SkeletonRows() {
  return (
    <>
      {[0, 1, 2, 3, 4].map((i) => (
        <tr key={i} className="animate-pulse">
          <td className="px-5 py-4"><div className="h-4 w-20 bg-paper-sunk" /></td>
          <td className="px-4 py-4"><div className="h-4 w-3/4 bg-paper-sunk" /><div className="mt-2 h-3 w-1/2 bg-paper-sunk" /></td>
          <td className="hidden px-4 py-4 md:table-cell"><div className="h-4 w-24 bg-paper-sunk" /></td>
          <td className="hidden px-4 py-4 lg:table-cell"><div className="h-6 w-20 bg-paper-sunk" /></td>
          <td className="hidden px-4 py-4 lg:table-cell"><div className="h-4 w-16 bg-paper-sunk" /></td>
          <td className="px-4 py-4"><div className="h-4 w-24 bg-paper-sunk" /></td>
          <td className="px-4 py-4" />
        </tr>
      ))}
    </>
  );
}

export default function TaskTable({ tasks, isLoading = false, filtered = false }: TaskTableProps) {
  const { data: me } = useGetMeQuery();
  const asAssignee = me?.role === "employee";

  return (
    <div className="panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-[14px]">
          <thead className="border-b border-line bg-paper-sunk">
            <tr className="caps text-ink-3">
              <th scope="col" className="w-36 px-5 py-3 font-semibold">Serial</th>
              <th scope="col" className="px-4 py-3 font-semibold">Task</th>
              <th scope="col" className="hidden px-4 py-3 font-semibold md:table-cell">{asAssignee ? "From" : "Assigned to"}</th>
              <th scope="col" className="hidden px-4 py-3 font-semibold lg:table-cell">Status</th>
              <th scope="col" className="hidden px-4 py-3 font-semibold lg:table-cell">Priority</th>
              <th scope="col" className="px-4 py-3 font-semibold">Deadline</th>
              <th scope="col" className="w-10 px-4 py-3"><span className="sr-only">Open</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {isLoading ? (
              <SkeletonRows />
            ) : tasks.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="flex items-center justify-center gap-5 px-6 py-16">
                    <Rosette seed={77} variant="mark" className="h-14 w-14 shrink-0 text-line-strong" />
                    <div>
                      <p className="font-semibold text-ink">{filtered ? "No tasks match these filters." : "No tasks on record yet."}</p>
                      <p className="mt-1 text-ink-3">
                        {filtered
                          ? "Clear the filters or try a different search."
                          : "Tasks assigned to you or created by you will appear here."}
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              tasks.map((task) => {
                const due = dueLabel(task.deadline);
                const settled = task.status === "APPROVED";
                return (
                  <tr key={task.id} className="group relative transition-colors hover:bg-paper-sunk">
                    <td className="px-5 py-4 align-top">
                      <Serial id={task.id} />
                    </td>
                    <td className="max-w-md px-4 py-4 align-top">
                      <Link
                        href={`/tasks/${task.id}`}
                        className="font-semibold text-ink after:absolute after:inset-0 group-hover:text-note-ink"
                      >
                        {task.title}
                      </Link>
                      {task.description && <p className="mt-0.5 line-clamp-1 text-[13px] text-ink-3">{task.description}</p>}
                      <div className="mt-2 flex flex-wrap items-center gap-3 lg:hidden">
                        <StatusBadge status={task.status} />
                        <PriorityBadge priority={task.priority} />
                      </div>
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-4 align-top text-ink-2 md:table-cell">
                      {(asAssignee ? task.created_by_name : task.assigned_to_name) ?? "Unknown"}
                    </td>
                    <td className="hidden px-4 py-4 align-top lg:table-cell">
                      <StatusBadge status={task.status} />
                    </td>
                    <td className="hidden px-4 py-4 align-top lg:table-cell">
                      <PriorityBadge priority={task.priority} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 align-top">
                      <time dateTime={task.deadline} className="block text-ink">{formatDate(task.deadline)}</time>
                      {!settled && (
                        <span className={`text-[12px] ${due.overdue ? "text-serial" : due.soon ? "text-seal-ink" : "text-ink-3"}`}>
                          {due.text}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 align-top text-ink-3 group-hover:text-note-ink">
                      <CaretRight size={16} aria-hidden="true" />
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
