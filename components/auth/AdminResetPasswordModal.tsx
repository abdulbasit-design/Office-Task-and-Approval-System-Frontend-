"use client";

import React, { useState } from "react";
import { CircleNotch, Eye, EyeSlash, WarningCircle, X } from "@phosphor-icons/react";
import { useAdminResetPasswordMutation, PasswordResetRequestItem } from "@/lib/api/authApi";
import CloseOnEscape from "@/components/ui/CloseOnEscape";

interface AdminResetPasswordModalProps {
  request: PasswordResetRequestItem;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userName: string) => void;
}

export default function AdminResetPasswordModal({
  request,
  isOpen,
  onClose,
  onSuccess,
}: AdminResetPasswordModalProps) {
  const [adminResetPassword, { isLoading }] = useAdminResetPasswordMutation();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<{
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const [apiError, setApiError] = useState<string | null>(null);

  if (!isOpen) return null;

  const validate = () => {
    const errors: { newPassword?: string; confirmPassword?: string } = {};

    if (!newPassword) {
      errors.newPassword = "New password is required";
    } else if (newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters long";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Confirm password is required";
    } else if (newPassword && confirmPassword !== newPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validate()) return;

    try {
      await adminResetPassword({
        requestId: request.id,
        new_password: newPassword,
      }).unwrap();

      // Reset local sensitive form state
      setNewPassword("");
      setConfirmPassword("");
      setFieldErrors({});

      onSuccess(request.full_name);
      onClose();
    } catch (err: unknown) {
      if (err && typeof err === "object" && "data" in err) {
        const errorData = (err as { data: { detail?: string | Array<{ msg: string }> } }).data;
        if (typeof errorData?.detail === "string") {
          setApiError(errorData.detail);
        } else if (Array.isArray(errorData?.detail)) {
          setApiError(errorData.detail.map((d) => d.msg).join(", "));
        } else {
          setApiError("Failed to reset password. Please try again.");
        }
      } else if (err && typeof err === "object" && "error" in err) {
        setApiError((err as { error: string }).error);
      } else {
        setApiError("Network error. Unable to reach server.");
      }
    }
  };

  const handleClose = () => {
    setNewPassword("");
    setConfirmPassword("");
    setFieldErrors({});
    setApiError(null);
    onClose();
  };

  return (
    <div
      className="dialog-backdrop fixed inset-0 z-50 flex justify-center overflow-y-auto bg-ink/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <CloseOnEscape onClose={handleClose} />
      <div className="dialog-panel panel relative my-auto w-full max-w-md p-6 shadow-[0_16px_40px_-16px_rgb(var(--shadow-color)/0.4)] sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="modal-title" className="font-display text-[26px] leading-tight text-ink">
              Set new password
            </h2>
            <p className="mt-0.5 text-[14px] text-ink-2">Admin-managed password reset</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="btn btn-ghost -mr-2 -mt-1 w-9 min-h-9 shrink-0 px-0"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 flex items-center justify-between gap-4 rounded-sm bg-paper-sunk px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold text-ink">{request.full_name}</p>
            <p className="truncate text-[13px] text-ink-3">{request.email}</p>
          </div>
          <span className="caps shrink-0 text-ink-2">{request.role}</span>
        </div>

        {apiError && (
          <div role="alert" className="mt-5 flex items-start gap-2.5 rounded-sm border border-serial/50 bg-serial-tint p-3 text-[14px] text-ink">
            <WarningCircle size={18} className="mt-0.5 shrink-0 text-serial" aria-hidden="true" />
            <span>{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-5" noValidate>
          <div>
            <label htmlFor="admin-new-password" className="field-label">
              New password
            </label>
            <div className="relative">
              <input
                id="admin-new-password"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (fieldErrors.newPassword) setFieldErrors((p) => ({ ...p, newPassword: undefined }));
                }}
                placeholder="At least 8 characters"
                aria-invalid={!!fieldErrors.newPassword}
                aria-describedby={fieldErrors.newPassword ? "admin-new-password-error" : undefined}
                className="input pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-sm text-ink-3 transition-colors hover:text-ink"
              >
                {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {fieldErrors.newPassword && (
              <p id="admin-new-password-error" className="field-error">
                {fieldErrors.newPassword}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="admin-confirm-password" className="field-label">
              Confirm new password
            </label>
            <input
              id="admin-confirm-password"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (fieldErrors.confirmPassword) setFieldErrors((p) => ({ ...p, confirmPassword: undefined }));
              }}
              aria-invalid={!!fieldErrors.confirmPassword}
              aria-describedby={fieldErrors.confirmPassword ? "admin-confirm-password-error" : undefined}
              className="input"
            />
            {fieldErrors.confirmPassword && (
              <p id="admin-confirm-password-error" className="field-error">
                {fieldErrors.confirmPassword}
              </p>
            )}
          </div>

          <p className="text-[13px] leading-snug text-ink-3">
            Once reset, the user can sign in with this password. Share it with them securely.
          </p>

          <div className="flex items-center justify-end gap-3 border-t border-line pt-5">
            <button type="button" onClick={handleClose} disabled={isLoading} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="btn btn-primary">
              {isLoading ? (
                <>
                  <CircleNotch size={16} className="animate-spin" aria-hidden="true" />
                  <span>Resetting...</span>
                </>
              ) : (
                <span>Reset password</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
