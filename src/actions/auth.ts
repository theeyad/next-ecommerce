"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { FieldValues } from "react-hook-form";

export async function signUp(values: FieldValues) {
  const supabase = await createClient();

  const email = values.email;
  const password = values.password;
  const fullName = values.full_name;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (error) return { error: error.message };

  redirect("/");
}

export async function signIn(values: FieldValues) {
  const supabase = await createClient();

  const email = values.email;
  const password = values.password;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: error.message };

  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function signInWithGoogle() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) return { error: error.message };

  if (data.url) redirect(data.url);
}

export async function forgotPassword(values: FieldValues) {
  const supabase = await createClient();
  const email = values.email;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
  });

  if (error) return { error: error.message };
  return { success: true };
}

export async function resetPassword(values: FieldValues) {
  const supabase = await createClient();
  const password = values.password;

  const { error } = await supabase.auth.updateUser({ password });

  if (error) return { error: error.message };

  redirect("/login");
}
