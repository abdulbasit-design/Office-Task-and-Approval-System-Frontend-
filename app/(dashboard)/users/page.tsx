"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useGetUsersQuery } from "@/lib/api/userApi";
import { useGetDepartmentsQuery } from "@/lib/api/departmentApi";
import { useGetMeQuery } from "@/lib/api/authApi";
import UserTable from "@/components/users/UserTable";
import type { UserResponse } from "@/lib/api/userApi";

type RoleFilter = "ALL" | UserResponse["role"];
type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE";

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
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
              d="M12 15v2m0 0v2m0-2h2m-2 0H10m11-3.5a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Administrator Access Required</h2>
        <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
          The user directory and account management features are restricted to system administrators.
          Your current account role is <span className="font-semibold text-slate-800 capitalize">{currentUser?.role || "standard user"}</span>.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">User Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isUsersLoading
              ? "Loading users..."
              : `${totalCount} registered account${totalCount !== 1 ? "s" : ""}`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors text-xs font-semibold flex items-center gap-1.5"
            title="Refresh user list"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <Link
            href="/signup"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Register User
          </Link>
        </div>
      </div>

      {/* ── Stats Overview ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
          <p className="text-xs font-semibold text-slate-500">Total Users</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{totalCount}</p>
          <span className="text-[11px] text-emerald-600 font-medium">
            {activeCount} active
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
          <p className="text-xs font-semibold text-slate-500">Administrators</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">{adminCount}</p>
          <span className="text-[11px] text-slate-400">Full system access</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
          <p className="text-xs font-semibold text-slate-500">Managers</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{managerCount}</p>
          <span className="text-[11px] text-slate-400">Task approvals</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
          <p className="text-xs font-semibold text-slate-500">Employees</p>
          <p className="text-2xl font-bold text-slate-700 mt-1">{employeeCount}</p>
          <span className="text-[11px] text-slate-400">Task execution</span>
        </div>
      </div>

      {/* ── Search & Filter Bar ──────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_1px_6px_rgba(0,0,0,0.02)] p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Roles</option>
              <option value="admin">Administrators</option>
              <option value="manager">Managers</option>
              <option value="employee">Employees</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Accounts</option>
              <option value="INACTIVE">Inactive Accounts</option>
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Departments</option>
              <option value="NONE">Unassigned</option>
              {departments.map((dept) => (
                <option key={dept.id} value={String(dept.id)}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Generic Error Notice ─────────────────────────────────────────── */}
      {isUsersError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-3 text-rose-800 text-xs">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>Failed to load users from the server.</span>
          </div>
          <button
            onClick={() => refetch()}
            className="font-bold underline hover:text-rose-900"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Users Table ──────────────────────────────────────────────────── */}
      <UserTable
        users={filteredUsers}
        departments={departments}
        isLoading={isUsersLoading}
        currentUserId={currentUser?.id}
      />
    </div>
  );
}
