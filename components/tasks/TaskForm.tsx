"use client";

import React, { useState } from "react";
import type { TaskCreate, TaskUpdate, TaskResponse } from "@/lib/api/taskApi";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/** Union since TaskCreate and TaskUpdate have identical fields */
type TaskFormData = TaskCreate | TaskUpdate;

interface TaskFormProps {
  /**
   * Initial values for edit mode — leave undefined for create mode.
   */
  initialValues?: TaskResponse;
  /** Called with validated form data */
  onSubmit: (data: TaskFormData) => Promise<void>;
  /** Whether the parent mutation is loading */
  isLoading: boolean;
  /** API error message to display */
  apiError?: string | null;
  /** Submit button label */
  submitLabel?: string;
  /** Cancel callback */
  onCancel?: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Convert ISO datetime to the value needed by <input type="datetime-local"> */
function toDatetimeLocal(iso: string): string {
  try {
    const d = new Date(iso);
    // datetime-local expects "YYYY-MM-DDTHH:mm"
    const pad = (n: number) => String(n).padStart(2, "0");
    return (
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
      `T${pad(d.getHours())}:${pad(d.getMinutes())}`
    );
  } catch {
    return "";
  }
}

/** Convert datetime-local string to an ISO string the backend accepts */
function toISOString(datetimeLocal: string): string {
  if (!datetimeLocal) return "";
  return new Date(datetimeLocal).toISOString();
}

// ─────────────────────────────────────────────────────────────────────────────
// Input helper
// ─────────────────────────────────────────────────────────────────────────────
function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-rose-600">{msg}</p>;
}

function Label({ htmlFor, children, required }: { htmlFor: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-semibold text-slate-700 mb-1.5">
      {children}
      {required && <span className="text-rose-500 font-bold ml-0.5">*</span>}
    </label>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TaskForm
// ─────────────────────────────────────────────────────────────────────────────

export default function TaskForm({
  initialValues,
  onSubmit,
  isLoading,
  apiError,
  submitLabel = "Save Task",
  onCancel,
}: TaskFormProps) {
  // ── Field state ────────────────────────────────────────────────────────────
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [assignedTo, setAssignedTo] = useState(
    initialValues?.assigned_to ? String(initialValues.assigned_to) : ""
  );
  const [deadline, setDeadline] = useState(
    initialValues?.deadline ? toDatetimeLocal(initialValues.deadline) : ""
  );
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH">(
    initialValues?.priority ?? "MEDIUM"
  );

  // ── Validation errors ──────────────────────────────────────────────────────
  const [errors, setErrors] = useState<{
    title?: string;
    assignedTo?: string;
    deadline?: string;
    priority?: string;
  }>({});

  // ── Validation ─────────────────────────────────────────────────────────────
  function validate(): boolean {
    const next: typeof errors = {};

    if (!title.trim()) {
      next.title = "Title is required.";
    } else if (title.trim().length > 255) {
      next.title = "Title must be 255 characters or fewer.";
    }

    if (!assignedTo.trim()) {
      next.assignedTo = "Assignee user ID is required.";
    } else if (isNaN(Number(assignedTo)) || !Number.isInteger(Number(assignedTo)) || Number(assignedTo) <= 0) {
      next.assignedTo = "Please enter a valid positive integer user ID.";
    }

    if (!deadline) {
      next.deadline = "Deadline is required.";
    } else if (new Date(deadline) < new Date()) {
      next.deadline = "Deadline must be in the future.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const data: TaskFormData = {
      title: title.trim(),
      description: description.trim() || null,
      assigned_to: Number(assignedTo),
      deadline: toISOString(deadline),
      priority,
    };

    await onSubmit(data);
  }

  // ── Input class helper ─────────────────────────────────────────────────────
  function inputClass(hasError?: string) {
    return [
      "w-full px-3.5 py-2.5 text-sm bg-white border rounded-xl text-slate-900",
      "placeholder:text-slate-400 focus:outline-none transition-colors",
      hasError
        ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
        : "border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15",
    ].join(" ");
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-5"
      aria-label="Task form"
    >
      {/* API Error Banner */}
      {apiError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700"
        >
          <svg className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>{apiError}</span>
        </div>
      )}

      {/* Title */}
      <div>
        <Label htmlFor="task-title" required>Title</Label>
        <input
          id="task-title"
          type="text"
          value={title}
          maxLength={255}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title) setErrors((p) => ({ ...p, title: undefined }));
          }}
          placeholder="Enter task title"
          className={inputClass(errors.title)}
          disabled={isLoading}
        />
        <FieldError msg={errors.title} />
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="task-description">Description</Label>
        <textarea
          id="task-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional — provide additional context for this task."
          rows={3}
          className={`${inputClass()} resize-none`}
          disabled={isLoading}
        />
      </div>

      {/* Assigned To (user ID) */}
      <div>
        <Label htmlFor="task-assigned-to" required>Assign To (User ID)</Label>
        <input
          id="task-assigned-to"
          type="number"
          min={1}
          step={1}
          value={assignedTo}
          onChange={(e) => {
            setAssignedTo(e.target.value);
            if (errors.assignedTo) setErrors((p) => ({ ...p, assignedTo: undefined }));
          }}
          placeholder="e.g. 42"
          className={inputClass(errors.assignedTo)}
          disabled={isLoading}
        />
        <p className="mt-1 text-[11px] text-slate-400">
          Enter the numeric user ID of the employee to assign this task to.
        </p>
        <FieldError msg={errors.assignedTo} />
      </div>

      {/* Deadline */}
      <div>
        <Label htmlFor="task-deadline" required>Deadline</Label>
        <input
          id="task-deadline"
          type="datetime-local"
          value={deadline}
          onChange={(e) => {
            setDeadline(e.target.value);
            if (errors.deadline) setErrors((p) => ({ ...p, deadline: undefined }));
          }}
          className={inputClass(errors.deadline)}
          disabled={isLoading}
        />
        <FieldError msg={errors.deadline} />
      </div>

      {/* Priority */}
      <div>
        <Label htmlFor="task-priority" required>Priority</Label>
        <select
          id="task-priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value as "LOW" | "MEDIUM" | "HIGH")}
          className={inputClass(errors.priority)}
          disabled={isLoading}
        >
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>
        <FieldError msg={errors.priority} />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          id="task-form-submit"
          type="submit"
          disabled={isLoading}
          className="flex-1 sm:flex-none py-2.5 px-6 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm rounded-xl shadow-sm transition duration-150 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Saving…
            </>
          ) : (
            submitLabel
          )}
        </button>

        {onCancel && (
          <button
            id="task-form-cancel"
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="py-2.5 px-5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl transition duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
