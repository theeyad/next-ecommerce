"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { FieldValues } from "react-hook-form";
import { getStoragePathFromUrl } from "@/lib/utils";

export async function createCategory(values: FieldValues) {
  const supabase = await createClient();

  const { error } = await supabase.from("categories").insert({
    name: values.cat_name,
    slug: values.cat_name.toLowerCase().replace(/\s+/g, "-"),
    description: values.cat_desc,
    image_url: values.cat_img,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/categories");
  return { success: true };
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();

  // 1. Fetch category image_url first
  const { data: category } = await supabase
    .from("categories")
    .select("image_url")
    .eq("id", id)
    .single();

  // 2. Delete database record
  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) return { error: error.message };

  // 3. Clean up storage file if it exists
  if (category?.image_url) {
    const filePath = getStoragePathFromUrl(category.image_url, "catalog");
    if (filePath) {
      await supabase.storage.from("catalog").remove([filePath]);
    }
  }

  revalidatePath("/admin/categories");
  return { success: true };
}

export async function updateCategory(id: string, values: FieldValues) {
  const supabase = await createClient();

  // 1. Fetch existing category image_url
  const { data: existingCategory } = await supabase
    .from("categories")
    .select("image_url")
    .eq("id", id)
    .single();

  // 2. Update database record
  const { error } = await supabase
    .from("categories")
    .update({
      name: values.cat_name,
      slug: values.cat_name.toLowerCase().replace(/\s+/g, "-"),
      description: values.cat_desc,
      image_url: values.cat_img,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  // 3. If image was updated/changed, remove the OLD image from storage
  if (
    existingCategory?.image_url &&
    existingCategory.image_url !== values.cat_img
  ) {
    const oldFilePath = getStoragePathFromUrl(
      existingCategory.image_url,
      "catalog"
    );
    if (oldFilePath) {
      await supabase.storage.from("catalog").remove([oldFilePath]);
    }
  }

  revalidatePath("/admin/categories");
  return { success: true };
}
