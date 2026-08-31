import Link from "next/link";
import { Metadata } from "next";
import ForgotPasswordForm from "@/app/(auth)/forgot-password/forgotPasswordForm";
import { GlowingEffect } from "@saasflare/ui";

export const metadata: Metadata = {
  title: "Cartify | Forgot Password Page",
  description:
    "Forgot your password? Enter your email address and we'll send you a reset link.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="relative overflow-hidden border bg-[#568EA3] w-full mx-4 max-w-md rounded-xl p-8">
      <GlowingEffect color="black" spread={150} blur={0} opacity={1} />

      <h1 className="text-2xl font-bold mb-2">Forgot password?</h1>
      <p className="text-sm text-[#1d1e22] mb-6">
        Enter your email and we'll send you a reset link.
      </p>

      <ForgotPasswordForm />

      <p className="mt-6 text-center text-sm text-[#1d1e22]">
        <Link href="/login" className="text-black font-medium">
          Back to login
        </Link>
      </p>
    </div>
  );
}
