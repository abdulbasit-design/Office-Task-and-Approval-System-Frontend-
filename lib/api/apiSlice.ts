import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";
import type { RootState, AppDispatch } from "../store";
import { setAccessToken, clearAccessToken } from "../slices/authSlice";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/** Proactive refresh triggers 2 minutes (120,000 ms) before JWT exp */
const REFRESH_BUFFER_MS = 2 * 60 * 1000;

/** Fallback delay (13 minutes) if JWT exp claim is missing */
const DEFAULT_FALLBACK_DELAY_MS = 13 * 60 * 1000;

/** Maximum safe timeout value for setTimeout (2^31 - 1) */
const MAX_TIMEOUT_MS = 2147483647;

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
  baseUrl: BASE_URL,
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
 * Single-flight refresh mutex lock.
 * Holds the active in-flight Promise for POST /auth/refresh.
 * Both proactive refresh and reactive 401 refresh share this exact same promise.
 */
let refreshPromise: Promise<string | null> | null = null;

/**
 * Cooldown timestamp tracking the last time a refresh failed.
 * Prevents multiple queued requests from triggering a cascade of redundant
 * refresh calls when the refresh cookie is missing or invalid.
 */
let lastRefreshFailedTime = 0;

/**
 * Single proactive timer handle per browser tab.
 */
let proactiveTimerId: ReturnType<typeof setTimeout> | null = null;

/**
 * Reference to dispatch for proactive timer execution.
 */
let activeDispatch: AppDispatch | null = null;

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
 * Safely decodes a JWT payload to extract the `exp` claim (in seconds).
 * NOTE: This is NOT token verification; the backend validates all tokens.
 */
export function getJwtExp(token: string): number | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4 !== 0) {
      base64 += "=";
    }
    const binaryStr = atob(base64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    const decodedStr = new TextDecoder().decode(bytes);
    const payload = JSON.parse(decodedStr);
    if (typeof payload.exp === "number" && !isNaN(payload.exp)) {
      return payload.exp;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Calculates milliseconds until proactive refresh should trigger.
 * Target: approximately 2 minutes before the token's JWT `exp`.
 * For a 15-minute token, this yields approximately 13 minutes.
 */
export function calculateRefreshDelay(token: string): number {
  const expSeconds = getJwtExp(token);
  if (expSeconds !== null) {
    const expMs = expSeconds * 1000;
    const now = Date.now();
    const targetRefreshTime = expMs - REFRESH_BUFFER_MS;
    const delay = targetRefreshTime - now;

    // If token is already within 2 minutes of expiration or expired,
    // trigger refresh immediately (0ms).
    return Math.min(Math.max(0, delay), MAX_TIMEOUT_MS);
  }

  // Fallback to 13 minutes if exp claim is not available
  return DEFAULT_FALLBACK_DELAY_MS;
}

/**
 * Clears the active proactive refresh timer, ensuring no stale or multiple timers exist.
 */
export function clearProactiveTimer(): void {
  if (proactiveTimerId !== null) {
    clearTimeout(proactiveTimerId);
    proactiveTimerId = null;
  }
}

/**
 * Schedules a single proactive refresh timer based on the token's JWT `exp`.
 * Automatically clears any existing timer to guarantee only one active timer per tab.
 */
export function scheduleProactiveRefresh(
  token: string,
  dispatch?: AppDispatch
): void {
  // Client-only guard
  if (typeof window === "undefined") return;

  // Clear any existing timer first
  clearProactiveTimer();

  if (!token) return;
  if (dispatch) activeDispatch = dispatch;

  const delayMs = calculateRefreshDelay(token);

  proactiveTimerId = setTimeout(async () => {
    try {
      if (activeDispatch) {
        await executeTokenRefresh(activeDispatch);
      }
    } catch {
      // Error handling is managed inside executeTokenRefresh
    }
  }, delayMs);
}

/**
 * Centralized token refresh function with single-flight mutex protection.
 *
 * Both:
 *   A. proactive refresh (timer callback)
 *   and
 *   B. reactive 401 refresh (baseQueryWithReauth)
 *
 * MUST call this exact centralized function.
 *
 * Invariants:
 * 1. Within the same browser tab, ONLY ONE refresh request runs at a time.
 * 2. If a refresh is already in-flight, returns the active `refreshPromise`.
 * 3. On refresh success:
 *    - Updates Redux state with setAccessToken(newToken).
 *    - Middleware automatically schedules the next proactive refresh timer.
 *    - Resolves refreshPromise with newToken.
 * 4. On refresh failure:
 *    - Clears proactive timer and Redux accessToken.
 *    - Resets RTK Query state.
 *    - Redirects to /login.
 *    - Sets failure cooldown to prevent loops.
 *    - Resolves refreshPromise with null.
 */
export async function executeTokenRefresh(
  dispatch: AppDispatch
): Promise<string | null> {
  activeDispatch = dispatch;

  // 1. Single-flight mutex check: if a refresh is already active, await the same promise
  if (refreshPromise) {
    return refreshPromise;
  }

  // 2. Cooldown check: prevent cascading refresh storms if refresh recently failed
  if (Date.now() - lastRefreshFailedTime < 5000) {
    return null;
  }

  // 3. Initialize the shared refresh promise
  refreshPromise = (async () => {
    try {
      // Send POST /auth/refresh with HttpOnly cookie credentials
      const response = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = (await response.json()) as { access_token?: string };
        const newToken = data.access_token;

        if (newToken) {
          lastRefreshFailedTime = 0;
          // Store new token in Redux memory only (never localStorage/sessionStorage)
          // Note: dispatching setAccessToken also triggers authTimerMiddleware to schedule the next proactive refresh
          dispatch(setAccessToken(newToken));
          return newToken;
        }
      }

      // Refresh failed (cookie missing, expired, or rejected)
      lastRefreshFailedTime = Date.now();
      clearProactiveTimer();
      dispatch(clearAccessToken());
      dispatch(apiSlice.util.resetApiState());
      handleAuthRedirect();
      return null;
    } catch {
      // Network failure or unexpected exception
      lastRefreshFailedTime = Date.now();
      clearProactiveTimer();
      dispatch(clearAccessToken());
      dispatch(apiSlice.util.resetApiState());
      handleAuthRedirect();
      return null;
    } finally {
      // Always release mutex lock
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Restores an existing session by refreshing the access token.
 * Useful on application startup when Redux has no access token in memory.
 */
export async function restoreSession(dispatch: AppDispatch): Promise<string | null> {
  return executeTokenRefresh(dispatch);
}

/**
 * Custom baseQuery with proactive & reactive token refresh with single-flight mutex protection.
 *
 * HOW IT WORKS:
 * 1. Executes initial request via rawBaseQuery.
 * 2. If response is 401 and endpoint is not a public auth endpoint:
 *    - Checks if the token was already refreshed while this request was in-flight (tokenAtStart check).
 *      If so, immediately retries with the new token without requesting another refresh.
 *    - Calls the centralized executeTokenRefresh function.
 *    - If refresh is already running (e.g. proactive refresh or concurrent 401), awaits the same promise.
 * 3. On refresh success:
 *    - Retries the original request ONCE with the new token.
 * 4. On refresh failure:
 *    - User is cleanly signed out and redirected to /login.
 * 5. Infinite refresh loops are prevented because retries occur AT MOST ONCE.
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
      // Another request or proactive timer already completed the refresh. Retry immediately with currentToken.
      result = await rawBaseQuery(args, api, extraOptions);
      return result;
    }

    // Call centralized refresh function with single-flight protection
    const newToken = await executeTokenRefresh(api.dispatch as AppDispatch);

    if (newToken) {
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


