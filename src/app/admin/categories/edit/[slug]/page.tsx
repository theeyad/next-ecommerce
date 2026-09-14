import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import EditCategoryForm from "./EditCategoryForm";

interface AdminEditCategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function AdminEditCategoryPage({
  params,
}: AdminEditCategoryPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!category) {
    notFound();
  }

  return (
    <>
      <h2 className="text-xl mb-6">Edit Category Page</h2>
      <EditCategoryForm category={category} />
    </>
  );
}
