"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import type { UserResponse, UserAdminUpdate } from "@/lib/api/userApi";
import { useUpdateUserMutation } from "@/lib/api/userApi";
import type { DepartmentResponse } from "@/lib/api/departmentApi";

interface UserFormProps {
  user: UserResponse;
  departments?: DepartmentResponse[];
  users?: UserResponse[];
}

export default function UserForm({
  user,
  departments = [],
  users = [],
}: UserFormProps) {
  const router = useRouter();
  const [updateUser, { isLoading: isSubmitting }] = useUpdateUserMutation();

  // Form states initialized with existing user values
  const [fullName, setFullName] = useState(user.full_name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState<UserAdminUpdate["role"]>(user.role);
  const [departmentId, setDepartmentId] = useState<string>(
    user.department_id !== null ? String(user.department_id) : ""
  );
  const [managerId, setManagerId] = useState<string>(
    user.manager_id !== null ? String(user.manager_id) : ""
  );
  const [isActive, setIsActive] = useState<boolean>(user.is_active);

  // Status feedback
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Eligible managers: users with role 'manager' who are not the user being edited
  const eligibleManagers = users.filter(
    (u) => u.role === "manager" && u.id !== user.id
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setSuccessMessage(null);

    // Basic frontend validation
    if (fullName.trim().length < 2 || fullName.trim().length > 150) {
      setServerError("Full name must be between 2 and 150 characters.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setServerError("Please enter a valid email address.");
      return;
    }

    const payload: UserAdminUpdate = {
      full_name: fullName.trim(),
      email: email.trim().toLowerCase(),
      role,
      department_id: departmentId ? Number(departmentId) : null,
      manager_id: managerId ? Number(managerId) : null,
      is_active: isActive,
    };

    try {
      await updateUser({ id: user.id, body: payload }).unwrap();
      setSuccessMessage("User updated successfully!");
      setTimeout(() => {
        setSuccessMessage(null);
      }, 4000);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "data" in err) {
        const errorData = (err as { data: { detail?: string } }).data;
        setServerError(errorData?.detail || "Failed to update user.");
      } else {
        setServerError("An unexpected error occurred while updating the user.");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Alert Banners */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-sm animate-in fade-in duration-200">
          <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {serverError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-800 text-sm animate-in fade-in duration-200">
          <svg className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="font-semibold">Update Error</p>
            <p className="text-xs text-rose-700 mt-0.5">{serverError}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6 space-y-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
          Personal & Account Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Full Name */}
          <div>
            <label htmlFor="user-fullname" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="user-fullname"
              type="text"
              required
              minLength={2}
              maxLength={150}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Jane Doe"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <p className="text-[11px] text-slate-400 mt-1">Between 2 and 150 characters.</p>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="user-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              id="user-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. jane@company.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <p className="text-[11px] text-slate-400 mt-1">Must be unique across all accounts.</p>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
            Role & Organization
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Role */}
            <div>
              <label htmlFor="user-role" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Role <span className="text-rose-500">*</span>
              </label>
              <select
                id="user-role"
                value={role}
                onChange={(e) => setRole(e.target.value as UserAdminUpdate["role"])}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="admin">Administrator</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Admins have full access. Managers can create and review tasks.
              </p>
            </div>

            {/* Department */}
            <div>
              <label htmlFor="user-department" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Department
              </label>
              <select
                id="user-department"
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">No Department (None)</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 mt-1">Assign user to a department.</p>
            </div>

            {/* Manager */}
            <div>
              <label htmlFor="user-manager" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Reporting Manager
              </label>
              <select
                id="user-manager"
                value={managerId}
                onChange={(e) => setManagerId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">No Manager (None)</option>
                {eligibleManagers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.full_name} ({m.email})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Only users with Manager role can be selected.
              </p>
            </div>
          </div>
        </div>

        {/* Active Toggle */}
        <div className="border-t border-slate-100 pt-5">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              id="user-active-toggle"
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
            <div>
              <span className="text-xs font-semibold text-slate-800 block">
                Account Active
              </span>
              <span className="text-[11px] text-slate-500">
                Inactive users cannot log in or perform actions in the system.
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => router.push("/users")}
          className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
        >
          Back to Users
        </button>

        <button
          type="submit"
          id="save-user-button"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving Changes...
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </div>
    </form>
  );
}
