import type { Metadata } from "next";
import SignupForm from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Create Account | Office Task & Approval System",
  description: "Create an account to get started with your workspace.",
};

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6">
      <SignupForm />
    </main>
  );
}
