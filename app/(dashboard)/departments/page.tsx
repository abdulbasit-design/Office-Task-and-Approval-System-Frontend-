"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowClockwise, LockKey, MagnifyingGlass, Plus, WarningCircle, X } from "@phosphor-icons/react";
import { useGetDepartmentsQuery } from "@/lib/api/departmentApi";
import { useGetUsersQuery } from "@/lib/api/userApi";
import { useGetMeQuery } from "@/lib/api/authApi";
import DepartmentTable from "@/components/departments/DepartmentTable";
import DepartmentForm from "@/components/departments/DepartmentForm";
import type { DepartmentResponse } from "@/lib/api/departmentApi";
import CloseOnEscape from "@/components/ui/CloseOnEscape";

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
  const unassignedUsers = Math.max(0, users.length - totalAssignedUsers);

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
      <div className="panel mx-auto mt-6 max-w-xl px-6 py-10 text-center">
        <LockKey size={32} className="mx-auto text-ink-3" aria-hidden="true" />
        <h2 className="mt-4 font-display text-[26px] leading-tight text-ink">Administrator access required</h2>
        <p className="mx-auto mt-2 max-w-md text-[14px] text-ink-2">
          Department configuration is restricted to administrators. Your current role is{" "}
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
          {isDeptsLoading
            ? "Loading departments..."
            : `${totalDepts} department${totalDepts !== 1 ? "s" : ""}, ${totalAssignedUsers} ${totalAssignedUsers === 1 ? "person" : "people"} assigned, ${unassignedUsers} unassigned.`}
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="btn btn-ghost w-9 min-h-9 px-0"
            title="Refresh departments list"
            aria-label="Refresh departments list"
          >
            <ArrowClockwise size={18} />
          </button>
          <button onClick={handleOpenCreate} id="create-department-btn" className="btn btn-primary">
            <Plus size={16} weight="bold" /> New department
          </button>
        </div>
      </div>

      <div className="relative max-w-md">
        <MagnifyingGlass
          size={16}
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3"
        />
        <input
          type="text"
          aria-label="Search departments"
          placeholder="Search by name or description"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-9"
        />
      </div>

      {isDeptsError && (
        <div role="alert" className="flex items-start gap-3 rounded-sm border border-serial/50 bg-serial-tint p-4 text-[14px]">
          <WarningCircle size={20} className="mt-0.5 shrink-0 text-serial" />
          <div className="flex-1">
            <p className="font-semibold text-ink">Departments could not be loaded</p>
            <p className="mt-0.5 text-ink-2">Check that the API is running, then retry.</p>
          </div>
          <button onClick={() => refetch()} className="btn btn-secondary">
            Retry
          </button>
        </div>
      )}

      <DepartmentTable
        departments={filteredDepartments}
        userCounts={userCounts}
        isLoading={isDeptsLoading}
        onEdit={handleOpenEdit}
        onCreateClick={handleOpenCreate}
      />

      {/* Create / edit dialog */}
      {isModalOpen && (
        <div className="dialog-backdrop fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="department-dialog-title"
            className="dialog-panel panel w-full max-w-lg p-6 shadow-[0_16px_40px_-16px_rgb(var(--shadow-color)/0.4)]"
          >
            <CloseOnEscape onClose={handleModalClose} />
            <div className="mb-5 flex items-center justify-between gap-4 border-b border-line pb-3">
              <h2 id="department-dialog-title" className="font-display text-[22px] leading-tight text-ink">
                {selectedDept ? "Edit department" : "New department"}
              </h2>
              <button onClick={handleModalClose} className="btn btn-ghost -mr-2 w-9 min-h-9 px-0" aria-label="Close modal">
                <X size={18} />
              </button>
            </div>

            <DepartmentForm
              key={selectedDept?.id ?? "new"}
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
