"use server";

import { createClient } from "@/lib/supabase/server";
import type { FieldValues } from "react-hook-form";

export async function createCategory(values: FieldValues) {
  const supabase = await createClient();

  const { error } = await supabase.from("categories").insert({
    name: values.cat_name,
    slug: values.cat_name.toLowerCase().replace(/\s+/g, "-"),
    description: values.cat_desc,
    image_url: values.cat_img,
  });

  if (error) return { error: error.message };

  return { success: true };
}
