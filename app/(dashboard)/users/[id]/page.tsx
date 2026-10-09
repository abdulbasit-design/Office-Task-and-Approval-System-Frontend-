"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, LockKey, Trash, WarningCircle } from "@phosphor-icons/react";
import {
  useGetUserQuery,
  useGetUsersQuery,
  useDeleteUserMutation,
} from "@/lib/api/userApi";
import { useGetDepartmentsQuery } from "@/lib/api/departmentApi";
import { useGetMeQuery } from "@/lib/api/authApi";
import UserForm from "@/components/users/UserForm";
import { Avatar, RoleBadge, StatusBadge } from "@/components/users/UserTable";
import { formatDateTime } from "@/lib/format";
import CloseOnEscape from "@/components/ui/CloseOnEscape";

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = Number(params?.id);

  const { data: currentUser } = useGetMeQuery();
  const {
    data: user,
    isLoading: isUserLoading,
    isError: isUserError,
    error: userError,
  } = useGetUserQuery(userId, { skip: !userId || isNaN(userId) });

  const { data: allUsers = [] } = useGetUsersQuery();
  const { data: departments = [] } = useGetDepartmentsQuery();

  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Check 403 Forbidden
  const isForbidden =
    (userError &&
      typeof userError === "object" &&
      "status" in userError &&
      userError.status === 403) ||
    (currentUser && currentUser.role !== "admin");

  const isSelf = currentUser?.id === userId;

  const currentDepartment = departments.find((d) => d.id === user?.department_id);
  const currentManager = allUsers.find((u) => u.id === user?.manager_id);

  const handleDelete = async () => {
    if (!user) return;
    setDeleteError(null);
    try {
      await deleteUser(user.id).unwrap();
      router.push("/users");
    } catch (err: unknown) {
      if (err && typeof err === "object" && "data" in err) {
        const errorData = (err as { data: { detail?: string } }).data;
        setDeleteError(errorData?.detail || "Failed to delete user.");
      } else {
        setDeleteError("An unexpected error occurred while deleting user.");
      }
    }
  };

  // Loading state
  if (isUserLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6" aria-busy="true" aria-label="Loading user">
        <div className="h-5 w-24 animate-pulse rounded-sm bg-paper-sunk" />
        <div className="frame flex animate-pulse items-center gap-5 p-6">
          <div className="h-16 w-16 rounded-full bg-paper-sunk" />
          <div className="flex-1 space-y-3">
            <div className="h-7 w-56 rounded-sm bg-paper-sunk" />
            <div className="h-4 w-40 rounded-sm bg-paper-sunk" />
          </div>
        </div>
        <div className="panel h-36 animate-pulse" />
        <div className="panel h-96 animate-pulse" />
      </div>
    );
  }

  // 403 Forbidden state
  if (isForbidden) {
    return (
      <div className="panel mx-auto mt-6 max-w-xl px-6 py-10 text-center">
        <LockKey size={32} className="mx-auto text-ink-3" aria-hidden="true" />
        <h2 className="mt-4 font-display text-[26px] leading-tight text-ink">Access denied</h2>
        <p className="mx-auto mt-2 max-w-md text-[14px] text-ink-2">
          Viewing or editing user accounts is restricted to administrators.
        </p>
        <Link href="/dashboard" className="btn btn-secondary mt-6">
          Return to dashboard
        </Link>
      </div>
    );
  }

  // 404 or Error state
  if (isUserError || !user) {
    return (
      <div className="panel mx-auto mt-6 max-w-xl px-6 py-10 text-center">
        <WarningCircle size={32} className="mx-auto text-serial" aria-hidden="true" />
        <h2 className="mt-4 font-display text-[26px] leading-tight text-ink">User not found</h2>
        <p className="mx-auto mt-2 max-w-md text-[14px] text-ink-2">
          This account does not exist or has been deleted.
        </p>
        <Link href="/users" className="btn btn-secondary mt-6">
          Back to users
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/users"
          className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-note-ink hover:underline"
        >
          <ArrowLeft size={16} aria-hidden="true" /> All users
        </Link>

        {!isSelf && (
          <button
            onClick={() => {
              setDeleteError(null);
              setShowDeleteModal(true);
            }}
            className="btn btn-danger"
          >
            <Trash size={16} aria-hidden="true" />
            Delete account
          </button>
        )}
      </div>

      {/* The primary record */}
      <section aria-labelledby="user-name" className="frame flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
        <Avatar name={user.full_name} className="h-16 w-16 text-[22px]" />
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2 id="user-name" className="font-display text-[30px] leading-tight text-ink">
              {user.full_name}
            </h2>
            {isSelf && <span className="caps text-note-ink">Your account</span>}
          </div>
          <p className="mt-0.5 truncate text-ink-2">{user.email}</p>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <RoleBadge role={user.role} />
            <StatusBadge isActive={user.is_active} />
          </div>
        </div>
      </section>

      <section aria-label="Account details" className="panel px-5 py-5">
        <dl className="grid grid-cols-1 gap-x-8 gap-y-5 text-[14px] sm:grid-cols-2">
          <div>
            <dt className="caps text-ink-3">Department</dt>
            <dd className="mt-1">
              {currentDepartment ? (
                <>
                  <span className="font-semibold text-ink">{currentDepartment.name}</span>
                  {currentDepartment.description && (
                    <span className="mt-0.5 block text-[13px] text-ink-2">{currentDepartment.description}</span>
                  )}
                </>
              ) : (
                <span className="text-ink-3">No department assigned</span>
              )}
            </dd>
          </div>

          <div>
            <dt className="caps text-ink-3">Reports to</dt>
            <dd className="mt-1">
              {currentManager ? (
                <>
                  <Link href={`/users/${currentManager.id}`} className="font-semibold text-note-ink hover:underline">
                    {currentManager.full_name}
                  </Link>
                  <span className="mt-0.5 block text-[13px] text-ink-3">{currentManager.email}</span>
                </>
              ) : (
                <span className="text-ink-3">No reporting manager assigned</span>
              )}
            </dd>
          </div>

          <div>
            <dt className="caps text-ink-3">Member since</dt>
            <dd className="tabular mt-1 text-ink">{formatDateTime(user.joined_at)}</dd>
          </div>

          <div>
            <dt className="caps text-ink-3">User ID</dt>
            <dd className="mt-1 font-mono text-[13px] text-ink">{user.id}</dd>
          </div>
        </dl>
      </section>

      <UserForm user={user} departments={departments} users={allUsers} />

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-account-title"
            className="panel w-full max-w-md space-y-4 p-6 shadow-[0_16px_40px_-16px_rgb(var(--shadow-color)/0.4)]"
          >
            <CloseOnEscape onClose={() => setShowDeleteModal(false)} />
            <div>
              <h3 id="delete-account-title" className="font-display text-[22px] leading-tight text-ink">Delete user account</h3>
              <p className="mt-1 text-[13px] text-ink-3">This cannot be undone.</p>
            </div>

            <p className="text-ink-2">
              Permanently delete <span className="font-semibold text-ink">{user.full_name}</span>?
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
              <button type="button" onClick={() => setShowDeleteModal(false)} disabled={isDeleting} className="btn btn-ghost">
                Cancel
              </button>
              <button type="button" onClick={handleDelete} disabled={isDeleting} className="btn btn-danger">
                {isDeleting ? "Deleting..." : "Delete account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
