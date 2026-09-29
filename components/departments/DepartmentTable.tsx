"use client";

import React, { useState } from "react";
import type { DepartmentResponse } from "@/lib/api/departmentApi";
import { useDeleteDepartmentMutation } from "@/lib/api/departmentApi";

interface DepartmentTableProps {
  departments: DepartmentResponse[];
  userCounts?: Record<number, number>;
  isLoading?: boolean;
  onEdit: (dept: DepartmentResponse) => void;
  onCreateClick?: () => void;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

// ── Skeletons ─────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-slate-100 animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <td key={i} className="px-5 py-4">
          <div className="h-4 bg-slate-200 rounded w-3/4" />
        </td>
      ))}
    </tr>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────
function EmptyState({ onCreateClick }: { onCreateClick?: () => void }) {
  return (
    <tr>
      <td colSpan={5}>
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-700">No departments found</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Departments help organize tasks, teams, and approval workflows.
            </p>
            {onCreateClick && (
              <button
                onClick={onCreateClick}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create First Department
              </button>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}

// ── DepartmentTable ───────────────────────────────────────────────────────
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

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm" role="table" aria-label="Departments list">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th scope="col" className="px-5 py-3.5">Department</th>
                <th scope="col" className="px-4 py-3.5 hidden md:table-cell">Description</th>
                <th scope="col" className="px-4 py-3.5 text-center">Members</th>
                <th scope="col" className="px-4 py-3.5 hidden sm:table-cell">Created</th>
                <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              ) : departments.length === 0 ? (
                <EmptyState onCreateClick={onCreateClick} />
              ) : (
                departments.map((dept) => {
                  const memberCount = userCounts[dept.id] || 0;

                  return (
                    <tr
                      key={dept.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Name & ID */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 border border-blue-100 shadow-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 block group-hover:text-blue-600 transition-colors">
                              {dept.name}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              ID #{dept.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Description */}
                      <td className="px-4 py-4 hidden md:table-cell text-slate-600 max-w-xs truncate">
                        {dept.description ? (
                          <span>{dept.description}</span>
                        ) : (
                          <span className="text-slate-400 italic">No description</span>
                        )}
                      </td>

                      {/* Members */}
                      <td className="px-4 py-4 text-center whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                          {memberCount} {memberCount === 1 ? "user" : "users"}
                        </span>
                      </td>

                      {/* Created Date */}
                      <td className="px-4 py-4 whitespace-nowrap hidden sm:table-cell text-xs text-slate-500">
                        {formatDate(dept.created_at)}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onEdit(dept)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => {
                              setDeleteError(null);
                              setDeptToDelete(dept);
                            }}
                            title="Delete department"
                            aria-label={`Delete ${dept.name}`}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
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

      {/* Delete Confirmation Modal */}
      {deptToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Department</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-sm text-slate-600">
              Are you sure you want to delete <span className="font-semibold text-slate-900">{deptToDelete.name}</span>?
            </p>

            {deleteError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                <p className="font-semibold">Cannot Delete Department</p>
                <p className="mt-0.5">{deleteError}</p>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeptToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white shadow-sm transition-colors disabled:opacity-60"
              >
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
