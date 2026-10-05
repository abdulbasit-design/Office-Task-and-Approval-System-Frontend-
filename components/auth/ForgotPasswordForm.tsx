"use client";

import React, { useState } from "react";
import Link from "next/link";
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
    <div className="w-full max-w-[420px] bg-white rounded-2xl border border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-7 sm:p-9 text-slate-900">
      {/* Top Security / Key Icon */}
      <div className="flex justify-center">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shadow-xs">
          <svg
            className="w-6 h-6 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
            />
          </svg>
        </div>
      </div>

      {/* Brand & Heading */}
      <div className="text-center mt-3">
        <h2 className="text-sm font-semibold text-slate-800 tracking-tight">
          Office Task &amp; Approval System
        </h2>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-2">
          Forgot Password
        </h1>
        <p className="text-xs text-slate-500 mt-1.5 max-w-[300px] mx-auto leading-relaxed">
          Enter your registered email address. If an account exists, a password reset request will be submitted to the administrator.
        </p>
      </div>

      {/* Feedback Alerts */}
      {apiError && (
        <div role="alert" className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
          <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <span>{apiError}</span>
        </div>
      )}

      {successMessage ? (
        <div className="mt-5 space-y-4">
          <div role="status" className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-2">
            <div className="flex items-start gap-2.5">
              <svg className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="space-y-1">
                <p className="font-semibold text-emerald-900">Request Processed</p>
                <p className="text-emerald-700 leading-relaxed">{successMessage}</p>
              </div>
            </div>
            <p className="text-[11px] text-emerald-600 pt-1 border-t border-emerald-100">
              Your administrator will review your request and configure a new password for your account.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/login"
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-semibold text-sm rounded-lg shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      ) : (
        /* Form */
        <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
          {/* Email Field */}
          <div>
            <label htmlFor="reset-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Corporate Email <span className="text-red-500 font-bold">*</span>
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
              placeholder="e.g. employee@company.com"
              className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors ${
                fieldError
                  ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                  : "border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
              }`}
            />
            {fieldError && <p className="mt-1 text-xs text-red-600">{fieldError}</p>}
          </div>

          {/* Submit Button */}
          <button
            id="forgot-password-submit-button"
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm rounded-lg shadow-sm hover:shadow transition duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Submitting Request...</span>
              </>
            ) : (
              <span>Submit Request</span>
            )}
          </button>

          {/* Back to Login Link */}
          <div className="text-center pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Login
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
