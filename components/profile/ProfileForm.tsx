"use client";

import React, { useState } from "react";
import type { SignupResponse } from "@/lib/api/authApi";
import type { UserAdminUpdate } from "@/lib/api/userApi";
import { useUpdateUserMutation } from "@/lib/api/userApi";

interface ProfileFormProps {
  user: SignupResponse;
  departmentName?: string | null;
  managerName?: string | null;
}

export default function ProfileForm({
  user,
  departmentName,
  managerName,
}: ProfileFormProps) {
  const isAdmin = user.role === "admin";
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  const [fullName, setFullName] = useState(user.full_name);
  const [email, setEmail] = useState(user.email);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    setSuccessMsg(null);
    setErrorMsg(null);

    const trimmedName = fullName.trim();
    if (trimmedName.length < 2 || trimmedName.length > 150) {
      setErrorMsg("Full name must be between 2 and 150 characters.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    // Exact backend schema: UserAdminUpdate
    const payload: UserAdminUpdate = {
      full_name: trimmedName,
      email: email.trim().toLowerCase(),
      role: user.role as "employee" | "manager" | "admin",
      department_id: user.department_id,
      manager_id: user.manager_id,
      is_active: user.is_active,
    };

    try {
      await updateUser({ id: user.id, body: payload }).unwrap();
      setSuccessMsg("Profile information updated successfully.");
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "data" in err) {
        const errData = (err as { data: { detail?: string } }).data;
        setErrorMsg(errData?.detail || "Failed to update profile.");
      } else {
        setErrorMsg("An unexpected error occurred while saving profile changes.");
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900">Personal Information</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {isAdmin
              ? "Update your personal details below."
              : "Your account details as recorded in the system."}
          </p>
        </div>
        {!isAdmin && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Admin Managed
          </span>
        )}
      </div>

      {/* Success Banner */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800 animate-in fade-in duration-150">
          <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in duration-150">
          <svg className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <span className="font-semibold block">Update Failed</span>
            <span>{errorMsg}</span>
          </div>
        </div>
      )}

      {!isAdmin && (
        <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-600 flex items-start gap-3">
          <svg className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-semibold text-slate-800">Account Management Notice</p>
            <p className="mt-0.5 text-slate-500">
              The backend API requires administrator authorization for modifying user account properties.
              If your name, email, department, or reporting manager needs adjustment, please contact a system administrator.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Full Name */}
          <div>
            <label htmlFor="profile-fullname" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Full Name
            </label>
            <input
              id="profile-fullname"
              type="text"
              required
              disabled={!isAdmin}
              minLength={2}
              maxLength={150}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="profile-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email Address
            </label>
            <input
              id="profile-email"
              type="email"
              required
              disabled={!isAdmin}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Read-only Contextual Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          {/* Department */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Assigned Department
            </label>
            <div className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700">
              {departmentName ? departmentName : <span className="text-slate-400 italic">Not Assigned</span>}
            </div>
          </div>

          {/* Reporting Manager */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Reporting Manager
            </label>
            <div className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700">
              {managerName ? managerName : <span className="text-slate-400 italic">None</span>}
            </div>
          </div>
        </div>

        {isAdmin && (
          <div className="flex justify-end pt-3 border-t border-slate-100">
            <button
              type="submit"
              id="save-profile-btn"
              disabled={isUpdating}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isUpdating ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving Changes...
                </>
              ) : (
                "Save Profile Changes"
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
