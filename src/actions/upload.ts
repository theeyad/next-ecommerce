import { createClient } from "@/lib/supabase/client";
import { generateUniqueId } from "@/lib/utils";

export async function uploadStorageImage(
  file: File,
  bucket: string,
  folder: string,
) {
  const supabase = createClient();
  const fileExt = file.name.split(".").pop();

  // Generate unique filename to avoid storage path collisions
  const fileName = `${generateUniqueId(Date.now().toString())}.${fileExt}`;
  const filePath = `${folder}/${fileName}`;

  const { error } = await supabase.storage.from(bucket).upload(filePath, file);
  if (error) return { error: error.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(filePath);

  return { publicUrl };
}
