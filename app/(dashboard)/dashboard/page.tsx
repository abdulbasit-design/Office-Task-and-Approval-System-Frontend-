"use client";

import React from "react";
import Link from "next/link";
import { Plus, WarningCircle } from "@phosphor-icons/react";
import RefreshButton from "@/components/ui/RefreshButton";
import TaskQueue from "@/components/dashboard/TaskQueue";
import { RecentlySealed, Register } from "@/components/dashboard/Register";
import { useGetTasksQuery } from "@/lib/api/taskApi";
import { useGetMeQuery } from "@/lib/api/authApi";
import { greeting } from "@/lib/format";

function Skeleton() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading your tasks">
      <div className="h-[86px] animate-pulse border-y-[3px] border-double border-line-strong bg-paper-sunk" />
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="frame h-[420px] animate-pulse" />
        <div className="panel h-64 animate-pulse" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: tasks = [], isLoading, isError, error, isFetching, refetch } = useGetTasksQuery();
  const { data: me } = useGetMeQuery();
  const role = me?.role ?? "employee";

  const submitted = tasks.filter((t) => t.status === "SUBMITTED");
  const open = tasks.filter((t) => t.status === "PENDING" || t.status === "REJECTED");

  const errorMessage = (() => {
    if (error && "data" in error) return (error as { data: { detail?: string } }).data?.detail ?? "Failed to load tasks.";
    if (error && "error" in error) return (error as { error: string }).error;
    return "The task list could not be loaded. Check that the API is running, then refresh.";
  })();

  const summary =
    role === "manager"
      ? submitted.length === 0
        ? "Nothing is waiting for your countersignature."
        : `${submitted.length} submission${submitted.length === 1 ? " is" : "s are"} waiting for your countersignature.`
      : role === "admin"
        ? `${tasks.length} task${tasks.length === 1 ? "" : "s"} across the organization, ${submitted.length} awaiting a decision.`
        : open.length === 0
          ? "Nothing is waiting on you."
          : `${open.length} task${open.length === 1 ? " is" : "s are"} waiting on you.`;

  // First two words of the name: "QA Manager", "Amara Okafor", "Mary Jane" of "Mary Jane Watson"
  const shortName = me?.full_name?.trim().split(/\s+/).slice(0, 2).join(" ");
  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-[32px] leading-tight text-ink sm:text-[36px]">
            {greeting()}
            {shortName ? `, ${shortName}` : ""}.
          </h2>
          {!isLoading && !isError && <p className="mt-1 text-[16px] text-ink-2">{summary}</p>}
          <p className="mt-1 text-[13px] text-ink-3">{today}</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <RefreshButton onRefresh={refetch} fetching={isFetching} />
          {role === "manager" && (
            <Link href="/tasks/create" className="btn btn-primary">
              <Plus size={16} weight="bold" /> New task
            </Link>
          )}
        </div>
      </div>

      {isError && (
        <div role="alert" className="flex items-start gap-3 rounded-sm border border-serial/50 bg-serial-tint p-4 text-[14px]">
          <WarningCircle size={20} className="mt-0.5 shrink-0 text-serial" />
          <div>
            <p className="font-semibold text-ink">Tasks could not be loaded</p>
            <p className="mt-0.5 text-ink-2">{errorMessage}</p>
          </div>
        </div>
      )}

      {!isLoading && !isError && <Register tasks={tasks} />}

      {isLoading ? (
        <Skeleton />
      ) : (
        !isError && (
          <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
            <div className="min-w-0 space-y-6">
              {role === "employee" ? (
                <>
                  <TaskQueue
                    primary
                    title="Waiting on you"
                    tasks={open}
                    perspective="assignee"
                    emptyTitle="Nothing is waiting on you."
                    emptyBody="New assignments and anything returned for changes will appear here, soonest deadline first."
                  />
                  <TaskQueue
                    title="Awaiting countersignature"
                    tasks={submitted}
                    perspective="assignee"
                    emptyTitle="No submissions under review."
                    emptyBody="Work you submit waits here until your manager approves or returns it."
                  />
                </>
              ) : (
                <>
                  <TaskQueue
                    primary
                    title={role === "manager" ? "Awaiting your countersignature" : "Awaiting countersignature"}
                    tasks={submitted}
                    perspective="approver"
                    emptyTitle="Nothing awaits countersignature."
                    emptyBody="Submissions appear here as soon as they arrive, soonest deadline first."
                  />
                  <TaskQueue
                    title={role === "manager" ? "Out with your team" : "In progress"}
                    tasks={open}
                    perspective="approver"
                    emptyTitle="No open assignments."
                    emptyBody={role === "manager" ? "Create a task to assign work to your team." : "Open assignments across the organization appear here."}
                  />
                </>
              )}
            </div>
            <aside className="space-y-6">
              <RecentlySealed tasks={tasks} />
            </aside>
          </div>
        )
      )}
    </div>
  );
}
