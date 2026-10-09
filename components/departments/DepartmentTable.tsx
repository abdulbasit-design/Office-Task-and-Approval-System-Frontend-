"use client";

import React, { useState } from "react";
import { PencilSimple, Plus, Trash, WarningCircle } from "@phosphor-icons/react";
import type { DepartmentResponse } from "@/lib/api/departmentApi";
import { useDeleteDepartmentMutation } from "@/lib/api/departmentApi";
import Rosette from "@/components/ui/Rosette";
import { formatDate } from "@/lib/format";

interface DepartmentTableProps {
  departments: DepartmentResponse[];
  userCounts?: Record<number, number>;
  isLoading?: boolean;
  onEdit: (dept: DepartmentResponse) => void;
  onCreateClick?: () => void;
}

function SkeletonRow() {
  const bar = "h-3.5 rounded-sm bg-paper-sunk";
  return (
    <tr className="animate-pulse">
      <td className="px-4 py-4">
        <div className={`${bar} w-32`} />
        <div className={`${bar} mt-2 w-12`} />
      </td>
      <td className="hidden px-4 py-4 md:table-cell"><div className={`${bar} w-64`} /></td>
      <td className="px-4 py-4"><div className={`${bar} ml-auto w-14`} /></td>
      <td className="hidden px-4 py-4 sm:table-cell"><div className={`${bar} w-20`} /></td>
      <td className="px-4 py-4"><div className="ml-auto h-9 w-20 rounded-sm bg-paper-sunk" /></td>
    </tr>
  );
}

export default function DepartmentTable({
  departments,
  userCounts = {},
  isLoading = false,
  onEdit,
  onCreateClick,
}: DepartmentTableProps) {
  const [deleteDepartment, { isLoading: isDeleting }] = useDeleteDepartmentMutation();
  const [deptToDelete, setDeptToDelete] = useState<DepartmentResponse | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deptToDelete) return;
    setDeleteError(null);
    try {
      await deleteDepartment(deptToDelete.id).unwrap();
      setDeptToDelete(null);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "data" in err) {
        const errorData = (err as { data: { detail?: string } }).data;
        setDeleteError(errorData?.detail || "Failed to delete department.");
      } else {
        setDeleteError("An unexpected error occurred while deleting department.");
      }
    }
  };

  const th = "caps px-4 py-3 text-ink-3";

  return (
    <>
      <div className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[14px]" role="table" aria-label="Departments list">
            <thead className="border-b border-line bg-paper-sunk">
              <tr>
                <th scope="col" className={th}>Department</th>
                <th scope="col" className={`${th} hidden md:table-cell`}>Description</th>
                <th scope="col" className={`${th} text-right`}>Members</th>
                <th scope="col" className={`${th} hidden sm:table-cell`}>Created</th>
                <th scope="col" className={`${th} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {isLoading ? (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              ) : departments.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="flex items-center justify-center gap-5 px-5 py-12">
                      <Rosette seed={512} variant="mark" className="h-14 w-14 shrink-0 text-line-strong" />
                      <div>
                        <p className="font-semibold text-ink">No departments found.</p>
                        <p className="mt-1 max-w-[46ch] text-[14px] text-ink-3">
                          Departments help organize tasks, teams and approval workflows.
                        </p>
                        {onCreateClick && (
                          <button onClick={onCreateClick} className="btn btn-primary mt-4">
                            <Plus size={16} weight="bold" /> Create first department
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                departments.map((dept) => {
                  const memberCount = userCounts[dept.id] || 0;

                  return (
                    <tr key={dept.id} className="transition-colors hover:bg-paper-sunk">
                      <td className="px-4 py-3">
                        <span className="block font-semibold text-ink">{dept.name}</span>
                        <span className="font-mono text-[12px] text-ink-3">ID {dept.id}</span>
                      </td>

                      <td className="hidden max-w-sm px-4 py-3 md:table-cell">
                        {dept.description ? (
                          <span className="line-clamp-2 text-ink-2">{dept.description}</span>
                        ) : (
                          <span className="text-ink-3">No description</span>
                        )}
                      </td>

                      <td className="tabular whitespace-nowrap px-4 py-3 text-right text-ink-2">
                        {memberCount} {memberCount === 1 ? "user" : "users"}
                      </td>

                      <td className="tabular hidden whitespace-nowrap px-4 py-3 text-[13px] text-ink-2 sm:table-cell">
                        {formatDate(dept.created_at)}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onEdit(dept)}
                            title="Edit department"
                            aria-label={`Edit ${dept.name}`}
                            className="btn btn-ghost w-9 min-h-9 px-0"
                          >
                            <PencilSimple size={17} />
                          </button>
                          <button
                            onClick={() => {
                              setDeleteError(null);
                              setDeptToDelete(dept);
                            }}
                            title="Delete department"
                            aria-label={`Delete ${dept.name}`}
                            className="btn btn-ghost w-9 min-h-9 px-0 hover:bg-serial-tint hover:text-serial"
                          >
                            <Trash size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete confirmation */}
      {deptToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-department-title"
            className="panel w-full max-w-md space-y-4 p-6 shadow-[0_16px_40px_-16px_rgb(var(--shadow-color)/0.4)]"
          >
            <div>
              <h3 id="delete-department-title" className="font-display text-[22px] leading-tight text-ink">Delete department</h3>
              <p className="mt-1 text-[13px] text-ink-3">This cannot be undone.</p>
            </div>

            <p className="text-ink-2">
              Delete <span className="font-semibold text-ink">{deptToDelete.name}</span>?
            </p>

            {deleteError && (
              <div role="alert" className="flex items-start gap-3 rounded-sm border border-serial/50 bg-serial-tint p-3 text-[14px]">
                <WarningCircle size={20} className="mt-0.5 shrink-0 text-serial" />
                <div>
                  <p className="font-semibold text-ink">The department was not deleted</p>
                  <p className="mt-0.5 text-ink-2">{deleteError}</p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button type="button" onClick={() => setDeptToDelete(null)} disabled={isDeleting} className="btn btn-ghost">
                Cancel
              </button>
              <button type="button" onClick={handleDelete} disabled={isDeleting} className="btn btn-danger">
                {isDeleting ? "Deleting..." : "Delete department"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
