import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./api/apiSlice";
import authReducer from "./slices/authSlice";

export const store = configureStore({
  reducer: {
    // In-memory auth state (access token lives here, never in storage)
    auth: authReducer,
    // Single reducer path for all injected endpoint slices
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
