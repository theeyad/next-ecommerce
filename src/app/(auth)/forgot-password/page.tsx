"use client";

import { useState } from "react";
import Link from "next/link";
import { forgotPassword } from "@/actions/auth";

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await forgotPassword(formData);
    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  }

  if (success) {
    return (
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Check your email</h1>
        <p className="text-sm text-gray-500 mb-6">
          We sent a password reset link to your email address. Please check your
          inbox, it also may be in spam or junk so check them too.
        </p>
        <Link href="/login" className="text-black font-medium text-sm">
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8">
      <h1 className="text-2xl font-bold mb-2">Forgot password?</h1>
      <p className="text-sm text-gray-500 mb-6">
        Enter your email and we'll send you a reset link.
      </p>

      {error && (
        <p className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">
          {error}
        </p>
      )}

      <form action={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            name="email"
            type="email"
            required
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send reset link"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        <Link href="/login" className="text-black font-medium hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  );
}
