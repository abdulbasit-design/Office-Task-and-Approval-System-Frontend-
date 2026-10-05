import type { Metadata } from "next";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot Password | Office Task & Approval System",
  description: "Request an administrator-managed password reset for your corporate account.",
};

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6">
      <ForgotPasswordForm />
    </main>
  );
}
