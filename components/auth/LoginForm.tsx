"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { CheckCircle, CircleNotch, Eye, EyeSlash, WarningCircle } from "@phosphor-icons/react";
import { useLoginMutation } from "@/lib/api/authApi";
import { setAccessToken } from "@/lib/slices/authSlice";
import { apiSlice } from "@/lib/api/apiSlice";

export default function LoginForm() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const validate = () => {
    const errors: { email?: string; password?: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(email.trim())) {
      errors.email = "Please enter a valid email address";
    }

    if (!password) {
      errors.password = "Password is required";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setSuccessMessage(null);

    if (!validate()) return;

    try {
      const response = await login({
        email: email.trim(),
        password,
      }).unwrap();

      if (response.access_token) {
        // Reset all RTK Query cache so stale user data (from another account) cannot survive
        dispatch(apiSlice.util.resetApiState());
        // Store the access token in Redux state only (never in localStorage
        // or sessionStorage). The refresh_token is already in the HttpOnly
        // cookie set by the backend — JS cannot read or write it.
        dispatch(setAccessToken(response.access_token));
      }

      setSuccessMessage("Sign in successful! Redirecting...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1200);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "data" in err) {
        const errorData = (err as { data: { detail?: string | Array<{ msg: string }> } }).data;
        if (typeof errorData?.detail === "string") {
          setApiError(errorData.detail);
        } else if (Array.isArray(errorData?.detail)) {
          setApiError(errorData.detail.map((d) => d.msg).join(", "));
        } else {
          setApiError("Invalid email or password.");
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
      <h1 className="font-display text-[30px] leading-tight text-ink">Sign in</h1>
      <p className="mt-1.5 text-[15px] text-ink-2">Access your workspace and your tasks.</p>

      {apiError && (
        <div role="alert" className="mt-6 flex items-start gap-2.5 rounded-sm border border-serial/50 bg-serial-tint p-3 text-[14px] text-ink">
          <WarningCircle size={18} className="mt-0.5 shrink-0 text-serial" aria-hidden="true" />
          <span>{apiError}</span>
        </div>
      )}

      {successMessage && (
        <div role="status" className="mt-6 flex items-start gap-2.5 rounded-sm border border-ok/40 bg-ok-tint p-3 text-[14px] text-ok">
          <CheckCircle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
        <div>
          <label htmlFor="login-email" className="field-label">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
            }}
            placeholder="name@company.com"
            aria-invalid={!!fieldErrors.email}
            aria-describedby={fieldErrors.email ? "login-email-error" : undefined}
            className="input"
          />
          {fieldErrors.email && (
            <p id="login-email-error" className="field-error">
              {fieldErrors.email}
            </p>
          )}
        </div>

        <div>
          <div className="mb-1.5 flex items-baseline justify-between gap-3">
            <label htmlFor="login-password" className="field-label mb-0">
              Password
            </label>
            <Link href="/forgot-password" className="text-[13px] font-semibold text-note-ink hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
              }}
              aria-invalid={!!fieldErrors.password}
              aria-describedby={fieldErrors.password ? "login-password-error" : undefined}
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
          {fieldErrors.password && (
            <p id="login-password-error" className="field-error">
              {fieldErrors.password}
            </p>
          )}
        </div>

        <button id="login-submit-button" type="submit" disabled={isLoading} className="btn btn-primary w-full min-h-11 text-[15px]">
          {isLoading ? (
            <>
              <CircleNotch size={16} className="animate-spin" aria-hidden="true" />
              <span>Signing in...</span>
            </>
          ) : (
            <span>Sign in</span>
          )}
        </button>
      </form>

      <p className="mt-6 border-t border-line pt-5 text-center text-[14px] text-ink-2">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-semibold text-note-ink hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
