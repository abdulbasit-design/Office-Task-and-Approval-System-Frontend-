"use client";

import React from "react";
import StatCard from "@/components/dashboard/StatCard";
import RecentTasks from "@/components/dashboard/RecentTasks";
import TaskOverview, { deriveBreakdown } from "@/components/dashboard/TaskOverview";
import { useGetTasksQuery } from "@/lib/api/taskApi";
import { useGetMeQuery } from "@/lib/api/authApi";

// ── SVG Icons ───────────────────────────────────────────────────────
function ClipboardIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

// ── Skeleton loader for stat cards ───────────────────────────────────
function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-5 sm:p-6 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="h-3 bg-slate-200 rounded w-24" />
          <div className="h-8 bg-slate-200 rounded w-16" />
        </div>
        <div className="w-11 h-11 bg-slate-200 rounded-xl shrink-0" />
      </div>
      <div className="mt-4 pt-3 border-t border-slate-100">
        <div className="h-3 bg-slate-100 rounded w-32" />
      </div>
    </div>
  );
}

// ── Helper: greeting from current hour ───────────────────────────────
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// ── Helper: today's formatted date ───────────────────────────────────
function getTodayLabel(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ── Dashboard Page ───────────────────────────────────────────────────
export default function DashboardPage() {
  /**
   * useGetTasksQuery calls GET /tasks with the Bearer token injected
   * by apiSlice's prepareHeaders. The backend returns list[TaskResponse]
   * filtered by the logged-in user's role.
   */
  const { data: tasks = [], isLoading, isError, error } = useGetTasksQuery();
  const { data: currentUser } = useGetMeQuery();

  // ── Derive statistics from real backend data ──────────────────────
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter((t) => t.status === "PENDING").length;
  const submittedTasks = tasks.filter((t) => t.status === "SUBMITTED").length;
  const approvedTasks = tasks.filter((t) => t.status === "APPROVED").length;

  // TaskOverview breakdown (all 4 statuses)
  const breakdown = deriveBreakdown(tasks);

  const greeting = getGreeting();
  const greetingText = currentUser?.full_name
    ? `${greeting} ${currentUser.full_name}`
    : greeting;

  // ── Extract error message from RTK Query error shape ─────────────
  const errorMessage = (() => {
    if (!error) return "An error occurred while loading your tasks.";
    if ("data" in error) {
      const d = (error as { data: { detail?: string } }).data;
      return d?.detail ?? "Failed to load tasks.";
    }
    if ("error" in error) {
      return (error as { error: string }).error;
    }
    return "An unexpected error occurred.";
  })();

  return (
    <div className="space-y-7 sm:space-y-8">

      {/* ── Sub-heading: date ── */}
      <div>
        <p className="text-xs text-slate-500">{getTodayLabel()}</p>
      </div>

      {/* ── API Error Banner ── */}
      {isError && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-sm"
        >
          <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="font-semibold text-red-800">Failed to load tasks</p>
            <p className="text-red-600 text-xs mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* ── Welcome Banner ── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-5 sm:p-7 shadow-md">
        <div className="pointer-events-none absolute -top-8 -right-8 w-40 h-40 rounded-full bg-blue-600/20 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 right-20 w-32 h-32 rounded-full bg-indigo-500/15 blur-xl" />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {greetingText} 👋
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-sm leading-relaxed">
              Here&apos;s an overview of your tasks and activity.{" "}
              {!isLoading && !isError && pendingTasks > 0 && (
                <>
                  You have{" "}
                  <span className="text-amber-400 font-semibold">
                    {pendingTasks} pending task{pendingTasks !== 1 ? "s" : ""}
                  </span>{" "}
                  awaiting action.
                </>
              )}
              {!isLoading && !isError && pendingTasks === 0 && (
                <span className="text-emerald-400 font-medium">
                  All caught up — no pending tasks!
                </span>
              )}
              {isLoading && (
                <span className="text-slate-400 animate-pulse">Loading your tasks...</span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <div className="bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-center min-w-[72px]">
              {isLoading ? (
                <div className="h-7 w-8 bg-white/20 rounded animate-pulse mx-auto" />
              ) : (
                <p className="text-2xl font-bold text-white">{submittedTasks}</p>
              )}
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Submitted</p>
            </div>
            <div className="bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-center min-w-[72px]">
              {isLoading ? (
                <div className="h-7 w-8 bg-white/20 rounded animate-pulse mx-auto" />
              ) : (
                <p className="text-2xl font-bold text-emerald-400">{approvedTasks}</p>
              )}
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Approved</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat Cards Grid ── */}
      <section aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="sr-only">Task Statistics</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {isLoading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <StatCard
                title="Total Tasks"
                value={totalTasks}
                icon={<ClipboardIcon />}
                accentColor="blue"
                description="All assigned tasks"
              />
              <StatCard
                title="Pending Tasks"
                value={pendingTasks}
                icon={<ClockIcon />}
                accentColor="amber"
                description={pendingTasks > 0 ? "Awaiting action" : "None pending"}
              />
              <StatCard
                title="Submitted"
                value={submittedTasks}
                icon={<SpinnerIcon />}
                accentColor="indigo"
                description="Awaiting review"
              />
              <StatCard
                title="Approved"
                value={approvedTasks}
                icon={<CheckCircleIcon />}
                accentColor="emerald"
                description="Successfully closed"
              />
            </>
          )}
        </div>
      </section>

      {/* ── Bottom Grid: Recent Tasks + Overview ── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">
        {/* Recent Tasks Table */}
        <section aria-labelledby="recent-tasks-heading">
          <h2 id="recent-tasks-heading" className="sr-only">Recent Tasks</h2>
          {isLoading ? (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6 animate-pulse space-y-4">
              <div className="h-5 bg-slate-200 rounded w-32" />
              <div className="h-4 bg-slate-100 rounded w-64" />
              <div className="space-y-3 mt-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex gap-4">
                    <div className="h-4 bg-slate-100 rounded flex-1" />
                    <div className="h-4 bg-slate-100 rounded w-20" />
                    <div className="h-4 bg-slate-100 rounded w-16" />
                    <div className="h-4 bg-slate-100 rounded w-24" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <RecentTasks tasks={tasks} />
          )}
        </section>

        {/* Task Overview Sidebar */}
        <section aria-labelledby="task-overview-heading">
          <h2 id="task-overview-heading" className="sr-only">Task Overview</h2>
          {isLoading ? (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6 animate-pulse space-y-4">
              <div className="h-5 bg-slate-200 rounded w-32" />
              <div className="h-3 bg-slate-200 rounded-full mt-5" />
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-3 bg-slate-100 rounded w-24" />
                  <div className="h-2 bg-slate-100 rounded-full flex-1" />
                  <div className="h-5 bg-slate-100 rounded w-14" />
                </div>
              ))}
            </div>
          ) : (
            <TaskOverview breakdown={breakdown} total={totalTasks} />
          )}
        </section>
      </div>
    </div>
  );
}
