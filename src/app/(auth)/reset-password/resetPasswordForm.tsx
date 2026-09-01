"use client";

import { useState } from "react";
import { resetPassword } from "@/actions/auth";
import { useForm } from "react-hook-form";
import type { FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema } from "@/lib/validation/resetPassword";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

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
    <FieldGroup>
      {errors.root && (
        <FieldError className="mb-4 text-sm text-black bg-[#ef767a] p-3 rounded">
          {errors.root.message}
        </FieldError>
      )}

      <form onSubmit={handleSubmit(resetPasswordHandler)} className="space-y-4">
        <FieldGroup>
          <Field data-invalid={!!errors.password}>
            <div className="w-fit">
              <FieldLabel htmlFor="password">New Password</FieldLabel>
            </div>
            <input
              id="password"
              {...register("password")}
              type="password"
              className="w-full outline-0 border border-input shadow-sm rounded-lg px-3 py-2 text-sm focus:outline-3 focus:border-muted transition-all duration-150"
            />
            {errors.password && (
              <FieldError>{errors.password.message}</FieldError>
            )}
          </Field>
          <Field>
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full bg-black outline-0 text-white py-2 rounded-lg text-sm font-medium hover:tracking-[0.5px] transition-all duration-150 focus:outline-4 focus:border-muted disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting || loading ? "Updating..." : "Update password"}
            </button>
          </Field>
        </FieldGroup>
      </form>
    </FieldGroup>
  );
}
