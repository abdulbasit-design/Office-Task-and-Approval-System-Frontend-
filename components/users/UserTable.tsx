"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { UserResponse } from "@/lib/api/userApi";
import { useDeleteUserMutation } from "@/lib/api/userApi";
import type { DepartmentResponse } from "@/lib/api/departmentApi";

interface UserTableProps {
  users: UserResponse[];
  departments?: DepartmentResponse[];
  isLoading?: boolean;
  currentUserId?: number | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────
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

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "U";
}

export function RoleBadge({ role }: { role: UserResponse["role"] }) {
  switch (role) {
    case "admin":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
          Admin
        </span>
      );
    case "manager":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          Manager
        </span>
      );
    case "employee":
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          Employee
        </span>
      );
  }
}

export function StatusBadge({ isActive }: { isActive: boolean }) {
  return isActive ? (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
      Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
      Inactive
    </span>
  );
}

// ── Skeletons ─────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-slate-100 animate-pulse">
      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
        <td key={i} className="px-5 py-4">
          <div className="h-4 bg-slate-200 rounded w-3/4" />
        </td>
      ))}
    </tr>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <tr>
      <td colSpan={7}>
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
          <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-600">No users found</p>
            <p className="text-xs text-slate-400 mt-1">Try changing filters or searching by name/email.</p>
          </div>
        </div>
      </td>
    </tr>
  );
}

// ── UserTable Component ───────────────────────────────────────────────────
export default function UserTable({
  users,
  departments = [],
  isLoading = false,
  currentUserId,
}: UserTableProps) {
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [userToDelete, setUserToDelete] = useState<UserResponse | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Map for department id to name
  const deptMap = React.useMemo(() => {
    const map = new Map<number, string>();
    departments.forEach((d) => map.set(d.id, d.name));
    return map;
  }, [departments]);

  // Map for manager id to name
  const userMap = React.useMemo(() => {
    const map = new Map<number, string>();
    users.forEach((u) => map.set(u.id, u.full_name));
    return map;
  }, [users]);

  const handleDelete = async () => {
    if (!userToDelete) return;
    setDeleteError(null);
    try {
      await deleteUser(userToDelete.id).unwrap();
      setUserToDelete(null);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "data" in err) {
        const errorData = (err as { data: { detail?: string } }).data;
        setDeleteError(errorData?.detail || "Failed to delete user.");
      } else {
        setDeleteError("An unexpected error occurred while deleting user.");
      }
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm" role="table" aria-label="Users list">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th scope="col" className="px-5 py-3.5">User</th>
                <th scope="col" className="px-4 py-3.5">Role</th>
                <th scope="col" className="px-4 py-3.5 hidden md:table-cell">Department</th>
                <th scope="col" className="px-4 py-3.5 hidden lg:table-cell">Manager</th>
                <th scope="col" className="px-4 py-3.5">Status</th>
                <th scope="col" className="px-4 py-3.5 hidden sm:table-cell">Joined</th>
                <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              ) : users.length === 0 ? (
                <EmptyState />
              ) : (
                users.map((user) => {
                  const isSelf = currentUserId === user.id;
                  const deptName = user.department_id ? deptMap.get(user.department_id) : null;
                  const managerName = user.manager_id ? userMap.get(user.manager_id) : null;

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* User Info */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                            {getInitials(user.full_name)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <Link
                                href={`/users/${user.id}`}
                                className="font-semibold text-slate-900 hover:text-blue-600 transition-colors truncate block"
                              >
                                {user.full_name}
                              </Link>
                              {isSelf && (
                                <span className="text-[10px] bg-blue-50 text-blue-600 font-semibold px-1.5 py-0.5 rounded border border-blue-200">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-500 truncate block">
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <RoleBadge role={user.role} />
                      </td>

                      {/* Department */}
                      <td className="px-4 py-4 whitespace-nowrap hidden md:table-cell text-slate-600">
                        {deptName ? (
                          <span className="inline-flex items-center gap-1 text-slate-700 font-medium">
                            {deptName}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>

                      {/* Manager */}
                      <td className="px-4 py-4 whitespace-nowrap hidden lg:table-cell text-slate-600">
                        {managerName ? (
                          <span className="text-slate-700 font-medium">
                            {managerName}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <StatusBadge isActive={user.is_active} />
                      </td>

                      {/* Joined Date */}
                      <td className="px-4 py-4 whitespace-nowrap hidden sm:table-cell text-xs text-slate-500">
                        {formatDate(user.joined_at)}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/users/${user.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                          >
                            Edit
                          </Link>

                          {!isSelf && (
                            <button
                              onClick={() => {
                                setDeleteError(null);
                                setUserToDelete(user);
                              }}
                              title="Delete user"
                              aria-label={`Delete ${user.full_name}`}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
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
      {userToDelete && (
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
                <h3 className="text-base font-bold text-slate-900">Delete User Account</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-sm text-slate-600">
              Are you sure you want to delete <span className="font-semibold text-slate-900">{userToDelete.full_name}</span> ({userToDelete.email})?
            </p>

            {deleteError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                <p className="font-semibold">Cannot Delete User</p>
                <p className="mt-0.5">{deleteError}</p>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
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
