"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  useGetMeQuery,
  useGetPasswordResetRequestsQuery,
  PasswordResetRequestItem,
} from "@/lib/api/authApi";
import AdminResetPasswordModal from "@/components/auth/AdminResetPasswordModal";

export default function PasswordResetRequestsPage() {
  const { data: currentUser, isLoading: isUserLoading } = useGetMeQuery();
  const {
    data: requests = [],
    isLoading: isRequestsLoading,
    isError: isRequestsError,
    refetch,
  } = useGetPasswordResetRequestsQuery(undefined, {
    skip: currentUser?.role !== "admin" && currentUser !== undefined,
  });

  const [selectedRequest, setSelectedRequest] = useState<PasswordResetRequestItem | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Check 403 / unauthorized access
  const isForbidden = !isUserLoading && currentUser && currentUser.role !== "admin";

  if (isForbidden) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M12 15v2m0 0v2m0-2h2m-2 0H10m11-3.5a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Administrator Access Required</h2>
        <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
          The password reset management panel is restricted to system administrators.
          Your current account role is{" "}
          <span className="font-semibold text-slate-800 capitalize">
            {currentUser?.role || "standard user"}
          </span>.
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

  const handleResetSuccess = (userName: string) => {
    setSuccessBanner(
      `Password for ${userName} has been successfully reset. Please communicate the new password to the user securely.`
    );
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Just now";
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-900">Password Reset Requests</h1>
            {!isRequestsLoading && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                {requests.length} pending
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Admin-managed password reset queue. Review requests and assign new credentials.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
            title="Refresh requests"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ── Success Banner ───────────────────────────────────────────────── */}
      {successBanner && (
        <div
          role="status"
          className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start justify-between gap-3 shadow-2xs animate-in fade-in duration-200"
        >
          <div className="flex items-start gap-2.5">
            <svg className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="font-semibold text-emerald-900">Password Reset Completed</p>
              <p className="text-emerald-700 mt-0.5 leading-relaxed">{successBanner}</p>
            </div>
          </div>
          <button
            onClick={() => setSuccessBanner(null)}
            className="text-emerald-500 hover:text-emerald-700 p-1"
            aria-label="Dismiss banner"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* ── Security Note Banner ─────────────────────────────────────────── */}
      <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 text-xs text-blue-900 flex items-start gap-3">
        <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div>
          <p className="font-semibold text-blue-950">Admin-Managed Security Policy</p>
          <p className="text-blue-800/90 mt-0.5 leading-relaxed">
            In accordance with system policy, users do not receive password reset tokens via email.
            When an employee submits a reset request, you must configure a new password here and convey it to them through secure corporate channels.
          </p>
        </div>
      </div>

      {/* ── Loading State ────────────────────────────────────────────────── */}
      {isRequestsLoading && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-8 text-center shadow-2xs">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-600 mb-3 animate-pulse">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <p className="text-xs font-semibold text-slate-700">Loading pending requests...</p>
        </div>
      )}

      {/* ── Error State ──────────────────────────────────────────────────── */}
      {isRequestsError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-3 text-rose-800 text-xs">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>Failed to load password reset requests. Please verify the backend connection.</span>
          </div>
          <button
            onClick={() => refetch()}
            className="font-bold underline hover:text-rose-900"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Empty State ──────────────────────────────────────────────────── */}
      {!isRequestsLoading && !isRequestsError && requests.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center shadow-2xs">
          <div className="w-14 h-14 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-base font-bold text-slate-900">No Pending Requests</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            All user password reset requests have been processed. New requests submitted via the login portal will appear here automatically.
          </p>
        </div>
      )}

      {/* ── Requests List ────────────────────────────────────────────────── */}
      {!isRequestsLoading && !isRequestsError && requests.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Pending Reset Queue ({requests.length})
            </h2>
            <span className="text-[11px] text-slate-400">
              Sorted by most recent
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {requests.map((req) => {
              const initials = req.full_name
                ? req.full_name
                    .split(" ")
                    .map((n) => n[0])
                    .filter(Boolean)
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()
                : "U";

              return (
                <div
                  key={req.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                >
                  {/* Left: User Info */}
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-2xs">
                      {initials}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-slate-900 truncate">
                          {req.full_name}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 capitalize">
                          {req.role}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          Pending
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {req.email}
                      </p>
                    </div>
                  </div>

                  {/* Right: Date + Action Button */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pl-13 sm:pl-0">
                    <div className="text-left sm:text-right">
                      <p className="text-[11px] text-slate-400">Requested</p>
                      <p className="text-xs font-medium text-slate-700">
                        {formatDate(req.requested_at)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedRequest(req)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold rounded-xl shadow-xs hover:shadow transition flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.75}
                          d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                        />
                      </svg>
                      <span>Reset Password</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Reset Password Modal ─────────────────────────────────────────── */}
      {selectedRequest && (
        <AdminResetPasswordModal
          request={selectedRequest}
          isOpen={Boolean(selectedRequest)}
          onClose={() => setSelectedRequest(null)}
          onSuccess={handleResetSuccess}
        />
      )}
    </div>
  );
}
