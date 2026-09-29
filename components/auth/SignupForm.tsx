"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSignupMutation } from "@/lib/api/authApi";

export default function SignupForm() {
  const router = useRouter();
  const [signup, { isLoading }] = useSignupMutation();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const validate = () => {
    const errors: {
      fullName?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!fullName.trim()) {
      errors.fullName = "Full name is required";
    } else if (fullName.trim().length < 2) {
      errors.fullName = "Full name must be at least 2 characters";
    }

    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(email.trim())) {
      errors.email = "Please enter a valid email address";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters long";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Confirm password is required";
    } else if (confirmPassword !== password) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setSuccessMessage(null);

    if (!validate()) {
      return;
    }

    try {
      await signup({
        full_name: fullName.trim(),
        email: email.trim(),
        password,
      }).unwrap();

      setSuccessMessage("Account created successfully! Redirecting to sign in...");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "data" in err) {
        const errorData = (err as { data: { detail?: string | Array<{ msg: string }> } }).data;
        if (typeof errorData?.detail === "string") {
          setApiError(errorData.detail);
        } else if (Array.isArray(errorData?.detail)) {
          setApiError(errorData.detail.map((d) => d.msg).join(", "));
        } else {
          setApiError("Registration failed. Please check your details.");
        }
      } else if (err && typeof err === "object" && "error" in err) {
        setApiError((err as { error: string }).error);
      } else {
        setApiError("Unable to connect to the server. Please verify the backend is running.");
      }
    }
  };

  const isPasswordValidLength = password.length >= 8;

  return (
    <div className="w-full max-w-[400px] bg-white rounded-2xl border border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-7 sm:p-9 text-slate-900">
      {/* Top Clipboard Icon */}
      <div className="flex justify-center">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shadow-xs">
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-slate-800"
            aria-hidden="true"
          >
            {/* Clipboard board */}
            <rect x="5.5" y="4.5" width="17" height="19.5" rx="3.5" fill="#1e293b" />
            {/* Top clip */}
            <rect x="9" y="3" width="10" height="3.5" rx="1.75" fill="#475569" />
            <rect x="11" y="4" width="6" height="1.5" rx="0.75" fill="#94a3b8" />
            {/* Document lines */}
            <line x1="9" y1="10.5" x2="16" y2="10.5" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="9" y1="14" x2="14" y2="14" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
            {/* Badge checkmark */}
            <circle cx="18.5" cy="19.5" r="4" fill="#2563eb" stroke="#1e293b" strokeWidth="1.5" />
            <path
              d="M16.8 19.5L17.9 20.6L20.2 18.3"
              stroke="white"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Brand & Heading */}
      <div className="text-center mt-3">
        <h2 className="text-sm font-semibold text-slate-800 tracking-tight">
          Office Task & Approval System
        </h2>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-3">
          Create your account
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-[260px] mx-auto leading-relaxed">
          Create an account to get started with your workspace.
        </p>
      </div>

      {/* Feedback Alerts */}
      {apiError && (
        <div
          role="alert"
          className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2"
        >
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

      {successMessage && (
        <div
          role="status"
          className="mt-4 p-3 rounded-lg bg-green-50 border border-green-200 text-xs text-green-700 flex items-center gap-2"
        >
          <svg className="w-4 h-4 text-green-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span>{successMessage}</span>
        </div>
      )}

      {/* Signup Form */}
      <form onSubmit={handleSubmit} className="mt-5 space-y-3.5" noValidate>
        {/* Full Name */}
        <div>
          <label htmlFor="signup-fullname" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Full Name
          </label>
          <input
            id="signup-fullname"
            type="text"
            autoComplete="name"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (fieldErrors.fullName) {
                setFieldErrors((prev) => ({ ...prev, fullName: undefined }));
              }
            }}
            placeholder="Enter your full name"
            className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors ${
              fieldErrors.fullName
                ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                : "border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
            }`}
          />
          {fieldErrors.fullName && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.fullName}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="signup-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Email
          </label>
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldErrors.email) {
                setFieldErrors((prev) => ({ ...prev, email: undefined }));
              }
            }}
            placeholder="Enter your email"
            className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors ${
              fieldErrors.email
                ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                : "border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
            }`}
          />
          {fieldErrors.email && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="signup-password" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) {
                  setFieldErrors((prev) => ({ ...prev, password: undefined }));
                }
              }}
              placeholder="Create a password"
              className={`w-full pl-3.5 pr-10 py-2.5 text-sm bg-white border rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors ${
                fieldErrors.password
                  ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                  : "border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
            >
              {showPassword ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.75}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                  />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.75}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.75}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          </div>
          {fieldErrors.password ? (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
          ) : (
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500">
              <span
                className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                  isPasswordValidLength
                    ? "border-green-600 bg-green-50 text-green-600"
                    : "border-slate-300"
                }`}
              >
                {isPasswordValidLength && (
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>
              <span className={isPasswordValidLength ? "text-green-700 font-medium" : "text-slate-500"}>
                Password must contain at least 8 characters.
              </span>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="signup-confirm-password" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="signup-confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (fieldErrors.confirmPassword) {
                  setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                }
              }}
              placeholder="Confirm your password"
              className={`w-full pl-3.5 pr-10 py-2.5 text-sm bg-white border rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors ${
                fieldErrors.confirmPassword
                  ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                  : "border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
            >
              {showConfirmPassword ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.75}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                  />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.75}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.75}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          </div>
          {fieldErrors.confirmPassword && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.confirmPassword}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          id="signup-submit-button"
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm rounded-lg shadow-sm hover:shadow transition duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer pt-2.5 pb-2.5 mt-3"
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Creating Account...</span>
            </>
          ) : (
            <span>Create Account</span>
          )}
        </button>
      </form>

      {/* Switch to Sign In Link */}
      <div className="text-center mt-5">
        <p className="text-xs text-slate-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>

      {/* Bottom Disclaimer */}
      <div className="mt-6 pt-4 border-t border-slate-100 text-center">
        <p className="text-[11px] text-slate-400">
          Account requests are subject to internal organizational review.
        </p>
      </div>
    </div>
  );
}


