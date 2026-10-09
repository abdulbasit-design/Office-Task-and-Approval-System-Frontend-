"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle, Info, Key, LockKey, WarningCircle, X } from "@phosphor-icons/react";
import RefreshButton from "@/components/ui/RefreshButton";
import {
  useGetMeQuery,
  useGetPasswordResetRequestsQuery,
  PasswordResetRequestItem,
} from "@/lib/api/authApi";
import type { UserResponse } from "@/lib/api/userApi";
import AdminResetPasswordModal from "@/components/auth/AdminResetPasswordModal";
import { Avatar, RoleBadge } from "@/components/users/UserTable";
import Rosette from "@/components/ui/Rosette";
import { formatDateTime } from "@/lib/format";

// A queue is served oldest first; undated requests go last.
const requestedTime = (r: PasswordResetRequestItem) =>
  r.requested_at ? new Date(r.requested_at).getTime() : Number.MAX_SAFE_INTEGER;

export default function PasswordResetRequestsPage() {
  const { data: currentUser, isLoading: isUserLoading } = useGetMeQuery();
  const {
    data: requests = [],
    isLoading: isRequestsLoading,
    isFetching,
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
      <div className="panel mx-auto mt-6 max-w-xl px-6 py-10 text-center">
        <LockKey size={32} className="mx-auto text-ink-3" aria-hidden="true" />
        <h2 className="mt-4 font-display text-[26px] leading-tight text-ink">Administrator access required</h2>
        <p className="mx-auto mt-2 max-w-md text-[14px] text-ink-2">
          Password reset management is restricted to administrators. Your current role is{" "}
          <span className="font-semibold capitalize text-ink">{currentUser?.role || "standard user"}</span>.
        </p>
        <Link href="/dashboard" className="btn btn-secondary mt-6">
          Return to dashboard
        </Link>
      </div>
    );
  }

  const handleResetSuccess = (userName: string) => {
    setSuccessBanner(
      `Password for ${userName} has been reset. Give the new password to them through a secure channel.`
    );
  };

  const queue = [...requests].sort((a, b) => requestedTime(a) - requestedTime(b));

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex items-center justify-between gap-4">
        <p className="text-[15px] text-ink-2">
          {isRequestsLoading
            ? "Loading requests..."
            : requests.length === 0
              ? "No one is waiting on a password reset."
              : `${requests.length} pending request${requests.length === 1 ? "" : "s"}, oldest first.`}
        </p>
        <RefreshButton onRefresh={refetch} fetching={isFetching} />
      </div>

      {successBanner && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-sm border border-ok/40 bg-ok-tint p-4 text-[14px] text-ok"
        >
          <CheckCircle size={20} className="mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">Password reset completed</p>
            <p className="mt-0.5 text-ink-2">{successBanner}</p>
          </div>
          <button
            onClick={() => setSuccessBanner(null)}
            className="btn btn-ghost -my-1.5 -mr-1.5 w-9 min-h-9 px-0"
            aria-label="Dismiss banner"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="panel flex items-start gap-3 p-4 text-[14px]">
        <Info size={20} className="mt-0.5 shrink-0 text-note-ink" aria-hidden="true" />
        <div>
          <p className="font-semibold text-ink">Resets are handled by administrators</p>
          <p className="mt-0.5 text-ink-2">
            Users do not receive reset links by email. When someone asks for a reset, set a new password here and
            give it to them through a secure company channel.
          </p>
        </div>
      </div>

      {isRequestsError && (
        <div role="alert" className="flex items-start gap-3 rounded-sm border border-serial/50 bg-serial-tint p-4 text-[14px]">
          <WarningCircle size={20} className="mt-0.5 shrink-0 text-serial" />
          <div className="flex-1">
            <p className="font-semibold text-ink">Password reset requests could not be loaded</p>
            <p className="mt-0.5 text-ink-2">Check that the API is running, then retry.</p>
          </div>
          <button onClick={() => refetch()} className="btn btn-secondary">
            Retry
          </button>
        </div>
      )}

      {isRequestsLoading && (
        <div className="panel divide-y divide-line" aria-busy="true" aria-label="Loading requests">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex animate-pulse items-center gap-4 px-5 py-4">
              <div className="h-10 w-10 shrink-0 rounded-full bg-paper-sunk" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-40 rounded-sm bg-paper-sunk" />
                <div className="h-3.5 w-56 rounded-sm bg-paper-sunk" />
              </div>
              <div className="hidden h-10 w-36 rounded-sm bg-paper-sunk sm:block" />
            </div>
          ))}
        </div>
      )}

      {!isRequestsLoading && !isRequestsError && requests.length === 0 && (
        <div className="panel flex items-center gap-5 px-5 py-10">
          <Rosette seed={732} variant="mark" className="h-14 w-14 shrink-0 text-line-strong" />
          <div>
            <p className="font-semibold text-ink">No password reset requests.</p>
            <p className="mt-1 max-w-[52ch] text-[14px] text-ink-3">
              Requests submitted from the sign-in page appear here, oldest first.
            </p>
          </div>
        </div>
      )}

      {!isRequestsLoading && !isRequestsError && requests.length > 0 && (
        <section aria-labelledby="reset-queue-heading" className="panel">
          <header className="flex items-baseline justify-between gap-4 border-b border-line px-5 pb-3 pt-5">
            <h2 id="reset-queue-heading" className="font-display text-[20px] leading-tight text-ink">
              Pending requests
            </h2>
            <span className="font-display text-[22px] leading-none text-ink-3 tabular">{requests.length}</span>
          </header>

          <ol className="divide-y divide-line">
            {queue.map((req, i) => (
              <li
                key={req.id}
                className="rise flex flex-col gap-4 px-5 py-4 transition-colors hover:bg-paper-sunk sm:flex-row sm:items-center"
                style={{ "--i": i } as React.CSSProperties}
              >
                <div className="flex min-w-0 flex-1 items-center gap-3.5">
                  <span className="w-6 shrink-0 text-right font-display text-[18px] text-ink-3 tabular">{i + 1}</span>
                  <Avatar name={req.full_name || "U"} className="h-10 w-10 text-[14px]" />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate font-semibold text-ink">{req.full_name}</span>
                      <RoleBadge role={req.role as UserResponse["role"]} />
                    </div>
                    <p className="mt-0.5 truncate text-[13px] text-ink-3">{req.email}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-5 sm:justify-end">
                  <div className="sm:text-right">
                    <p className="caps text-ink-3">Requested</p>
                    <p className="tabular text-[13px] text-ink-2">
                      {req.requested_at ? formatDateTime(req.requested_at) : "Just now"}
                    </p>
                  </div>
                  <button type="button" onClick={() => setSelectedRequest(req)} className="btn btn-primary shrink-0">
                    <Key size={16} aria-hidden="true" />
                    Reset password
                  </button>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

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
