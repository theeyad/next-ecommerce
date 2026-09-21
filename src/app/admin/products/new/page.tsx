import { createClient } from "@/lib/supabase/server";
import NewProductForm from "@/app/admin/products/new/NewProductForm";

export default async function AdminNewProductPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  return (
    <>
      <h2 className="text-xl mb-6">Add Product Page</h2>
      <NewProductForm categories={categories || []} />
    </>
  );
}
