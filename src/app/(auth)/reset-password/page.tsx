import { Metadata } from "next";
import ResetPasswordForm from "@/app/(auth)/reset-password/resetPasswordForm";

export const metadata: Metadata = {
  title: "Cartify | Reset Password Page",
  description: "Set a new password for your account.",
};

export default function ResetPasswordPage() {
  return (
    <div className="relative overflow-hidden border bg-card shadow-md w-full mx-4 my-8 max-w-md rounded-xl p-8">
      <h1 className="text-2xl font-bold mb-2">Set new password</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Enter your new password below.
      </p>

      <ResetPasswordForm />
    </div>
  );
}
