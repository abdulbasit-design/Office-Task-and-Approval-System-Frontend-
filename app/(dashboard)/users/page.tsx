"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowClockwise, LockKey, MagnifyingGlass, Plus, WarningCircle } from "@phosphor-icons/react";
import { useGetUsersQuery } from "@/lib/api/userApi";
import { useGetDepartmentsQuery } from "@/lib/api/departmentApi";
import { useGetMeQuery } from "@/lib/api/authApi";
import UserTable from "@/components/users/UserTable";
import type { UserResponse } from "@/lib/api/userApi";

type RoleFilter = "ALL" | UserResponse["role"];
type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE";

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

export default function UsersPage() {
  const { data: currentUser } = useGetMeQuery();
  const {
    data: users = [],
    isLoading: isUsersLoading,
    isError: isUsersError,
    error: usersError,
    refetch,
  } = useGetUsersQuery();

  const { data: departments = [] } = useGetDepartmentsQuery(undefined, {
    // Only fetch if admin
    skip: currentUser?.role !== "admin" && currentUser !== undefined,
  });

  // Filter state
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [deptFilter, setDeptFilter] = useState<string>("ALL");

  // Check 403 Forbidden
  const isForbidden =
    (usersError &&
      typeof usersError === "object" &&
      "status" in usersError &&
      usersError.status === 403) ||
    (currentUser && currentUser.role !== "admin");

  // Summary counts
  const totalCount = users.length;
  const activeCount = users.filter((u) => u.is_active).length;
  const adminCount = users.filter((u) => u.role === "admin").length;
  const managerCount = users.filter((u) => u.role === "manager").length;
  const employeeCount = users.filter((u) => u.role === "employee").length;

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchSearch =
      !search.trim() ||
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());

    const matchRole = roleFilter === "ALL" || u.role === roleFilter;

    const matchStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && u.is_active) ||
      (statusFilter === "INACTIVE" && !u.is_active);

    const matchDept =
      deptFilter === "ALL" ||
      (deptFilter === "NONE" && u.department_id === null) ||
      (u.department_id !== null && String(u.department_id) === deptFilter);

    return matchSearch && matchRole && matchStatus && matchDept;
  });

  // Handle 403 state
  if (isForbidden) {
    return (
      <div className="panel mx-auto mt-6 max-w-xl px-6 py-10 text-center">
        <LockKey size={32} className="mx-auto text-ink-3" aria-hidden="true" />
        <h2 className="mt-4 font-display text-[26px] leading-tight text-ink">Administrator access required</h2>
        <p className="mx-auto mt-2 max-w-md text-[14px] text-ink-2">
          The user directory and account management are restricted to administrators. Your current role is{" "}
          <span className="font-semibold capitalize text-ink">{currentUser?.role || "standard user"}</span>.
        </p>
        <Link href="/dashboard" className="btn btn-secondary mt-6">
          Return to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary and primary action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[15px] text-ink-2">
          {isUsersLoading
            ? "Loading users..."
            : `${plural(totalCount, "account")}, ${activeCount} active: ${plural(adminCount, "admin")}, ${plural(managerCount, "manager")}, ${plural(employeeCount, "employee")}.`}
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="btn btn-ghost w-9 min-h-9 px-0"
            title="Refresh user list"
            aria-label="Refresh user list"
          >
            <ArrowClockwise size={18} />
          </button>
          <Link href="/signup" target="_blank" className="btn btn-primary">
            <Plus size={16} weight="bold" /> Register user
          </Link>
        </div>
      </div>

      {/* Search and filters */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
        <div className="relative">
          <MagnifyingGlass
            size={16}
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3"
          />
          <input
            type="text"
            aria-label="Search users"
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9"
          />
        </div>

        <select
          aria-label="Filter by role"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
          className="input"
        >
          <option value="ALL">All roles</option>
          <option value="admin">Administrators</option>
          <option value="manager">Managers</option>
          <option value="employee">Employees</option>
        </select>

        <select
          aria-label="Filter by status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="input"
        >
          <option value="ALL">All statuses</option>
          <option value="ACTIVE">Active accounts</option>
          <option value="INACTIVE">Inactive accounts</option>
        </select>

        <select
          aria-label="Filter by department"
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="input"
        >
          <option value="ALL">All departments</option>
          <option value="NONE">Unassigned</option>
          {departments.map((dept) => (
            <option key={dept.id} value={String(dept.id)}>
              {dept.name}
            </option>
          ))}
        </select>
      </div>

      {isUsersError && (
        <div role="alert" className="flex items-start gap-3 rounded-sm border border-serial/50 bg-serial-tint p-4 text-[14px]">
          <WarningCircle size={20} className="mt-0.5 shrink-0 text-serial" />
          <div className="flex-1">
            <p className="font-semibold text-ink">Users could not be loaded</p>
            <p className="mt-0.5 text-ink-2">Check that the API is running, then retry.</p>
          </div>
          <button onClick={() => refetch()} className="btn btn-secondary">
            Retry
          </button>
        </div>
      )}

      <UserTable
        users={filteredUsers}
        departments={departments}
        isLoading={isUsersLoading}
        currentUserId={currentUser?.id}
      />
    </div>
  );
}
