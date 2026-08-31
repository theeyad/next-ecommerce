import { Metadata } from "next";
import ResetPasswordForm from "@/app/(auth)/reset-password/resetPasswordForm";
import { GlowingEffect } from "@saasflare/ui";

export const metadata: Metadata = {
  title: "Cartify | Reset Password Page",
  description: "Set a new password for your account.",
};

export default function ResetPasswordPage() {
  return (
    <div className="relative overflow-hidden border bg-[#568EA3] w-full mx-4 max-w-md rounded-xl p-8">
      <GlowingEffect color="black" spread={150} blur={0} opacity={1} />

      <h1 className="text-2xl font-bold mb-2">Set new password</h1>
      <p className="text-sm text-[#1d1e22] mb-6">
        Enter your new password below.
      </p>

      <ResetPasswordForm />
    </div>
  );
}
