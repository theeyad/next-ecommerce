import Link from "next/link";
import type { Metadata } from "next";
import LoginForm from "@/app/(auth)/login/loginForm";
import { GlowingEffect } from "@saasflare/ui";

export const metadata: Metadata = {
  title: "Cartify | Login Page",
  description: "Login to your account",
};

export default function LoginPage() {
  return (
    <div className="relative overflow-hidden border bg-[#568EA3] w-full mx-4 max-w-md rounded-xl p-8">
      <GlowingEffect color="black" spread={150} blur={0} opacity={1} />
      <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>

      <LoginForm />

      <p className="mt-6 text-center text-sm text-[#1d1e22]">
        No account?{" "}
        <Link href="/register" className="text-black font-medium">
          Register
        </Link>
      </p>
      <Link
        href="/forgot-password"
        className="w-fit mx-auto mt-3 block text-center text-sm text-black font-medium"
      >
        Forgot password?
      </Link>
    </div>
  );
}
