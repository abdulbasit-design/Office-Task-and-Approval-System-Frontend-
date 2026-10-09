"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, CircleNotch, WarningCircle } from "@phosphor-icons/react";
import type { UserResponse, UserAdminUpdate } from "@/lib/api/userApi";
import { useUpdateUserMutation } from "@/lib/api/userApi";
import type { DepartmentResponse } from "@/lib/api/departmentApi";

interface UserFormProps {
  user: UserResponse;
  departments?: DepartmentResponse[];
  users?: UserResponse[];
}

const Required = () => (
  <span className="text-serial" aria-hidden="true">
    {" "}*
  </span>
);

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
      setSuccessMessage("Changes saved.");
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
    <form onSubmit={handleSubmit} className="space-y-4">
      {successMessage && (
        <div
          role="status"
          className="flex items-center gap-3 rounded-sm border border-ok/40 bg-ok-tint p-4 text-[14px] font-semibold text-ok"
        >
          <CheckCircle size={20} className="shrink-0" />
          {successMessage}
        </div>
      )}

      {serverError && (
        <div role="alert" className="flex items-start gap-3 rounded-sm border border-serial/50 bg-serial-tint p-4 text-[14px]">
          <WarningCircle size={20} className="mt-0.5 shrink-0 text-serial" />
          <div>
            <p className="font-semibold text-ink">Changes were not saved</p>
            <p className="mt-0.5 text-ink-2">{serverError}</p>
          </div>
        </div>
      )}

      <section aria-labelledby="edit-user-heading" className="panel">
        <h2 id="edit-user-heading" className="border-b border-line px-5 pb-3 pt-5 font-display text-[20px] leading-tight text-ink">
          Edit account
        </h2>

        <div className="divide-y divide-line px-5">
          <fieldset className="py-5">
            <legend className="caps float-left mb-3 w-full text-ink-3">Account</legend>
            <div className="clear-left grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label htmlFor="user-fullname" className="field-label">
                  Full name<Required />
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
                  aria-describedby="user-fullname-hint"
                  className="input"
                />
                <p id="user-fullname-hint" className="field-hint">Between 2 and 150 characters.</p>
              </div>

              <div>
                <label htmlFor="user-email" className="field-label">
                  Email address<Required />
                </label>
                <input
                  id="user-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. jane@company.com"
                  aria-describedby="user-email-hint"
                  className="input"
                />
                <p id="user-email-hint" className="field-hint">Must be unique across all accounts.</p>
              </div>
            </div>
          </fieldset>

          <fieldset className="py-5">
            <legend className="caps float-left mb-3 w-full text-ink-3">Role and organization</legend>
            <div className="clear-left grid grid-cols-1 gap-5 md:grid-cols-3">
              <div>
                <label htmlFor="user-role" className="field-label">
                  Role<Required />
                </label>
                <select
                  id="user-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserAdminUpdate["role"])}
                  aria-describedby="user-role-hint"
                  className="input"
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Administrator</option>
                </select>
                <p id="user-role-hint" className="field-hint">
                  Admins have full access. Managers create and review tasks.
                </p>
              </div>

              <div>
                <label htmlFor="user-department" className="field-label">
                  Department
                </label>
                <select
                  id="user-department"
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="input"
                >
                  <option value="">No department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="user-manager" className="field-label">
                  Reporting manager
                </label>
                <select
                  id="user-manager"
                  value={managerId}
                  onChange={(e) => setManagerId(e.target.value)}
                  aria-describedby="user-manager-hint"
                  className="input"
                >
                  <option value="">No manager</option>
                  {eligibleManagers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.full_name} ({m.email})
                    </option>
                  ))}
                </select>
                <p id="user-manager-hint" className="field-hint">Only users with the Manager role are listed.</p>
              </div>
            </div>
          </fieldset>

          <div className="py-5">
            <label className="flex cursor-pointer select-none items-start gap-3">
              <input
                id="user-active-toggle"
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 accent-note"
              />
              <span>
                <span className="block text-[14px] font-semibold text-ink">Account active</span>
                <span className="block text-[13px] text-ink-3">
                  Inactive users cannot sign in or act in the system.
                </span>
              </span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-line px-5 py-4">
          <button type="button" onClick={() => router.push("/users")} className="btn btn-ghost">
            Back to users
          </button>
          <button type="submit" id="save-user-button" disabled={isSubmitting} className="btn btn-primary">
            {isSubmitting ? (
              <>
                <CircleNotch size={16} className="animate-spin" aria-hidden="true" />
                Saving changes...
              </>
            ) : (
              "Save changes"
            )}
          </button>
        </div>
      </section>
    </form>
  );
}
