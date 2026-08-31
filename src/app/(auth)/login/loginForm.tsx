// As in signup, I will be using RHF isSubmitting to get
// used to it but I must use useState here cause of redirect() in
// actions (auth.ts).

"use client";

import { useState } from "react";
import { signIn, signInWithGoogle } from "@/actions/auth";
import { useForm } from "react-hook-form";
import type { FieldValues } from "react-hook-form";
import { loginSchema } from "@/lib/validation/login";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";

export default function LoginForm() {
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
    <>
      {errors.root && (
        <p className="mb-4 text-sm text-black bg-[#ef767a] p-3 rounded">
          {errors.root.message}
        </p>
      )}

      <form onSubmit={handleSubmit(formSubmitHandler)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            {...register("email")}
            type="email"
            className="w-full border border-white/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors duration-300"
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
            className="w-full border border-white/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors duration-300"
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
          className="w-full bg-black border border-black text-white py-2 rounded-lg text-sm font-medium hover:tracking-[0.5px] transition-all duration-300 focus:outline-none focus:border-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting || loading ? "Please wait..." : "Login"}
        </button>
      </form>

      <div className="my-4 flex items-center gap-2">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-[#1d1e22]">or</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <button
        onClick={handleGoogle}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 border border-white/50 py-2 rounded-lg text-sm font-medium hover:tracking-[0.5px] hover:bg-[#507994] transition-all duration-300 focus:outline-none focus:border-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Image width={15} height={15} src="/google.svg" alt="google" />
        Continue with Google
      </button>
    </>
  );
}
