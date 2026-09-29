import React from "react";
import AppShell from "@/components/layout/AppShell";

/**
 * Dashboard route-group layout.
 *
 * This layout wraps all routes inside app/(dashboard)/ with the AppShell
 * (Sidebar + Header). The route group folder name `(dashboard)` is not
 * part of the URL — it is only used for layout grouping.
 *
 * Routes covered:
 *   /dashboard
 *   /tasks
 *   /notifications
 *   /users
 *   /departments
 *   /profile
 *
 * AppShell is a Client Component (it manages mobile sidebar state),
 * so this Server Component simply imports and renders it.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
