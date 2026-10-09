"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle, CircleNotch, WarningCircle } from "@phosphor-icons/react";
import { useForgotPasswordMutation } from "@/lib/api/authApi";

export default function ForgotPasswordForm() {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const validate = () => {
    const trimmed = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmed) {
      setFieldError("Email is required");
      return false;
    }

    if (!emailRegex.test(trimmed)) {
      setFieldError("Please enter a valid email address");
      return false;
    }

    setFieldError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setSuccessMessage(null);

    if (!validate()) return;

    try {
      const response = await forgotPassword({
        email: email.trim(),
      }).unwrap();

      setSuccessMessage(
        response.message ||
          "If the account exists, a password reset request has been submitted to the administrator."
      );
    } catch (err: unknown) {
      if (err && typeof err === "object" && "data" in err) {
        const errorData = (err as { data: { detail?: string | Array<{ msg: string }> } }).data;
        if (typeof errorData?.detail === "string") {
          setApiError(errorData.detail);
        } else if (Array.isArray(errorData?.detail)) {
          setApiError(errorData.detail.map((d) => d.msg).join(", "));
        } else {
          setApiError("Unable to submit request. Please try again.");
        }
      } else if (err && typeof err === "object" && "error" in err) {
        setApiError((err as { error: string }).error);
      } else {
        setApiError("Unable to connect to the server. Please verify the backend is running.");
      }
    }
  };

  return (
    <div>
      <h1 className="font-display text-[30px] leading-tight text-ink">Reset your password</h1>
      <p className="mt-1.5 text-[15px] text-ink-2">
        If an account matches your email, your administrator receives a reset request.
      </p>

      {apiError && (
        <div role="alert" className="mt-6 flex items-start gap-2.5 rounded-sm border border-serial/50 bg-serial-tint p-3 text-[14px] text-ink">
          <WarningCircle size={18} className="mt-0.5 shrink-0 text-serial" aria-hidden="true" />
          <span>{apiError}</span>
        </div>
      )}

      {successMessage ? (
        <div className="mt-6 space-y-6">
          <div role="status" className="flex items-start gap-2.5 rounded-sm border border-ok/40 bg-ok-tint p-4 text-[14px] text-ok">
            <CheckCircle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-semibold">Request processed</p>
              <p className="mt-1 leading-relaxed">{successMessage}</p>
              <p className="mt-3 border-t border-note-ink/20 pt-3 text-[13px] text-ink-2">
                Your administrator will review your request and configure a new password for your account.
              </p>
            </div>
          </div>

          <Link href="/login" className="btn btn-secondary w-full min-h-11 text-[15px]">
            <ArrowLeft size={16} aria-hidden="true" />
            Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
          <div>
            <label htmlFor="reset-email" className="field-label">
              Email
            </label>
            <input
              id="reset-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldError) setFieldError(null);
              }}
              placeholder="name@company.com"
              aria-invalid={!!fieldError}
              aria-describedby={fieldError ? "reset-email-error" : undefined}
              className="input"
            />
            {fieldError && (
              <p id="reset-email-error" className="field-error">
                {fieldError}
              </p>
            )}
          </div>

          <button
            id="forgot-password-submit-button"
            type="submit"
            disabled={isLoading}
            className="btn btn-primary w-full min-h-11 text-[15px]"
          >
            {isLoading ? (
              <>
                <CircleNotch size={16} className="animate-spin" aria-hidden="true" />
                <span>Submitting request...</span>
              </>
            ) : (
              <span>Submit request</span>
            )}
          </button>

          <div className="border-t border-line pt-5 text-center">
            <Link href="/login" className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-note-ink hover:underline">
              <ArrowLeft size={14} aria-hidden="true" />
              Back to sign in
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
