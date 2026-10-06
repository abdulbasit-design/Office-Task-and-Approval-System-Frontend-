import { configureStore, type Middleware } from "@reduxjs/toolkit";
import {
  apiSlice,
  scheduleProactiveRefresh,
  clearProactiveTimer,
} from "./api/apiSlice";
import authReducer, {
  setAccessToken,
  clearAccessToken,
} from "./slices/authSlice";

/**
 * Proactive refresh timer middleware.
 * Automatically synchronizes the proactive refresh timer with Redux auth actions:
 * - setAccessToken: clears previous timer and schedules proactive refresh ~2 minutes before token.exp.
 * - clearAccessToken: cancels the active timer (e.g. on logout or session expiration).
 */
const authTimerMiddleware: Middleware = (storeApi) => (next) => (action) => {
  const result = next(action);

  if (setAccessToken.match(action)) {
    scheduleProactiveRefresh(action.payload, storeApi.dispatch);
  } else if (clearAccessToken.match(action)) {
    clearProactiveTimer();
  }

  return result;
};

export const store = configureStore({
  reducer: {
    // In-memory auth state (access token lives here, never in storage)
    auth: authReducer,
    // Single reducer path for all injected endpoint slices
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware, authTimerMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

