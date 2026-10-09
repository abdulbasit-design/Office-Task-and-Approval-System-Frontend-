"use client";

import React, { useState, useMemo } from "react";
import { WarningCircle } from "@phosphor-icons/react";
import type { TaskCreate, TaskUpdate, TaskResponse } from "@/lib/api/taskApi";
import { useGetUsersQuery } from "@/lib/api/userApi";
import { useGetDepartmentsQuery } from "@/lib/api/departmentApi";

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

function Field({
  id,
  label,
  required,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
        {required && <span className="ml-1 font-normal text-ink-3">(required)</span>}
      </label>
      {children}
      {hint && !error && <p id={`${id}-hint`} className="field-hint">{hint}</p>}
      {error && <p id={`${id}-error`} className="field-error">{error}</p>}
    </div>
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
  submitLabel = "Save task",
  onCancel,
}: TaskFormProps) {
  // Fetch users and departments so assignees can be chosen by name
  const { data: users = [], isLoading: isUsersLoading } = useGetUsersQuery();
  const { data: departments = [] } = useGetDepartmentsQuery();

  const deptMap = useMemo(() => {
    const map: Record<number, string> = {};
    departments.forEach((d) => {
      map[d.id] = d.name;
    });
    return map;
  }, [departments]);

  const activeUsers = useMemo(() => users.filter((u) => u.is_active), [users]);

  // ── Field state ────────────────────────────────────────────────────────────
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [assignedTo, setAssignedTo] = useState(initialValues?.assigned_to ? String(initialValues.assigned_to) : "");
  const [deadline, setDeadline] = useState(initialValues?.deadline ? toDatetimeLocal(initialValues.deadline) : "");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH">(initialValues?.priority ?? "MEDIUM");

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
      next.assignedTo = "Please select an assignee.";
    } else if (isNaN(Number(assignedTo)) || !Number.isInteger(Number(assignedTo)) || Number(assignedTo) <= 0) {
      next.assignedTo = "Please select a valid assignee.";
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

  const described = (id: string, err?: string, hint?: boolean) =>
    err ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6" aria-label="Task form">
      {apiError && (
        <div role="alert" className="flex items-start gap-3 rounded-sm border border-serial/50 bg-serial-tint p-3.5 text-[14px] text-ink">
          <WarningCircle size={18} className="mt-0.5 shrink-0 text-serial" />
          <span>{apiError}</span>
        </div>
      )}

      <Field id="task-title" label="Title" required error={errors.title}>
        <input
          id="task-title"
          type="text"
          value={title}
          maxLength={255}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title) setErrors((p) => ({ ...p, title: undefined }));
          }}
          placeholder="What needs to be done"
          className="input"
          aria-invalid={errors.title ? true : undefined}
          aria-describedby={described("task-title", errors.title)}
          disabled={isLoading}
        />
      </Field>

      <Field id="task-description" label="Description" hint="Context the assignee needs: scope, sources, what done looks like.">
        <textarea
          id="task-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="input resize-y"
          aria-describedby="task-description-hint"
          disabled={isLoading}
        />
      </Field>

      <Field
        id="task-assigned-to"
        label="Assign to"
        required
        error={errors.assignedTo}
        hint="Only active people are listed."
      >
        {isUsersLoading ? (
          <div className="h-10 animate-pulse rounded-sm bg-paper-sunk" />
        ) : (
          <select
            id="task-assigned-to"
            value={assignedTo}
            onChange={(e) => {
              setAssignedTo(e.target.value);
              if (errors.assignedTo) setErrors((p) => ({ ...p, assignedTo: undefined }));
            }}
            className="input"
            aria-invalid={errors.assignedTo ? true : undefined}
            aria-describedby={described("task-assigned-to", errors.assignedTo, true)}
            disabled={isLoading}
          >
            <option value="">Select a person</option>
            {activeUsers.map((u) => {
              const dept = u.department_name || (u.department_id ? deptMap[u.department_id] : null);
              return (
                <option key={u.id} value={u.id}>
                  {u.full_name} ({u.role}{dept ? `, ${dept}` : ""})
                </option>
              );
            })}
          </select>
        )}
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="task-deadline" label="Deadline" required error={errors.deadline}>
          <input
            id="task-deadline"
            type="datetime-local"
            value={deadline}
            onChange={(e) => {
              setDeadline(e.target.value);
              if (errors.deadline) setErrors((p) => ({ ...p, deadline: undefined }));
            }}
            className="input tabular"
            aria-invalid={errors.deadline ? true : undefined}
            aria-describedby={described("task-deadline", errors.deadline)}
            disabled={isLoading}
          />
        </Field>

        <Field id="task-priority" label="Priority" required error={errors.priority}>
          <select
            id="task-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as "LOW" | "MEDIUM" | "HIGH")}
            className="input"
            disabled={isLoading}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </Field>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:justify-end">
        {onCancel && (
          <button id="task-form-cancel" type="button" onClick={onCancel} disabled={isLoading} className="btn btn-secondary">
            Cancel
          </button>
        )}
        <button id="task-form-submit" type="submit" disabled={isLoading} className="btn btn-primary">
          {isLoading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden="true" />}
          {isLoading ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
