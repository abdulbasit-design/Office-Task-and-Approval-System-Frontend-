"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CaretLeft, CheckCircle } from "@phosphor-icons/react";
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
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/tasks" className="inline-flex items-center gap-1 text-[14px] font-semibold text-note-ink hover:underline">
        <CaretLeft size={14} weight="bold" /> Tasks
      </Link>

      <section className="frame px-6 py-7 sm:px-9 sm:py-8">
        <h2 className="font-display text-[30px] leading-tight text-ink">Issue a new task</h2>
        <p className="mt-1 max-w-[60ch] text-ink-2">
          The assignee is notified as soon as you create it. It comes back to you for countersignature when they submit.
        </p>

        {success && (
          <div role="status" className="mt-5 flex items-center gap-2.5 rounded-sm border border-ok/40 bg-ok-tint p-3.5 text-[14px] text-ok">
            <CheckCircle size={18} weight="fill" className="shrink-0" />
            <span>Task created. Returning to your tasks...</span>
          </div>
        )}

        <div className="mt-7">
          <TaskForm
            onSubmit={handleSubmit}
            isLoading={isLoading || success}
            apiError={apiError}
            submitLabel="Create task"
            onCancel={() => router.push("/tasks")}
          />
        </div>
      </section>
    </div>
  );
}
