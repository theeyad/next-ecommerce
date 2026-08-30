import Link from "next/link";
import type { Metadata } from "next";
import SignupForm from "@/app/(auth)/register/signupForm";

export const metadata: Metadata = {
  title: "Cartify | Register Page",
  description: "Signup for an account",
};


export default function RegisterPage() {

  return (
    <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Create Account</h1>

      <SignupForm />

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="text-black font-medium">
          Login
        </Link>
      </p>
    </div>
  );
}
