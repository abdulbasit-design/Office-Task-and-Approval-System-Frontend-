import type { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign In | Office Task & Approval System",
  description: "Sign in to access your workspace and manage your tasks.",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6">
      <LoginForm />
    </main>
  );
}
