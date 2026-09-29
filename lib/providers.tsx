"use client";

import React from "react";
import { Provider } from "react-redux";
import { store } from "./store";

/**
 * StoreProvider wraps the app tree in the Redux Provider.
 * Must be a Client Component — placed in app/layout.tsx.
 */
export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Provider store={store}>{children}</Provider>;
}
