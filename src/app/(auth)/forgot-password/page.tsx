import Link from "next/link";
import { Metadata } from "next";
import ForgotPasswordForm from "@/app/(auth)/forgot-password/forgotPasswordForm"

export const metadata: Metadata = {
  title: "Cartify | Forgot Password Page",
  description:
    "Forgot your password? Enter your email address and we'll send you a reset link.",
};

export default function ForgotPasswordPage() {

  return (
    <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8">
      <h1 className="text-2xl font-bold mb-2">Forgot password?</h1>
      <p className="text-sm text-gray-500 mb-6">
        Enter your email and we'll send you a reset link.
      </p>

      <ForgotPasswordForm />

      <p className="mt-6 text-center text-sm text-gray-500">
        <Link href="/login" className="text-black font-medium">
          Back to login
        </Link>
      </p>
    </div>
  );
}
