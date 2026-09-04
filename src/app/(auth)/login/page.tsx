import Link from "next/link";
import type { Metadata } from "next";
import LoginForm from "@/app/(auth)/login/loginForm";

export const metadata: Metadata = {
  title: "Baskify | Login Page",
  description: "Login to your account",
};

export default function LoginPage() {
  return (
    <div className="relative overflow-hidden border bg-card shadow-md w-full mx-4 my-8 max-w-md rounded-xl p-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>

      <LoginForm />

      <p className="mt-6 text-center text-sm text-primary">
        No account?{" "}
        <Link href="/register" className="text-foreground font-medium">
          Register
        </Link>
      </p>
      <Link
        href="/forgot-password"
        className="w-fit mx-auto mt-3 block text-center text-sm text-foreground font-medium"
      >
        Forgot password?
      </Link>
    </div>
  );
}
