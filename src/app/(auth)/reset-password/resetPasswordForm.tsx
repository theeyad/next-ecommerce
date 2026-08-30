"use client";

import { useState } from "react";
import { resetPassword } from "@/actions/auth";
import { useForm } from "react-hook-form";
import type { FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema } from "@/lib/validation/resetPassword";

export default function ResetPasswordForm() {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
    },
  });

  async function resetPasswordHandler(values: FieldValues) {
    setLoading(true);
    const result = await resetPassword(values);
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
        <p className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">
          {errors.root.message}
        </p>
      )}

      <form onSubmit={handleSubmit(resetPasswordHandler)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">New Password</label>
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
          className="w-full bg-black text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting || loading ? "Updating..." : "Update password"}
        </button>
      </form>
    </>
  );
}
