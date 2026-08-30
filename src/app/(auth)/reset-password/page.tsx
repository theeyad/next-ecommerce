import { Metadata } from "next";
import ResetPasswordForm from "@/app/(auth)/reset-password/resetPasswordForm";

export const metadata: Metadata = {
  title: "Cartify | Reset Password Page",
  description: "Set a new password for your account.",
};

export default function ResetPasswordPage() {
  return (
    <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8">
      <h1 className="text-2xl font-bold mb-2">Set new password</h1>
      <p className="text-sm text-gray-500 mb-6">
        Enter your new password below.
      </p>

      <ResetPasswordForm />
    </div>
  );
}
