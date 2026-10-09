import type { Metadata } from "next";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Reset your password | Countersign",
  description: "Request an administrator-managed password reset for your account.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
