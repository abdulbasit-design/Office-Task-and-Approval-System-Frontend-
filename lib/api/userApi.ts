import { apiSlice } from "./apiSlice";

// ─────────────────────────────────────────────────────────────────────────────
// Types — mirror FastAPI user_schema.py exactly
// ─────────────────────────────────────────────────────────────────────────────

/**
 * UserResponse — matches FastAPI UserResponse schema.
 * Returned by GET /users and GET /users/{id}.
 *
 * NOTE: All user management endpoints are admin-only.
 * Non-admin users will receive HTTP 403 for all requests to /users.
 */
export interface UserResponse {
  id: number;
  full_name: string;
  email: string;
  role: "employee" | "manager" | "admin";
  department_id: number | null;
  manager_id: number | null;
  is_active: boolean;
  joined_at: string;  // ISO 8601 datetime string
  department_name?: string | null;
}

/**
 * UserAdminUpdate — matches FastAPI UserAdminUpdate schema.
 * Used for PUT /users/{id} — admin only.
 *
 * full_name    : 2–150 chars, required
 * email        : valid email, must be unique
 * role         : "employee" | "manager" | "admin"
 * department_id: integer or null
 * manager_id   : integer or null — must refer to a user with role="manager",
 *                cannot be the same as the user being updated
 * is_active    : boolean
 *
 * NOTE: password is NOT part of UserAdminUpdate — password updates go
 * through a separate internal function (update_user_password) with no
 * exposed API endpoint.
 */
export interface UserAdminUpdate {
  full_name: string;
  email: string;
  role: "employee" | "manager" | "admin";
  department_id: number | null;
  manager_id: number | null;
  is_active: boolean;
}

/**
 * DeleteUserResponse — returned by DELETE /users/{id} on success.
 */
export interface DeleteUserResponse {
  message: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// RTK Query endpoints — injected into the central apiSlice
// ─────────────────────────────────────────────────────────────────────────────

/**
 * User API endpoints (ALL admin-only).
 *
 * GET    /users          → list[UserResponse]   admin only
 * GET    /users/{id}     → UserResponse         admin only
 * PUT    /users/{id}     → UserResponse         admin only
 * DELETE /users/{id}     → { message }          admin only
 *
 * There is NO POST /users endpoint — user creation goes through
 * POST /auth/signup and is not part of the admin user management API.
 * Password reset has no exposed endpoint.
 *
 * Cache tags:
 *   "Users" LIST — invalidated by update and delete mutations
 *   "Users" {id} — invalidated by update and delete on that specific user
 *
 * NOTE: Non-admin users will get HTTP 403 for all these endpoints.
 * The frontend renders these pages but the backend is the authority.
 */
export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ── GET /users ────────────────────────────────────────────────────────
    getUsers: builder.query<UserResponse[], void>({
      query: () => "/users",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Users" as const, id })),
              { type: "Users", id: "LIST" },
            ]
          : [{ type: "Users", id: "LIST" }],
    }),

    // ── GET /users/{id} ───────────────────────────────────────────────────
    getUser: builder.query<UserResponse, number>({
      query: (id) => `/users/${id}`,
      providesTags: (_result, _err, id) => [{ type: "Users", id }],
    }),

    // ── PUT /users/{id} ───────────────────────────────────────────────────
    updateUser: builder.mutation<
      UserResponse,
      { id: number; body: UserAdminUpdate }
    >({
      query: ({ id, body }) => ({
        url: `/users/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _err, { id }) => [
        { type: "Users", id },
        { type: "Users", id: "LIST" },
        "Auth",
      ],
    }),

    // ── DELETE /users/{id} ────────────────────────────────────────────────
    /**
     * Backend guards:
     *   - Cannot delete your own account
     *   - Cannot delete if user is referenced by tasks (created_by, assigned_to, approved_by)
     *   - Cannot delete if user is referenced by notifications (user_id)
     *   - Cannot delete if user is referenced as a manager (manager_id on another user)
     * Returns 409 Conflict if any reference exists.
     */
    deleteUser: builder.mutation<DeleteUserResponse, number>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _err, id) => [
        { type: "Users", id },
        { type: "Users", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetUsersQuery,
  useGetUserQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = userApi;
