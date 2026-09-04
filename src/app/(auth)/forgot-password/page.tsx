import Link from "next/link";
import { Metadata } from "next";
import ForgotPasswordForm from "@/app/(auth)/forgot-password/forgotPasswordForm";

export const metadata: Metadata = {
  title: "Baskify | Forgot Password Page",
  description:
    "Forgot your password? Enter your email address and we'll send you a reset link.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="relative overflow-hidden border bg-card shadow-md w-full mx-4 my-8 max-w-md rounded-xl p-8">
      <h1 className="text-2xl font-bold mb-2">Forgot password?</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Enter your email and we'll send you a reset link.
      </p>

      <ForgotPasswordForm />

      <p className="mt-6 text-center text-sm text-primary">
        <Link href="/login" className="text-foreground font-medium">
          Back to login
        </Link>
      </p>
    </div>
  );
}
