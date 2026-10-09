import type { Metadata } from "next";
import SignupForm from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Create your account | Countersign",
  description: "Create an account to get started with your workspace.",
};

export default function SignupPage() {
  return <SignupForm />;
}
