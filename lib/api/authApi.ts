import { apiSlice } from "./apiSlice";

// ── Types matching FastAPI user_schema.py ──────────────────────────
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface SignupRequest {
  full_name: string;
  email: string;
  password: string;
}

export interface SignupResponse {
  id: number;
  full_name: string;
  email: string;
  role: string;
  department_id: number | null;
  manager_id: number | null;
  is_active: boolean;
  joined_at: string;
}

/**
 * The backend /auth/refresh endpoint reads the refresh_token from the
 * HttpOnly cookie (sent automatically by the browser) and returns a
 * new access token in the response body.
 */
export interface RefreshResponse {
  access_token: string;
  token_type: string;
}

export interface LogoutResponse {
  message: string;
}

/**
 * Auth API endpoints injected into the central apiSlice.
 *
 * POST /auth/login   → { access_token, token_type }
 *                      Sets refresh_token as HttpOnly cookie (backend)
 * POST /auth/signup  → UserResponse (201)
 * POST /auth/refresh → { access_token, token_type }
 *                      Backend reads refresh_token cookie automatically
 *                      No body required from the frontend.
 * POST /auth/logout  → { message }
 *                      Backend deletes the refresh_token cookie.
 */
export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Auth", "Tasks", "Notifications", "Users", "Departments"],
    }),

    signup: builder.mutation<SignupResponse, SignupRequest>({
      query: (userData) => ({
        url: "/auth/signup",
        method: "POST",
        body: userData,
      }),
    }),

    /**
     * Refresh access token.
     * No body is sent — the browser sends the HttpOnly refresh_token
     * cookie automatically due to credentials: "include" on the baseQuery.
     * The backend (POST /auth/refresh) reads the cookie directly.
     */
    refreshToken: builder.mutation<RefreshResponse, void>({
      query: () => ({
        url: "/auth/refresh",
        method: "POST",
      }),
    }),

    /**
     * Logout.
     * Backend deletes the refresh_token cookie server-side.
     * Frontend should dispatch clearAccessToken() afterwards.
     */
    logout: builder.mutation<LogoutResponse, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["Auth", "Tasks", "Notifications", "Users", "Departments"],
    }),

    /**
     * Get Current User Profile.
     * GET /auth/me
     * Returns UserResponse for currently authenticated user.
     */
    getMe: builder.query<SignupResponse, void>({
      query: () => "/auth/me",
      providesTags: ["Auth"],
      keepUnusedDataFor: 0,
    }),
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useSignupMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
  useGetMeQuery,
} = authApi;

