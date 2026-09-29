import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";

/**
 * Central RTK Query base API slice.
 * All feature-specific API slices inject their endpoints into this one
 * via `injectEndpoints`, sharing a single baseQuery with auth headers.
 *
 * Token architecture:
 *   - Access token  → lives in Redux state (state.auth.accessToken) only.
 *                     Never touches localStorage or sessionStorage.
 *   - Refresh token → lives in the HttpOnly cookie set by the backend.
 *                     JavaScript cannot read it. The browser sends it
 *                     automatically on every request because of
 *                     credentials: "include".
 */
export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
    // Send the HttpOnly refresh_token cookie on every request.
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      // Read the access token from Redux state only — no storage reads.
      const token = (getState() as RootState).auth.accessToken;

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
  // Cache tag types used across injected endpoint slices
  tagTypes: ["Tasks", "Notifications", "Users", "Departments", "Auth"],
  // Feature endpoints are injected by each api file (e.g. taskApi.ts)
  endpoints: () => ({}),
});

