import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

/**
 * authSlice — in-memory access token store.
 *
 * Security design:
 *   - The access token lives ONLY in Redux state (JavaScript memory).
 *   - It is never written to localStorage or sessionStorage.
 *   - It is wiped on tab close / page refresh — that is intentional.
 *   - Refresh is handled by POST /auth/refresh, which reads the HttpOnly
 *     refresh_token cookie that the browser sends automatically.
 *   - Frontend JS cannot read or write the refresh_token cookie.
 */
interface AuthState {
  accessToken: string | null;
}

const initialState: AuthState = {
  accessToken: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /**
     * Called after a successful login or token refresh.
     * Stores the new access token in Redux memory only.
     */
    setAccessToken(state, action: PayloadAction<string>) {
      state.accessToken = action.payload;
    },

    /**
     * Called on logout. Clears the access token from Redux memory.
     * The refresh_token HttpOnly cookie is deleted server-side by
     * POST /auth/logout.
     */
    clearAccessToken(state) {
      state.accessToken = null;
    },
  },
});

export const { setAccessToken, clearAccessToken } = authSlice.actions;
export default authSlice.reducer;

/** Selector — read access token from Redux state */
export const selectAccessToken = (state: RootState) =>
  state.auth.accessToken;
