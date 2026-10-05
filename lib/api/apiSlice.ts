import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";
import { setAccessToken, clearAccessToken } from "../slices/authSlice";

/**
 * Underlying baseQuery for all API requests.
 *
 * Token architecture:
 *   - Access token  → lives in Redux state (state.auth.accessToken) in JS memory only.
 *                     Never touches localStorage or sessionStorage.
 *   - Refresh token → lives in the HttpOnly cookie set by the backend.
 *                     JavaScript cannot read or modify it. The browser sends it
 *                     automatically on every request because of credentials: "include".
 */
const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  // Send the HttpOnly refresh_token cookie automatically with every request.
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    // Read the access token from Redux state only — no storage reads.
    const token = (getState() as RootState).auth.accessToken;

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    } else {
      headers.delete("Authorization");
    }

    return headers;
  },
});

/**
 * Single-flight refresh lock.
 *
 * WHY ONLY ONE REFRESH CAN RUN:
 * `refreshPromise` stores the active in-flight Promise for POST /auth/refresh.
 * When a request encounters a 401, it initializes `refreshPromise`. Any other
 * concurrent request that encounters a 401 while `refreshPromise` is non-null
 * will NOT trigger another POST /auth/refresh; instead, it shares this exact same
 * promise.
 */
let refreshPromise: Promise<string | null> | null = null;

/**
 * Cooldown timestamp tracking the last time a refresh failed.
 * Prevents multiple queued requests from triggering a cascade of redundant
 * refresh calls when the refresh cookie is missing or invalid.
 */
let lastRefreshFailedTime = 0;

/**
 * Helper to identify endpoints that must NEVER trigger automatic token refresh.
 * - /auth/login: Bad credentials should return 401 directly to the login form.
 * - /auth/refresh: Prevents recursive refresh calls if the refresh endpoint itself fails.
 * - /auth/signup & /auth/forgot-password: Public endpoints where 401 is not an expired token.
 */
function isNonRefreshableAuthEndpoint(args: string | FetchArgs): boolean {
  const url = typeof args === "string" ? args : args.url;
  return (
    url.includes("/auth/login") ||
    url.includes("/auth/refresh") ||
    url.includes("/auth/signup") ||
    url.includes("/auth/forgot-password")
  );
}

/**
 * Safely redirects the user to /login upon complete authentication failure.
 * Does not redirect if already on an authentication route.
 */
function handleAuthRedirect() {
  if (typeof window !== "undefined") {
    const pathname = window.location.pathname;
    const isPublicAuthRoute =
      pathname === "/login" ||
      pathname === "/signup" ||
      pathname.startsWith("/forgot-password");

    if (!isPublicAuthRoute) {
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = "/login";
    }
  }
}

/**
 * Custom baseQuery with automatic, robust single-flight token refresh.
 *
 * HOW IT WORKS:
 * 1. Executes initial request via rawBaseQuery.
 * 2. If response is 401 and endpoint is not a public auth endpoint:
 *    - Checks if the token was already refreshed by another concurrent request
 *      while this request was in-flight. If so, immediately retries with the new token.
 *    - If refresh is already running, waits for the existing `refreshPromise`.
 *    - If no refresh is running, starts POST /auth/refresh and stores it in `refreshPromise`.
 * 3. On refresh success:
 *    - Dispatches `setAccessToken(newToken)` into Redux memory.
 *    - Resolves `refreshPromise` with the new token.
 *    - Retries the original request ONCE with the new token.
 * 4. On refresh failure:
 *    - Dispatches `clearAccessToken()` and resets RTK Query cache.
 *    - Redirects to `/login`.
 *    - Resolves `refreshPromise` with null so all waiting requests fail cleanly.
 * 5. HOW INFINITE REFRESH LOOPS ARE PREVENTED:
 *    - Requests retry AT MOST ONCE. There is no recursion or loop. If the retry fails,
 *      its error is returned directly to the caller.
 *    - `isNonRefreshableAuthEndpoint` prevents refresh calls from being triggered by auth endpoints.
 *    - Cooldown check prevents immediate re-triggering if refresh failed.
 */
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // Capture access token at the moment this request starts
  const tokenAtStart = (api.getState() as RootState).auth.accessToken;

  // Execute original request
  let result = await rawBaseQuery(args, api, extraOptions);

  // Check if request failed due to unauthorized access token (401 only)
  // Only 401 triggers refresh (not 400, 403, 404, 422, 500, etc.)
  if (
    result.error &&
    result.error.status === 401 &&
    !isNonRefreshableAuthEndpoint(args)
  ) {
    // Check if token was already refreshed while this request was in flight
    const currentToken = (api.getState() as RootState).auth.accessToken;
    if (currentToken && currentToken !== tokenAtStart) {
      // HOW THE NEW ACCESS TOKEN REACHES WAITING REQUESTS:
      // Another request already completed the refresh. Retry immediately with currentToken.
      result = await rawBaseQuery(args, api, extraOptions);
      return result;
    }

    // If refresh recently failed, do not attempt to refresh again
    if (Date.now() - lastRefreshFailedTime < 5000) {
      return result;
    }

    // WHY ONLY ONE REFRESH CAN RUN:
    // If no refresh is currently active, initialize the single-flight refresh promise.
    if (!refreshPromise) {
      refreshPromise = (async () => {
        try {
          // Send POST /auth/refresh. Browser sends HttpOnly cookie automatically.
          const refreshResult = await rawBaseQuery(
            { url: "/auth/refresh", method: "POST" },
            api,
            extraOptions
          );

          if (refreshResult.data) {
            const data = refreshResult.data as { access_token: string };
            const newToken = data.access_token;

            // Store new token in Redux memory only (never localStorage/sessionStorage)
            api.dispatch(setAccessToken(newToken));
            lastRefreshFailedTime = 0;
            return newToken;
          } else {
            // HOW REFRESH FAILURE LOGS THE USER OUT:
            // Cookie missing or expired -> clear Redux memory, reset cache, redirect to /login
            lastRefreshFailedTime = Date.now();
            api.dispatch(clearAccessToken());
            api.dispatch(apiSlice.util.resetApiState());
            handleAuthRedirect();
            return null;
          }
        } catch {
          lastRefreshFailedTime = Date.now();
          api.dispatch(clearAccessToken());
          api.dispatch(apiSlice.util.resetApiState());
          handleAuthRedirect();
          return null;
        } finally {
          // Release the lock so subsequent expirations can trigger a new refresh
          refreshPromise = null;
        }
      })();
    }

    // WHY OTHER FAILED REQUESTS WAIT:
    // All concurrent requests await the exact same active refresh promise
    const newToken = await refreshPromise;

    if (newToken) {
      // HOW INFINITE REFRESH LOOPS ARE PREVENTED:
      // Retry original request exactly once using rawBaseQuery.
      // prepareHeaders will automatically read the updated token from Redux state.
      result = await rawBaseQuery(args, api, extraOptions);
    }
  }

  return result;
};

/**
 * Central RTK Query base API slice.
 * All feature-specific API slices inject their endpoints into this one
 * via `injectEndpoints`, sharing the single baseQueryWithReauth.
 */
export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  // Cache tag types used across injected endpoint slices
  tagTypes: ["Tasks", "Notifications", "Users", "Departments", "Auth", "PasswordResetRequests"],
  // Feature endpoints are injected by each api file (e.g. taskApi.ts)
  endpoints: () => ({}),
});


