"use client";

import React, { useState } from "react";
import { CheckCircle, CircleNotch, Info, WarningCircle } from "@phosphor-icons/react";
import type { SignupResponse } from "@/lib/api/authApi";
import type { UserAdminUpdate } from "@/lib/api/userApi";
import { useUpdateUserMutation } from "@/lib/api/userApi";

interface ProfileFormProps {
  user: SignupResponse;
}

export default function ProfileForm({ user }: ProfileFormProps) {
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
    <section aria-labelledby="profile-form-heading" className="panel">
      <header className="border-b border-line px-5 pb-4 pt-5 sm:px-6">
        <h2 id="profile-form-heading" className="font-display text-[20px] leading-tight text-ink">
          Personal information
        </h2>
        <p className="mt-1 text-[14px] text-ink-3">
          {isAdmin
            ? "Update your personal details below."
            : "Your account details as recorded in the system."}
        </p>
      </header>

      <div className="space-y-5 px-5 py-5 sm:px-6">
        {successMsg && (
          <div role="status" className="flex items-center gap-3 rounded-sm border border-ok/40 bg-ok-tint p-4 text-[14px] font-semibold text-ok">
            <CheckCircle size={20} className="shrink-0" aria-hidden="true" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div role="alert" className="flex items-start gap-3 rounded-sm border border-serial/50 bg-serial-tint p-4 text-[14px]">
            <WarningCircle size={20} className="mt-0.5 shrink-0 text-serial" aria-hidden="true" />
            <div>
              <p className="font-semibold text-ink">Update failed</p>
              <p className="mt-0.5 text-ink-2">{errorMsg}</p>
            </div>
          </div>
        )}

        {!isAdmin && (
          <div className="flex items-start gap-3 rounded-sm border border-line bg-paper-sunk p-4 text-[14px]">
            <Info size={20} className="mt-0.5 shrink-0 text-ink-3" aria-hidden="true" />
            <div>
              <p className="font-semibold text-ink">Managed by an administrator</p>
              <p className="mt-0.5 text-ink-2">
                Only an administrator can change account details. If your name, email, department or
                reporting manager needs to change, contact a system administrator.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label htmlFor="profile-fullname" className="field-label">
                Full name
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
                className="input"
              />
            </div>

            <div>
              <label htmlFor="profile-email" className="field-label">
                Email address
              </label>
              <input
                id="profile-email"
                type="email"
                required
                disabled={!isAdmin}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
              />
            </div>
          </div>

          {isAdmin && (
            <div className="flex justify-end border-t border-line pt-5">
              <button
                type="submit"
                id="save-profile-btn"
                disabled={isUpdating}
                className="btn btn-primary"
              >
                {isUpdating ? (
                  <>
                    <CircleNotch size={16} className="animate-spin" aria-hidden="true" />
                    Saving changes...
                  </>
                ) : (
                  "Save changes"
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
