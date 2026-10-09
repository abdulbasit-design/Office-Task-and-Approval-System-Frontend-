"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, CheckCircle, CircleNotch, Eye, EyeSlash, WarningCircle } from "@phosphor-icons/react";
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
    <div>
      <h1 className="font-display text-[30px] leading-tight text-ink">Create your account</h1>
      <p className="mt-1.5 text-[15px] text-ink-2">Get started with your workspace.</p>

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
          <label htmlFor="signup-fullname" className="field-label">
            Full name
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
            aria-invalid={!!fieldErrors.fullName}
            aria-describedby={fieldErrors.fullName ? "signup-fullname-error" : undefined}
            className="input"
          />
          {fieldErrors.fullName && (
            <p id="signup-fullname-error" className="field-error">
              {fieldErrors.fullName}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="signup-email" className="field-label">
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
            placeholder="name@company.com"
            aria-invalid={!!fieldErrors.email}
            aria-describedby={fieldErrors.email ? "signup-email-error" : undefined}
            className="input"
          />
          {fieldErrors.email && (
            <p id="signup-email-error" className="field-error">
              {fieldErrors.email}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="signup-password" className="field-label">
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
              aria-invalid={!!fieldErrors.password}
              aria-describedby={fieldErrors.password ? "signup-password-error" : "signup-password-hint"}
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
          {fieldErrors.password ? (
            <p id="signup-password-error" className="field-error">
              {fieldErrors.password}
            </p>
          ) : (
            <p
              id="signup-password-hint"
              className={`field-hint flex items-center gap-1.5 ${isPasswordValidLength ? "text-ok" : ""}`}
            >
              <Check
                size={14}
                weight="bold"
                aria-hidden="true"
                className={isPasswordValidLength ? "" : "opacity-30"}
              />
              Password must contain at least 8 characters.
            </p>
          )}
        </div>

        <div>
          <label htmlFor="signup-confirm-password" className="field-label">
            Confirm password
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
              aria-invalid={!!fieldErrors.confirmPassword}
              aria-describedby={fieldErrors.confirmPassword ? "signup-confirm-password-error" : undefined}
              className="input pr-11"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-sm text-ink-3 transition-colors hover:text-ink"
            >
              {showConfirmPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {fieldErrors.confirmPassword && (
            <p id="signup-confirm-password-error" className="field-error">
              {fieldErrors.confirmPassword}
            </p>
          )}
        </div>

        <button id="signup-submit-button" type="submit" disabled={isLoading} className="btn btn-primary w-full min-h-11 text-[15px]">
          {isLoading ? (
            <>
              <CircleNotch size={16} className="animate-spin" aria-hidden="true" />
              <span>Creating account...</span>
            </>
          ) : (
            <span>Create account</span>
          )}
        </button>
      </form>

      <p className="mt-6 border-t border-line pt-5 text-center text-[14px] text-ink-2">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-note-ink hover:underline">
          Sign in
        </Link>
      </p>
      <p className="mt-3 text-center text-[13px] text-ink-3">
        Account requests are subject to internal organizational review.
      </p>
    </div>
  );
}
