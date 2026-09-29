"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCreateTaskMutation } from "@/lib/api/taskApi";
import TaskForm from "@/components/tasks/TaskForm";
import type { TaskCreate } from "@/lib/api/taskApi";

// ── Helper: extract API error detail ─────────────────────────────────────
function extractError(err: unknown): string {
  if (err && typeof err === "object") {
    if ("data" in err) {
      const d = (err as { data: { detail?: string | Array<{ msg: string }> } }).data;
      if (typeof d?.detail === "string") return d.detail;
      if (Array.isArray(d?.detail)) return d.detail.map((x) => x.msg).join(", ");
    }
    if ("error" in err) return (err as { error: string }).error;
  }
  return "An unexpected error occurred. Please try again.";
}

// ── Page ──────────────────────────────────────────────────────────────────
export default function CreateTaskPage() {
  const router = useRouter();
  const [createTask, { isLoading }] = useCreateTaskMutation();
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(data: TaskCreate) {
    setApiError(null);
    try {
      await createTask(data).unwrap();
      setSuccess(true);
      // Brief success flash, then navigate back to task list
      setTimeout(() => router.push("/tasks"), 1000);
    } catch (err) {
      setApiError(extractError(err));
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* ── Breadcrumb ────────────────────────────────────────────────────── */}
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-xs text-slate-500">
          <li>
            <Link href="/tasks" className="hover:text-blue-600 transition-colors font-medium">
              Tasks
            </Link>
          </li>
          <li aria-hidden="true">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </li>
          <li className="text-slate-800 font-semibold" aria-current="page">New Task</li>
        </ol>
      </nav>

      {/* ── Card ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">

        {/* Card header */}
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Create a new task</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Fill in the details below. Only managers can create tasks — the backend will reject unauthorized requests.
          </p>
        </div>

        {/* Success banner */}
        {success && (
          <div role="status" className="mx-6 mt-5 flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700">
            <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Task created successfully! Redirecting…</span>
          </div>
        )}

        {/* Form */}
        <div className="px-6 py-6">
          <TaskForm
            onSubmit={handleSubmit}
            isLoading={isLoading || success}
            apiError={apiError}
            submitLabel="Create Task"
            onCancel={() => router.push("/tasks")}
          />
        </div>
      </div>

      {/* ── Role note ─────────────────────────────────────────────────────── */}
      <div className="flex items-start gap-2.5 px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
        <svg className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>
          <span className="font-semibold">Role note:</span> Only users with the{" "}
          <span className="font-semibold text-blue-700">manager</span> role can create tasks.
          The backend will return 403 for any other role.
        </p>
      </div>
    </div>
  );
}
