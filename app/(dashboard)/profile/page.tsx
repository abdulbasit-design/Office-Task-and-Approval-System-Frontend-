"use client";

import React from "react";
import { ArrowClockwise, WarningCircle } from "@phosphor-icons/react";
import { useGetMeQuery } from "@/lib/api/authApi";
import { useGetDepartmentQuery } from "@/lib/api/departmentApi";
import { useGetUserQuery } from "@/lib/api/userApi";
import ProfileForm from "@/components/profile/ProfileForm";
import { RoleBadge, StatusBadge } from "@/components/users/UserTable";
import { formatDate } from "@/lib/format";

function getInitials(name: string): string {
  return (
    name
      .split(" ")
      .map((n) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U"
  );
}

const ROLE_SCOPE: Record<string, string> = {
  admin:
    "As an administrator, you manage user accounts and roles, configure departments, and can inspect every record in the system.",
  manager:
    "As a manager, you create tasks, assign them to your team, review submitted work, and approve it or return it with a reason.",
  employee:
    "As an employee, you see the tasks assigned to you, submit completed work for your manager's approval, and are notified as its status changes.",
};

function Skeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-pulse" aria-busy="true" aria-label="Loading your profile">
      <div className="frame flex gap-6 px-6 py-7 sm:px-8">
        <div className="h-16 w-16 shrink-0 rounded-full bg-paper-sunk" />
        <div className="flex-1 space-y-3">
          <div className="h-8 w-64 max-w-full rounded-sm bg-paper-sunk" />
          <div className="h-4 w-48 rounded-sm bg-paper-sunk" />
          <div className="h-6 w-36 rounded-sm bg-paper-sunk" />
          <div className="grid gap-4 border-t border-line pt-5 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-9 rounded-sm bg-paper-sunk" />
            ))}
          </div>
        </div>
      </div>
      <div className="panel space-y-5 px-6 py-5">
        <div className="h-6 w-48 rounded-sm bg-paper-sunk" />
        <div className="grid gap-5 md:grid-cols-2">
          <div className="h-16 rounded-sm bg-paper-sunk" />
          <div className="h-16 rounded-sm bg-paper-sunk" />
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const {
    data: user,
    isLoading: isUserLoading,
    isError: isUserError,
    refetch,
  } = useGetMeQuery();

  // Resolve department name
  const { data: department } = useGetDepartmentQuery(user?.department_id || 0, {
    skip: !user?.department_id,
  });

  // Resolve manager name
  const { data: manager } = useGetUserQuery(user?.manager_id || 0, {
    skip: !user?.manager_id,
  });

  if (isUserLoading) return <Skeleton />;

  if (isUserError || !user) {
    return (
      <div className="max-w-4xl mx-auto">
        <div role="alert" className="flex items-start gap-3 rounded-sm border border-serial/50 bg-serial-tint p-4 text-[14px]">
          <WarningCircle size={20} className="mt-0.5 shrink-0 text-serial" aria-hidden="true" />
          <div>
            <p className="font-semibold text-ink">Your profile could not be loaded</p>
            <p className="mt-0.5 text-ink-2">
              Unable to fetch your profile information from the server. Check your connection, then try again.
            </p>
            <button onClick={() => refetch()} className="btn btn-secondary mt-3 min-h-9">
              <ArrowClockwise size={16} aria-hidden="true" />
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const departmentDisplay = department
    ? department.name
    : user.department_id
    ? (user as { department_name?: string | null }).department_name || `Department #${user.department_id}`
    : null;

  const managerDisplay = manager
    ? `${manager.full_name} (${manager.email})`
    : user.manager_id
    ? `Manager #${user.manager_id}`
    : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ── Identity: the account as recorded ─────────────────────────── */}
      <section aria-labelledby="profile-name" className="frame px-6 py-7 sm:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
          <span
            aria-hidden="true"
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-note-ink/40 bg-note-tint font-display text-[22px] text-note-ink"
          >
            {getInitials(user.full_name)}
          </span>

          <div className="min-w-0 flex-1">
            <h2 id="profile-name" className="font-display text-[30px] leading-tight text-ink break-words">
              {user.full_name}
            </h2>
            <p className="mt-0.5 break-all text-ink-2">{user.email}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <RoleBadge role={user.role as "employee" | "manager" | "admin"} />
              <StatusBadge isActive={user.is_active} />
            </div>
            {ROLE_SCOPE[user.role] && (
              <p className="mt-4 max-w-[64ch] text-[14px] text-ink-2">{ROLE_SCOPE[user.role]}</p>
            )}

            <dl className="mt-6 grid grid-cols-1 gap-x-8 gap-y-4 border-t border-line pt-5 text-[14px] sm:grid-cols-2">
              <div className="min-w-0">
                <dt className="caps text-ink-3">Department</dt>
                <dd className={`mt-0.5 break-words ${departmentDisplay ? "text-ink" : "text-ink-3"}`}>
                  {departmentDisplay ?? "Not assigned"}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="caps text-ink-3">Reporting manager</dt>
                <dd className={`mt-0.5 break-words ${managerDisplay ? "text-ink" : "text-ink-3"}`}>
                  {managerDisplay ?? "None"}
                </dd>
              </div>
              <div>
                <dt className="caps text-ink-3">Member since</dt>
                <dd className="mt-0.5 text-ink tabular">{formatDate(user.joined_at)}</dd>
              </div>
              <div>
                <dt className="caps text-ink-3">Account ID</dt>
                <dd className="mt-0.5 font-mono text-[13px] text-ink tabular">{user.id}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* ── Edit profile ──────────────────────────────────────────────── */}
      <ProfileForm user={user} />
    </div>
  );
}
