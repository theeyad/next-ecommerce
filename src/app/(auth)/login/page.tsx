"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn, signInWithGoogle } from "@/actions/auth";
import { useForm } from "react-hook-form";
import type { FieldValues } from "react-hook-form";
import { loginSchema } from "@/lib/validation/login";
import { zodResolver } from "@hookform/resolvers/zod";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  async function formSubmitHandler(values: FieldValues) {
    setLoading(true);
    const result = await signIn(values);
    if (result?.error) {
      setError("root", {
        message: result.error,
      });
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    const result = await signInWithGoogle();
    if (result?.error) {
      setError("root", {
        message: result.error,
      });
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>

      {errors.root && (
        <p className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">
          {errors.root.message}
        </p>
      )}

      <form onSubmit={handleSubmit(formSubmitHandler)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            {...register("email")}
            type="email"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            {...register("password")}
            type="password"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={isSubmitting || loading}
          className="w-full bg-black text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting || loading ? "Please wait..." : "Login"}
        </button>
      </form>

      <div className="my-4 flex items-center gap-2">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400">or</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <button
        onClick={handleGoogle}
        disabled={loading}
        className="w-full border py-2 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continue with Google
      </button>

      <p className="mt-6 text-center text-sm text-gray-500">
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
