import { apiSlice } from "./apiSlice";

// ─────────────────────────────────────────────────────────────────────────────
// Types — mirror FastAPI task_schema.py exactly
// ─────────────────────────────────────────────────────────────────────────────

/**
 * TaskResponse — matches FastAPI TaskResponse schema.
 * activity_log entries have shape: { action: string; user_id: number }
 */
export interface ActivityLogEntry {
  action: string;
  user_id: number;
  user_name?: string | null;
}

export interface TaskResponse {
  id: number;
  title: string;
  description: string | null;
  created_by: number;
  assigned_to: number;
  deadline: string;             // ISO 8601 datetime string
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "PENDING" | "SUBMITTED" | "APPROVED" | "REJECTED";
  submitted_at: string | null;
  submission_note: string | null;
  approved_at: string | null;
  approved_by: number | null;
  rejection_reason: string | null;
  activity_log: ActivityLogEntry[];
  created_at: string;           // ISO 8601 datetime string
  assigned_to_name?: string | null;
  created_by_name?: string | null;
  approved_by_name?: string | null;
  department_name?: string | null;
}

/**
 * TaskCreate — matches FastAPI TaskCreate schema (POST /tasks).
 * Only managers can create tasks (role enforced by backend).
 *
 * title:       1–255 chars, required
 * description: optional free text
 * assigned_to: user id (integer), must be an active user
 * deadline:    ISO 8601 datetime string
 * priority:    "LOW" | "MEDIUM" | "HIGH"
 */
export interface TaskCreate {
  title: string;
  description?: string | null;
  assigned_to: number;
  deadline: string;   // ISO 8601 — e.g. "2026-10-15T17:00:00"
  priority: "LOW" | "MEDIUM" | "HIGH";
}

/**
 * TaskUpdate — matches FastAPI TaskUpdate schema (PUT /tasks/{id}).
 * Same fields as TaskCreate — manager-only.
 */
export interface TaskUpdate {
  title: string;
  description?: string | null;
  assigned_to: number;
  deadline: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
}

/**
 * TaskSubmit — matches FastAPI TaskSubmit schema (POST /tasks/{id}/submit).
 * Employee-only. Task must be PENDING or REJECTED.
 *
 * submission_note: optional free text
 */
export interface TaskSubmit {
  submission_note?: string | null;
}

/**
 * TaskReject — matches FastAPI TaskReject schema (POST /tasks/{id}/reject).
 * Manager-only. Task must be SUBMITTED.
 *
 * rejection_reason: required, 1–1000 chars
 */
export interface TaskReject {
  rejection_reason: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// RTK Query endpoints — injected into the central apiSlice
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Task API endpoints.
 *
 * GET  /tasks                    → list[TaskResponse]   (role-filtered)
 * GET  /tasks/{id}               → TaskResponse
 * POST /tasks                    → TaskResponse (201)   manager only
 * PUT  /tasks/{id}               → TaskResponse         manager only
 * POST /tasks/{id}/submit        → TaskResponse         employee only, PENDING|REJECTED
 * POST /tasks/{id}/approve       → TaskResponse         manager only, SUBMITTED
 * POST /tasks/{id}/reject        → TaskResponse         manager only, SUBMITTED
 *
 * Cache invalidation: all mutations invalidate the "Tasks" tag so list
 * and detail views refresh after any state change.
 */
export const taskApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ── Queries ─────────────────────────────────────────────────────────────

    getTasks: builder.query<TaskResponse[], void>({
      query: () => "/tasks",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Tasks" as const, id })),
              { type: "Tasks", id: "LIST" },
            ]
          : [{ type: "Tasks", id: "LIST" }],
    }),

    getTask: builder.query<TaskResponse, number>({
      query: (id) => `/tasks/${id}`,
      providesTags: (_result, _err, id) => [{ type: "Tasks", id }],
    }),

    // ── Mutations ───────────────────────────────────────────────────────────

    /** POST /tasks — manager only */
    createTask: builder.mutation<TaskResponse, TaskCreate>({
      query: (body) => ({
        url: "/tasks",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Tasks", id: "LIST" }],
    }),

    /** PUT /tasks/{id} — manager only */
    updateTask: builder.mutation<TaskResponse, { id: number; body: TaskUpdate }>({
      query: ({ id, body }) => ({
        url: `/tasks/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _err, { id }) => [
        { type: "Tasks", id },
        { type: "Tasks", id: "LIST" },
      ],
    }),

    /** POST /tasks/{id}/submit — employee only, task must be PENDING or REJECTED */
    submitTask: builder.mutation<TaskResponse, { id: number; body: TaskSubmit }>({
      query: ({ id, body }) => ({
        url: `/tasks/${id}/submit`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _err, { id }) => [
        { type: "Tasks", id },
        { type: "Tasks", id: "LIST" },
      ],
    }),

    /** POST /tasks/{id}/approve — manager only, task must be SUBMITTED */
    approveTask: builder.mutation<TaskResponse, number>({
      query: (id) => ({
        url: `/tasks/${id}/approve`,
        method: "POST",
      }),
      invalidatesTags: (_result, _err, id) => [
        { type: "Tasks", id },
        { type: "Tasks", id: "LIST" },
      ],
    }),

    /** POST /tasks/{id}/reject — manager only, task must be SUBMITTED */
    rejectTask: builder.mutation<TaskResponse, { id: number; body: TaskReject }>({
      query: ({ id, body }) => ({
        url: `/tasks/${id}/reject`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _err, { id }) => [
        { type: "Tasks", id },
        { type: "Tasks", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetTasksQuery,
  useGetTaskQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useSubmitTaskMutation,
  useApproveTaskMutation,
  useRejectTaskMutation,
} = taskApi;
