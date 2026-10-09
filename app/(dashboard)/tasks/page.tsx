"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MagnifyingGlass, Plus, WarningCircle } from "@phosphor-icons/react";
import RefreshButton from "@/components/ui/RefreshButton";
import { useGetTasksQuery } from "@/lib/api/taskApi";
import { useGetMeQuery } from "@/lib/api/authApi";
import TaskTable from "@/components/tasks/TaskTable";
import type { TaskResponse } from "@/lib/api/taskApi";

type StatusFilter = "ALL" | TaskResponse["status"];
type PriorityFilter = "ALL" | TaskResponse["priority"];

const STATUSES: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "PENDING", label: "Pending" },
  { value: "REJECTED", label: "Rejected" },
  { value: "APPROVED", label: "Approved" },
];

const isStatus = (v: string | null): v is TaskResponse["status"] =>
  v === "PENDING" || v === "SUBMITTED" || v === "APPROVED" || v === "REJECTED";

function TasksView({ initialStatus }: { initialStatus: StatusFilter }) {
  const { data: tasks = [], isLoading, isError, error, isFetching, refetch } = useGetTasksQuery();
  const { data: me } = useGetMeQuery();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>(initialStatus);
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("ALL");
  const [search, setSearch] = useState("");

  const countFor = (s: StatusFilter) => (s === "ALL" ? tasks.length : tasks.filter((t) => t.status === s).length);

  const filtered = tasks.filter((t) => {
    const matchStatus = statusFilter === "ALL" || t.status === statusFilter;
    const matchPriority = priorityFilter === "ALL" || t.priority === priorityFilter;
    const q = search.trim().toLowerCase();
    const matchSearch = !q || t.title.toLowerCase().includes(q) || (t.description ?? "").toLowerCase().includes(q);
    return matchStatus && matchPriority && matchSearch;
  });

  const filtering = statusFilter !== "ALL" || priorityFilter !== "ALL" || search.trim() !== "";

  const errorMsg = (() => {
    if (error && "data" in error) return (error as { data: { detail?: string } }).data?.detail ?? "Failed to load tasks.";
    if (error && "error" in error) return (error as { error: string }).error;
    return "Check that the API is running, then refresh.";
  })();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[15px] text-ink-2">
          {isLoading
            ? "Loading tasks..."
            : filtering
              ? `Showing ${filtered.length} of ${tasks.length} task${tasks.length === 1 ? "" : "s"}`
              : `${tasks.length} task${tasks.length === 1 ? "" : "s"} on record`}
        </p>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <RefreshButton onRefresh={refetch} fetching={isFetching} />
          {me?.role === "manager" && (
            <Link href="/tasks/create" id="create-task-button" className="btn btn-primary">
              <Plus size={16} weight="bold" /> New task
            </Link>
          )}
        </div>
      </div>

      <div className="panel flex flex-col gap-3 p-3 lg:flex-row lg:items-center">
        <div role="group" aria-label="Filter by status" className="flex flex-wrap gap-1">
          {STATUSES.map(({ value, label }) => {
            const active = statusFilter === value;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={active}
                onClick={() => setStatusFilter(value)}
                className={`btn min-h-9 gap-2 px-3 text-[14px] ${
                  active
                    ? "bg-note-tint text-note-ink shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--note-ink)_30%,transparent)]"
                    : "btn-ghost"
                }`}
              >
                {label}
                <span className={`font-display text-[16px] leading-none tabular ${active ? "" : "text-ink-3"}`}>
                  {isLoading ? "" : countFor(value)}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-1 flex-col gap-2 sm:flex-row lg:justify-end">
          <div className="relative sm:w-72">
            <MagnifyingGlass size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
            <label htmlFor="task-search" className="sr-only">Search tasks</label>
            <input
              id="task-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title or description"
              className="input min-h-9 pl-9 text-[14px]"
            />
          </div>
          <select
            id="priority-filter"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as PriorityFilter)}
            className="input min-h-9 text-[14px] sm:w-40"
            aria-label="Filter by priority"
          >
            <option value="ALL">All priorities</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
          {filtering && (
            <button
              type="button"
              onClick={() => {
                setStatusFilter("ALL");
                setPriorityFilter("ALL");
                setSearch("");
              }}
              className="btn btn-ghost min-h-9 text-[14px]"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {isError && (
        <div role="alert" className="flex items-start gap-3 rounded-sm border border-serial/50 bg-serial-tint p-4 text-[14px]">
          <WarningCircle size={20} className="mt-0.5 shrink-0 text-serial" />
          <div>
            <p className="font-semibold text-ink">Tasks could not be loaded</p>
            <p className="mt-0.5 text-ink-2">{errorMsg}</p>
          </div>
        </div>
      )}

      {!isError && <TaskTable tasks={filtered} isLoading={isLoading} filtered={filtering} />}
    </div>
  );
}

function TasksRoute() {
  const param = useSearchParams().get("status");
  const initial: StatusFilter = isStatus(param) ? param : "ALL";
  // Re-key so arriving from a dashboard link with a new ?status resets the filter
  return <TasksView key={initial} initialStatus={initial} />;
}

export default function TasksPage() {
  return (
    <Suspense fallback={null}>
      <TasksRoute />
    </Suspense>
  );
}
