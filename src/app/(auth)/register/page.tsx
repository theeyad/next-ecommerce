import Link from "next/link";
import type { Metadata } from "next";
import SignupForm from "@/app/(auth)/register/signupForm";

export const metadata: Metadata = {
  title: "Baskify | Register Page",
  description: "Signup for an account",
};

export default function RegisterPage() {
  return (
    <div className="relative overflow-hidden border bg-card shadow-md w-full mx-4 my-8 max-w-md rounded-xl p-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Create Account</h1>

      <SignupForm />

      <p className="mt-6 text-center text-sm text-primary">
        Already have an account?{" "}
        <Link href="/login" className="text-foreground font-medium">
          Login
        </Link>
      </p>
    </div>
  );
}
