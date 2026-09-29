"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useGetTasksQuery } from "@/lib/api/taskApi";
import TaskTable from "@/components/tasks/TaskTable";
import { StatusBadge, PriorityBadge } from "@/components/tasks/TaskStatusBadge";
import type { TaskResponse } from "@/lib/api/taskApi";

// ── Filter types ──────────────────────────────────────────────────────────
type StatusFilter = "ALL" | TaskResponse["status"];
type PriorityFilter = "ALL" | TaskResponse["priority"];

// ── Page ──────────────────────────────────────────────────────────────────
export default function TasksPage() {
  const { data: tasks = [], isLoading, isError, error } = useGetTasksQuery();

  // ── Filter state ──────────────────────────────────────────────────────────
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("ALL");
  const [search, setSearch] = useState("");

  // ── Derived stats ─────────────────────────────────────────────────────────
  const pending   = tasks.filter((t) => t.status === "PENDING").length;
  const submitted = tasks.filter((t) => t.status === "SUBMITTED").length;
  const approved  = tasks.filter((t) => t.status === "APPROVED").length;
  const rejected  = tasks.filter((t) => t.status === "REJECTED").length;

  // ── Filtered list ─────────────────────────────────────────────────────────
  const filtered = tasks.filter((t) => {
    const matchStatus   = statusFilter === "ALL"   || t.status   === statusFilter;
    const matchPriority = priorityFilter === "ALL" || t.priority === priorityFilter;
    const matchSearch   = !search.trim() ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.description ?? "").toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchPriority && matchSearch;
  });

  // ── Error message ─────────────────────────────────────────────────────────
  const errorMsg = (() => {
    if (!error) return "Failed to load tasks.";
    if ("data" in error) {
      const d = (error as { data: { detail?: string } }).data;
      return d?.detail ?? "Failed to load tasks.";
    }
    if ("error" in error) return (error as { error: string }).error;
    return "An unexpected error occurred.";
  })();

  return (
    <div className="space-y-6">

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs text-slate-500 mt-0.5">
            {isLoading ? "Loading…" : `${tasks.length} task${tasks.length !== 1 ? "s" : ""} total`}
          </p>
        </div>

        {/* Create task — backend restricts to managers; backend 403s unauthorized */}
        <Link
          href="/tasks/create"
          id="create-task-button"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Task
        </Link>
      </div>

      {/* ── Status summary chips ──────────────────────────────────────────── */}
      {!isLoading && !isError && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(
            [
              { label: "Pending",   count: pending,   status: "PENDING"   as const, color: "text-amber-600 bg-amber-50 border-amber-200"  },
              { label: "Submitted", count: submitted, status: "SUBMITTED" as const, color: "text-indigo-600 bg-indigo-50 border-indigo-200" },
              { label: "Approved",  count: approved,  status: "APPROVED"  as const, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
              { label: "Rejected",  count: rejected,  status: "REJECTED"  as const, color: "text-rose-600 bg-rose-50 border-rose-200"     },
            ] as const
          ).map(({ label, count, status, color }) => (
            <button
              key={status}
              onClick={() => setStatusFilter(statusFilter === status ? "ALL" : status)}
              className={`flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all ${
                statusFilter === status
                  ? `${color} ring-2 ring-offset-1 ring-blue-300`
                  : "bg-white border-slate-200 hover:bg-slate-50"
              }`}
              aria-pressed={statusFilter === status}
            >
              <span className="text-xs font-semibold text-slate-600">{label}</span>
              <span className={`text-lg font-bold ${statusFilter === status ? "" : "text-slate-800"}`}>
                {count}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* ── Filters bar ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            id="task-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks…"
            className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
          />
        </div>

        {/* Priority filter */}
        <select
          id="priority-filter"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as PriorityFilter)}
          className="px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
          aria-label="Filter by priority"
        >
          <option value="ALL">All Priorities</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>

        {/* Clear filters */}
        {(statusFilter !== "ALL" || priorityFilter !== "ALL" || search) && (
          <button
            onClick={() => { setStatusFilter("ALL"); setPriorityFilter("ALL"); setSearch(""); }}
            className="px-3.5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* ── API Error ─────────────────────────────────────────────────────── */}
      {isError && (
        <div role="alert" className="flex items-start gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-sm">
          <svg className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="font-semibold text-rose-800">Failed to load tasks</p>
            <p className="text-rose-600 text-xs mt-0.5">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* ── Results count (when filtering) ───────────────────────────────── */}
      {!isLoading && !isError && (statusFilter !== "ALL" || priorityFilter !== "ALL" || search) && (
        <p className="text-xs text-slate-500">
          Showing {filtered.length} of {tasks.length} task{tasks.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* ── Task table ────────────────────────────────────────────────────── */}
      <TaskTable tasks={filtered} isLoading={isLoading} />

    </div>
  );
}
