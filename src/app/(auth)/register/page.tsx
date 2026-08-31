import Link from "next/link";
import type { Metadata } from "next";
import SignupForm from "@/app/(auth)/register/signupForm";
import { GlowingEffect } from "@saasflare/ui";

export const metadata: Metadata = {
  title: "Cartify | Register Page",
  description: "Signup for an account",
};

export default function RegisterPage() {
  return (
    <div className="relative overflow-hidden border bg-[#568EA3] w-full mx-4 max-w-md rounded-xl p-8">
      <GlowingEffect color="black" spread={150} blur={0} opacity={1} />

      <h1 className="text-2xl font-bold mb-6 text-center">Create Account</h1>

      <SignupForm />

      <p className="mt-6 text-center text-sm text-[#1d1e22]">
        Already have an account?{" "}
        <Link href="/login" className="text-black font-medium">
          Login
        </Link>
      </p>
    </div>
  );
}
