"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useGetDepartmentsQuery } from "@/lib/api/departmentApi";
import { useGetUsersQuery } from "@/lib/api/userApi";
import { useGetMeQuery } from "@/lib/api/authApi";
import DepartmentTable from "@/components/departments/DepartmentTable";
import DepartmentForm from "@/components/departments/DepartmentForm";
import type { DepartmentResponse } from "@/lib/api/departmentApi";

export default function DepartmentsPage() {
  const { data: currentUser } = useGetMeQuery();
  const {
    data: departments = [],
    isLoading: isDeptsLoading,
    isError: isDeptsError,
    error: deptsError,
    refetch,
  } = useGetDepartmentsQuery();

  const { data: users = [] } = useGetUsersQuery(undefined, {
    skip: currentUser?.role !== "admin" && currentUser !== undefined,
  });

  // Calculate user counts per department
  const userCounts = React.useMemo(() => {
    const counts: Record<number, number> = {};
    users.forEach((u) => {
      if (u.department_id !== null) {
        counts[u.department_id] = (counts[u.department_id] || 0) + 1;
      }
    });
    return counts;
  }, [users]);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<DepartmentResponse | null>(null);

  // Search filter
  const [search, setSearch] = useState("");

  // Permission guard (all department endpoints are strictly admin-only)
  const isForbidden =
    (deptsError &&
      typeof deptsError === "object" &&
      "status" in deptsError &&
      deptsError.status === 403) ||
    (currentUser && currentUser.role !== "admin");

  // Summary counts
  const totalDepts = departments.length;
  const totalAssignedUsers = Object.values(userCounts).reduce((acc, count) => acc + count, 0);

  // Filtered departments
  const filteredDepartments = departments.filter((d) => {
    if (!search.trim()) return true;
    const query = search.toLowerCase();
    return (
      d.name.toLowerCase().includes(query) ||
      (d.description && d.description.toLowerCase().includes(query))
    );
  });

  const handleOpenCreate = () => {
    setSelectedDept(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dept: DepartmentResponse) => {
    setSelectedDept(dept);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedDept(null);
  };

  // 403 Forbidden state
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
          Department configuration and team management are restricted to system administrators.
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
          <h1 className="text-xl font-bold text-slate-900">Departments</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isDeptsLoading
              ? "Loading departments..."
              : `${totalDepts} department${totalDepts !== 1 ? "s" : ""} configured`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors text-xs font-semibold flex items-center gap-1.5"
            title="Refresh departments list"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={handleOpenCreate}
            id="create-department-btn"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Department
          </button>
        </div>
      </div>

      {/* ── Stats Overview ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
          <p className="text-xs font-semibold text-slate-500">Total Departments</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{totalDepts}</p>
          <span className="text-[11px] text-slate-400">Organizational units</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
          <p className="text-xs font-semibold text-slate-500">Assigned Staff</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{totalAssignedUsers}</p>
          <span className="text-[11px] text-slate-400">Users allocated to departments</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
          <p className="text-xs font-semibold text-slate-500">Unassigned Staff</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            {Math.max(0, users.length - totalAssignedUsers)}
          </p>
          <span className="text-[11px] text-slate-400">Users awaiting placement</span>
        </div>
      </div>

      {/* ── Search Bar ───────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_1px_6px_rgba(0,0,0,0.02)] p-4">
        <div className="relative max-w-md">
          <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search departments by name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* ── Error Banner ─────────────────────────────────────────────────── */}
      {isDeptsError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-3 text-rose-800 text-xs">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>Failed to load departments from the server.</span>
          </div>
          <button
            onClick={() => refetch()}
            className="font-bold underline hover:text-rose-900"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Departments Table ────────────────────────────────────────────── */}
      <DepartmentTable
        departments={filteredDepartments}
        userCounts={userCounts}
        isLoading={isDeptsLoading}
        onEdit={handleOpenEdit}
        onCreateClick={handleOpenCreate}
      />

      {/* ── Create / Edit Modal ──────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedDept ? "Edit Department" : "Create New Department"}
                </h3>
              </div>
              <button
                onClick={handleModalClose}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <DepartmentForm
              initialData={selectedDept}
              onSuccess={() => {
                handleModalClose();
              }}
              onCancel={handleModalClose}
            />
          </div>
        </div>
      )}
    </div>
  );
}
