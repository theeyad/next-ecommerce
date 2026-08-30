"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import type { FieldValues } from "react-hook-form";
import { forgotPassword } from "@/actions/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema } from "@/lib/validation/forgotPassword";
import { CheckCircle } from "lucide-react";

export default function ForgotPasswordForm() {
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function forgetPasswordHandler(values: FieldValues) {
    const result = await forgotPassword(values);
    if (result?.error) {
      setError("root", {
        message: result.error,
      });
    } else {
      setShowSuccess(result.success!); // should be true
    }
    reset();
  }

  return (
    <>
      {errors.root && (
        <p className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">
          {errors.root.message}
        </p>
      )}

      <form
        onSubmit={handleSubmit(forgetPasswordHandler)}
        className="space-y-4"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            {...register("email")}
            type="email"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            onFocus={() => setShowSuccess(false)}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-black text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Sending..." : "Send reset link"}
        </button>
      </form>

      {showSuccess && (
        <div className="w-full max-w-md mt-4 bg-[#defcdb] rounded-xl shadow-md p-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <p className="text-sm text-gray-500 m-0">
              Please check your inbox or spam folder.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
