"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { FieldValues } from "react-hook-form";
import { getStoragePathFromUrl } from "@/lib/utils";

// Categories

export async function createCategory(values: FieldValues) {
  const supabase = await createClient();

  const { error } = await supabase.from("categories").insert({
    name: values.cat_name,
    slug: values.cat_name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, ""),
    description: values.cat_desc,
    image_url: values.cat_img,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/categories");
  revalidatePath("/categories");
  revalidatePath("/");
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
  revalidatePath("/categories");
  revalidatePath("/");
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
      slug: values.cat_name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, ""),
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
      "catalog",
    );
    if (oldFilePath) {
      await supabase.storage.from("catalog").remove([oldFilePath]);
    }
  }

  revalidatePath("/admin/categories");
  revalidatePath("/categories");
  revalidatePath("/");
  return { success: true };
}

// Products

export async function createProduct(values: FieldValues) {
  const supabase = await createClient();

  // 1. Insert product record
  const { data: product, error: productError } = await supabase
    .from("products")
    .insert({
      name: values.name,
      slug: values.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, ""),
      description: values.description,
      price: values.price,
      compare_at_price: values.compare_at_price || null,
      category_id: values.category_id,
      stock_quantity: values.stock_quantity,
      is_active: values.is_active ?? true,
    })
    .select()
    .single();

  if (productError || !product) {
    return { error: productError?.message || "Failed to create product" };
  }

  // 2. Insert product images
  if (values.images && values.images.length > 0) {
    const imageRecords = values.images.map(
      (img: { url: string; is_primary?: boolean }, index: number) => ({
        product_id: product.id,
        url: img.url,
        position: index,
        is_primary: img.is_primary ?? index === 0,
      }),
    );

    const { error: imagesError } = await supabase
      .from("product_images")
      .insert(imageRecords);

    if (imagesError) {
      return { error: imagesError.message };
    }
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/categories");
  revalidatePath("/");
  return { success: true };
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();

  // 1. Fetch associated product_images to get storage URLs
  const { data: images } = await supabase
    .from("product_images")
    .select("url")
    .eq("product_id", id);

  // 2. Delete product record (FK cascade removes product_images rows)
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) return { error: error.message };

  // 3. Purge image files from storage bucket
  if (images && images.length > 0) {
    const filePaths = images
      .map((img) => getStoragePathFromUrl(img.url, "catalog"))
      .filter(Boolean) as string[];

    if (filePaths.length > 0) {
      await supabase.storage.from("catalog").remove(filePaths);
    }
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/categories");
  revalidatePath("/");
  return { success: true };
}

export async function updateProduct(id: string, values: FieldValues) {
  const supabase = await createClient();

  // 1. Fetch existing product_images to track old storage files
  const { data: existingImages } = await supabase
    .from("product_images")
    .select("url")
    .eq("product_id", id);

  // 2. Update product row
  const { error: productError } = await supabase
    .from("products")
    .update({
      name: values.name,
      slug: values.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, ""),
      description: values.description,
      price: values.price,
      compare_at_price: values.compare_at_price || null,
      category_id: values.category_id,
      stock_quantity: values.stock_quantity,
      is_active: values.is_active ?? true,
    })
    .eq("id", id);

  if (productError) return { error: productError.message };

  // 3. Sync product images: Delete existing rows and insert updated rows
  const newImageUrls = (values.images || []).map(
    (img: { url: string }) => img.url,
  );

  await supabase.from("product_images").delete().eq("product_id", id);

  if (values.images && values.images.length > 0) {
    const imageRecords = values.images.map(
      (img: { url: string; is_primary?: boolean }, index: number) => ({
        product_id: id,
        url: img.url,
        position: index,
        is_primary: img.is_primary ?? index === 0,
      }),
    );

    const { error: insertImgError } = await supabase
      .from("product_images")
      .insert(imageRecords);

    if (insertImgError) return { error: insertImgError.message };
  }

  // 4. Clean up removed storage files
  if (existingImages && existingImages.length > 0) {
    const removedFilePaths = existingImages
      .filter((oldImg) => !newImageUrls.includes(oldImg.url))
      .map((oldImg) => getStoragePathFromUrl(oldImg.url, "catalog"))
      .filter(Boolean) as string[];

    if (removedFilePaths.length > 0) {
      await supabase.storage.from("catalog").remove(removedFilePaths);
    }
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/categories");
  revalidatePath("/");
  return { success: true };
}
