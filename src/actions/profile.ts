"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { FieldValues } from "react-hook-form";
import { getStoragePathFromUrl } from "@/lib/utils";

export async function updateProfile(values: FieldValues) {
  const supabase = await createClient();

  // 1. Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  // 2. Fetch existing profile to track old avatar file
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", user.id)
    .single();

  // 3. Update profile row
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      full_name: values.full_name,
      avatar_url: values.avatar_url || null,
      phone: values.phone || null,
      address_line1: values.address_line1 || null,
      city: values.city || null,
      postal_code: values.postal_code || null,
      country: values.country || null,
    })
    .eq("id", user.id);

  if (updateError) {
    return { error: updateError.message };
  }

  // 4. Storage cleanup: If avatar changed, delete old file from 'profiles' bucket
  if (
    existingProfile?.avatar_url &&
    existingProfile.avatar_url !== values.avatar_url
  ) {
    const oldFilePath = getStoragePathFromUrl(
      existingProfile.avatar_url,
      "profiles",
    );
    if (oldFilePath) {
      await supabase.storage.from("profiles").remove([oldFilePath]);
    }
  }

  revalidatePath("/profile");
  revalidatePath("/profile/edit");
  revalidatePath("/admin/profile");
  revalidatePath("/admin/profile/edit");
  revalidatePath("/admin", "layout");
  revalidatePath("/admin");
  revalidatePath("/");

  return { success: true };
}
