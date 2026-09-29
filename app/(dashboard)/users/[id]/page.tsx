"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  useGetUserQuery,
  useGetUsersQuery,
  useDeleteUserMutation,
} from "@/lib/api/userApi";
import { useGetDepartmentsQuery } from "@/lib/api/departmentApi";
import { useGetMeQuery } from "@/lib/api/authApi";
import UserForm from "@/components/users/UserForm";
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
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "U";
}

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
      <div className="max-w-4xl mx-auto py-12 space-y-6 animate-pulse">
        <div className="h-6 w-32 bg-slate-200 rounded-lg" />
        <div className="h-40 bg-slate-200 rounded-2xl" />
        <div className="h-80 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  // 403 Forbidden state
  if (isForbidden) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
              d="M12 15v2m0 0v2m0-2h2m-2 0H10m11-3.5a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h2>
        <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
          Viewing or editing user accounts is restricted to system administrators.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  // 404 or Error state
  if (isUserError || !user) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">User Not Found</h2>
        <p className="text-sm text-slate-600 mb-6">
          The requested user account does not exist or may have been deleted.
        </p>
        <Link
          href="/users"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
        >
          Back to Users List
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ── Breadcrumb & Navigation ──────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/users" className="hover:text-slate-800 font-medium transition-colors">
            Users
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">{user.full_name}</span>
        </div>

        {!isSelf && (
          <button
            onClick={() => {
              setDeleteError(null);
              setShowDeleteModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Account
          </button>
        )}
      </div>

      {/* ── Profile Header Card ──────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 text-white flex items-center justify-center font-bold text-xl shadow-md">
              {getInitials(user.full_name)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">{user.full_name}</h1>
                {isSelf && (
                  <span className="text-[10px] bg-blue-50 text-blue-600 font-semibold px-2 py-0.5 rounded-full border border-blue-200">
                    Your Account
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 mt-0.5">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <RoleBadge role={user.role} />
                <StatusBadge isActive={user.is_active} />
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
            <span className="text-xs text-slate-400 block">Member Since</span>
            <span className="text-xs font-semibold text-slate-700 block mt-0.5">
              {formatDate(user.joined_at)}
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">
              User ID #{user.id}
            </span>
          </div>
        </div>
      </div>

      {/* ── Context & Assignment Info ────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Department Info */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4">
          <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">
            Department
          </span>
          {currentDepartment ? (
            <div className="mt-2">
              <p className="text-sm font-bold text-slate-900">{currentDepartment.name}</p>
              {currentDepartment.description && (
                <p className="text-xs text-slate-500 mt-1">{currentDepartment.description}</p>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic mt-2">No department assigned</p>
          )}
        </div>

        {/* Manager Info */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4">
          <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">
            Reports To (Manager)
          </span>
          {currentManager ? (
            <div className="mt-2">
              <Link
                href={`/users/${currentManager.id}`}
                className="text-sm font-bold text-blue-600 hover:underline"
              >
                {currentManager.full_name}
              </Link>
              <p className="text-xs text-slate-500 mt-0.5">{currentManager.email}</p>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic mt-2">No reporting manager assigned</p>
          )}
        </div>
      </div>

      {/* ── Edit Form ────────────────────────────────────────────────────── */}
      <UserForm
        user={user}
        departments={departments}
        users={allUsers}
      />

      {/* ── Delete Confirmation Modal ────────────────────────────────────── */}
      {showDeleteModal && (
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
              Are you sure you want to permanently delete{" "}
              <span className="font-semibold text-slate-900">{user.full_name}</span>?
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
                onClick={() => setShowDeleteModal(false)}
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
    </div>
  );
}
