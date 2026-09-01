"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import type { FieldValues } from "react-hook-form";
import { forgotPassword } from "@/actions/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema } from "@/lib/validation/forgotPassword";
import { CheckCircle } from "lucide-react";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

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
    <FieldGroup>
      {errors.root && (
        <FieldError className="mb-4 text-sm text-black bg-[#ef767a] p-3 rounded">
          {errors.root.message}
        </FieldError>
      )}

      <form
        onSubmit={handleSubmit(forgetPasswordHandler)}
        className="space-y-4"
      >
        <FieldGroup>
          <Field data-invalid={!!errors.email}>
            <div className="w-fit">
              <FieldLabel htmlFor="email">Email</FieldLabel>
            </div>
            <input
              id="email"
              {...register("email")}
              type="email"
              className="w-full outline-0 border border-input shadow-sm rounded-lg px-3 py-2 text-sm focus:outline-3 focus:border-muted transition-all duration-150"
              onFocus={() => setShowSuccess(false)}
            />
            {errors.email && <FieldError>{errors.email.message}</FieldError>}
          </Field>
          <Field>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-black outline-0 text-white py-2 rounded-lg text-sm font-medium hover:tracking-[0.5px] transition-all duration-150 focus:outline-4 focus:border-muted disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Sending..." : "Send reset link"}
            </button>
          </Field>
        </FieldGroup>
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
    </FieldGroup>
  );
}
