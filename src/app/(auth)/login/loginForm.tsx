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
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";

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
    <FieldGroup>
      {errors.root && (
        <FieldError className="mb-4 text-sm text-black bg-[#ef767a] p-3 rounded">
          {errors.root.message}
        </FieldError>
      )}

      <form onSubmit={handleSubmit(formSubmitHandler)} className="space-y-4">
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
            />
            {errors.email && <FieldError>{errors.email.message}</FieldError>}
          </Field>

          <Field data-invalid={!!errors.password}>
            <div className="w-fit">
              <FieldLabel htmlFor="password">Password</FieldLabel>
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
              {isSubmitting || loading ? "Please wait..." : "Login"}
            </button>
          </Field>
        </FieldGroup>
      </form>

      <FieldSeparator></FieldSeparator>

      <Field>
        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full outline-0 flex items-center justify-center gap-3 border border-input shadow-sm py-2 rounded-lg text-sm font-medium hover:tracking-[0.5px] transition-tracking duration-150 focus:outline-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Image width={15} height={15} src="/google.svg" alt="google" />
          Continue with Google
        </button>
      </Field>
    </FieldGroup>
  );
}
