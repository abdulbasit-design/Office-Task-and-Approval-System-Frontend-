"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle, MinusCircle, PencilSimple, Trash, WarningCircle } from "@phosphor-icons/react";
import type { UserResponse } from "@/lib/api/userApi";
import { useDeleteUserMutation } from "@/lib/api/userApi";
import type { DepartmentResponse } from "@/lib/api/departmentApi";
import Rosette from "@/components/ui/Rosette";
import { formatDate } from "@/lib/format";
import CloseOnEscape from "@/components/ui/CloseOnEscape";

interface UserTableProps {
  users: UserResponse[];
  departments?: DepartmentResponse[];
  isLoading?: boolean;
  currentUserId?: number | null;
}

// ── Shared pieces (also used by the user detail and password reset pages) ──
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

/** Initials avatar; pass size and type classes to scale it. */
export function Avatar({ name, className = "h-9 w-9 text-[13px]" }: { name: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full border border-note-ink/40 bg-note-tint font-display text-note-ink ${className}`}
    >
      {getInitials(name)}
    </span>
  );
}

// Roles read as square overprints, like task status badges.
const ROLE_CONFIG: Record<UserResponse["role"], { label: string; className: string }> = {
  admin: { label: "Admin", className: "text-note-ink border-note-ink/60 bg-note-tint" },
  manager: { label: "Manager", className: "text-seal-ink border-seal bg-seal-tint" },
  employee: { label: "Employee", className: "text-ink-2 border-line-strong bg-paper-sunk" },
};

export function RoleBadge({ role }: { role: UserResponse["role"] }) {
  const cfg = ROLE_CONFIG[role] ?? ROLE_CONFIG.employee;
  return <span className={`caps inline-flex items-center h-6 px-2 rounded-sm border ${cfg.className}`}>{cfg.label}</span>;
}

export function StatusBadge({ isActive }: { isActive: boolean }) {
  return isActive ? (
    <span className="caps inline-flex items-center gap-1.5 text-ok">
      <CheckCircle size={14} aria-hidden="true" />
      Active
    </span>
  ) : (
    <span className="caps inline-flex items-center gap-1.5 text-ink-3">
      <MinusCircle size={14} aria-hidden="true" />
      Inactive
    </span>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────
function SkeletonRow() {
  const bar = "h-3.5 rounded-sm bg-paper-sunk";
  return (
    <tr className="animate-pulse">
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 shrink-0 rounded-full bg-paper-sunk" />
          <div className="w-40 space-y-2">
            <div className={`${bar} w-3/4`} />
            <div className={`${bar} w-full`} />
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5"><div className="h-6 w-20 rounded-sm bg-paper-sunk" /></td>
      <td className="hidden px-4 py-3.5 md:table-cell"><div className={`${bar} w-24`} /></td>
      <td className="hidden px-4 py-3.5 lg:table-cell"><div className={`${bar} w-24`} /></td>
      <td className="px-4 py-3.5"><div className={`${bar} w-16`} /></td>
      <td className="hidden px-4 py-3.5 sm:table-cell"><div className={`${bar} w-20`} /></td>
      <td className="px-4 py-3.5"><div className="ml-auto h-9 w-20 rounded-sm bg-paper-sunk" /></td>
    </tr>
  );
}

// ── UserTable ─────────────────────────────────────────────────────────────
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

  const th = "caps px-4 py-3 text-ink-3";

  return (
    <>
      <div className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[14px]" role="table" aria-label="Users list">
            <thead className="border-b border-line bg-paper-sunk">
              <tr>
                <th scope="col" className={th}>User</th>
                <th scope="col" className={th}>Role</th>
                <th scope="col" className={`${th} hidden md:table-cell`}>Department</th>
                <th scope="col" className={`${th} hidden lg:table-cell`}>Manager</th>
                <th scope="col" className={th}>Status</th>
                <th scope="col" className={`${th} hidden sm:table-cell`}>Joined</th>
                <th scope="col" className={`${th} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {isLoading ? (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="flex items-center justify-center gap-5 px-5 py-12">
                      <Rosette seed={407} variant="mark" className="h-14 w-14 shrink-0 text-line-strong" />
                      <div>
                        <p className="font-semibold text-ink">No users found.</p>
                        <p className="mt-1 max-w-[46ch] text-[14px] text-ink-3">
                          Try another name or email, or clear the filters.
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const isSelf = currentUserId === user.id;
                  const deptName = user.department_id ? deptMap.get(user.department_id) : null;
                  const managerName = user.manager_id ? userMap.get(user.manager_id) : null;

                  return (
                    <tr key={user.id} className="transition-colors hover:bg-paper-sunk">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={user.full_name} />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/users/${user.id}`}
                                className="block truncate font-semibold text-ink transition-colors hover:text-note-ink"
                              >
                                {user.full_name}
                              </Link>
                              {isSelf && <span className="caps text-[10px] text-note-ink">You</span>}
                            </div>
                            <span className="block truncate text-[13px] text-ink-3">{user.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-4 py-3">
                        <RoleBadge role={user.role} />
                      </td>

                      <td className="hidden whitespace-nowrap px-4 py-3 md:table-cell">
                        {deptName ? <span className="text-ink-2">{deptName}</span> : <span className="text-ink-3">Unassigned</span>}
                      </td>

                      <td className="hidden whitespace-nowrap px-4 py-3 lg:table-cell">
                        {managerName ? <span className="text-ink-2">{managerName}</span> : <span className="text-ink-3">None</span>}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3">
                        <StatusBadge isActive={user.is_active} />
                      </td>

                      <td className="tabular hidden whitespace-nowrap px-4 py-3 text-[13px] text-ink-2 sm:table-cell">
                        {formatDate(user.joined_at)}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/users/${user.id}`}
                            aria-label={`Edit ${user.full_name}`}
                            title="Edit user"
                            className="btn btn-ghost w-9 min-h-9 px-0"
                          >
                            <PencilSimple size={17} />
                          </Link>
                          {!isSelf && (
                            <button
                              onClick={() => {
                                setDeleteError(null);
                                setUserToDelete(user);
                              }}
                              title="Delete user"
                              aria-label={`Delete ${user.full_name}`}
                              className="btn btn-ghost w-9 min-h-9 px-0 hover:bg-serial-tint hover:text-serial"
                            >
                              <Trash size={17} />
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

      {/* Delete confirmation */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-user-title"
            className="panel w-full max-w-md space-y-4 p-6 shadow-[0_16px_40px_-16px_rgb(var(--shadow-color)/0.4)]"
          >
            <CloseOnEscape onClose={() => setUserToDelete(null)} />
            <div>
              <h3 id="delete-user-title" className="font-display text-[22px] leading-tight text-ink">Delete user account</h3>
              <p className="mt-1 text-[13px] text-ink-3">This cannot be undone.</p>
            </div>

            <p className="text-ink-2">
              Delete <span className="font-semibold text-ink">{userToDelete.full_name}</span> ({userToDelete.email})?
            </p>

            {deleteError && (
              <div role="alert" className="flex items-start gap-3 rounded-sm border border-serial/50 bg-serial-tint p-3 text-[14px]">
                <WarningCircle size={20} className="mt-0.5 shrink-0 text-serial" />
                <div>
                  <p className="font-semibold text-ink">The user was not deleted</p>
                  <p className="mt-0.5 text-ink-2">{deleteError}</p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button type="button" onClick={() => setUserToDelete(null)} disabled={isDeleting} className="btn btn-ghost">
                Cancel
              </button>
              <button type="button" onClick={handleDelete} disabled={isDeleting} className="btn btn-danger">
                {isDeleting ? "Deleting..." : "Delete account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
