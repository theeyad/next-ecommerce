import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import EditProductForm from "@/app/admin/products/edit/[slug]/EditProductForm";
import { productsType } from "@/lib/validation/types";

interface AdminEditProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function AdminEditProductPage({
  params,
}: AdminEditProductPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select(`
      *,
      product_images ( id, url, position, is_primary )
    `)
    .eq("slug", slug)
    .single();

  if (!product) {
    notFound();
  }

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  return (
    <>
      <h2 className="text-xl mb-6">Edit Product Page</h2>
      <EditProductForm
        product={product as productsType}
        categories={categories || []}
      />
    </>
  );
}
