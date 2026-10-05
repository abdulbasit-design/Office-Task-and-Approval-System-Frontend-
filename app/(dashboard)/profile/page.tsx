"use client";

import React from "react";
import { useGetMeQuery } from "@/lib/api/authApi";
import { useGetDepartmentQuery } from "@/lib/api/departmentApi";
import { useGetUserQuery } from "@/lib/api/userApi";
import ProfileForm from "@/components/profile/ProfileForm";
import { RoleBadge, StatusBadge } from "@/components/users/UserTable";

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

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

  if (isUserLoading) {
    return (
      <div className="max-w-4xl mx-auto py-10 space-y-6 animate-pulse">
        <div className="h-6 w-32 bg-slate-200 rounded-lg" />
        <div className="h-36 bg-slate-200 rounded-2xl" />
        <div className="h-64 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  if (isUserError || !user) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Failed to Load Profile</h2>
        <p className="text-sm text-slate-600 mb-6">
          Unable to fetch your profile information from the server.
        </p>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm"
        >
          Try Again
        </button>
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
      {/* ── Page Header & Profile Card ───────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {/* Initials Avatar */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-700 text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0">
              {getInitials(user.full_name)}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-slate-900">{user.full_name}</h1>
                <RoleBadge role={user.role as "employee" | "manager" | "admin"} />
                <StatusBadge isActive={user.is_active} />
              </div>

              <p className="text-sm text-slate-500 mt-1">{user.email}</p>

              <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                <span>Account ID #{user.id}</span>
                <span>•</span>
                <span>Member since {formatDate(user.joined_at)}</span>
              </div>
            </div>
          </div>

          {/* Quick Context Summary */}
          <div className="sm:border-l sm:border-slate-100 sm:pl-6 text-left sm:text-right shrink-0">
            <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
              Role Authority
            </span>
            <span className="text-xs font-bold text-slate-800 capitalize block mt-0.5">
              {user.role}
            </span>
            <span className="text-[11px] text-slate-500 block mt-1">
              {user.role === "admin"
                ? "Full System Admin"
                : user.role === "manager"
                ? "Task Approver"
                : "Task Executor"}
            </span>
          </div>
        </div>
      </div>

      {/* ── Role Scope Overview ──────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_1px_4px_rgba(0,0,0,0.02)] p-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Permissions & Account Capabilities
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          {user.role === "admin" && (
            <>
              As an <strong className="text-slate-800">Administrator</strong>, you have complete authority to manage user accounts, assign roles, configure organizational departments, and inspect all system entities.
            </>
          )}
          {user.role === "manager" && (
            <>
              As a <strong className="text-slate-800">Manager</strong>, you can create new tasks, assign them to team members, review submitted deliverables, and approve or reject submissions with feedback notes.
            </>
          )}
          {user.role === "employee" && (
            <>
              As an <strong className="text-slate-800">Employee</strong>, you can view tasks assigned to you, submit your completed work for manager approval, and receive real-time status notifications.
            </>
          )}
        </p>
      </div>

      {/* ── Edit Profile Form ────────────────────────────────────────────── */}
      <ProfileForm
        user={user}
        departmentName={departmentDisplay}
        managerName={managerDisplay}
      />
    </div>
  );
}
