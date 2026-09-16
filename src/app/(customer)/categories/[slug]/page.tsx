import Link from "next/link";
import Image from "next/image";
import { createStaticClient } from "@/lib/supabase/static";
import { notFound } from "next/navigation";
import { productsType } from "@/lib/validation/types";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";

interface CategoryProductsPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateStaticParams() {
  const supabase = createStaticClient();
  const { data: categories } = await supabase.from("categories").select("slug");
  return (categories || []).map((cat) => ({ slug: cat.slug }));
}

export default async function CategoryProductsPage({
  params,
}: CategoryProductsPageProps) {
  const { slug } = await params;
  const supabase = createStaticClient();

  // Fetch Category
  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!category) {
    notFound();
  }

  // Fetch Products in this category
  const { data: products } = await supabase
    .from("products")
    .select(`
      *,
      categories ( name ),
      product_images ( id, url, position, is_primary )
    `)
    .eq("category_id", category.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Category Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-border bg-sidebar p-8 sm:p-12">
        {category.image_url && (
          <div className="absolute inset-0 opacity-20">
            <Image
              src={category.image_url}
              alt={category.name}
              fill
              className="object-cover blur-sm"
            />
          </div>
        )}
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Category
          </span>
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-foreground tracking-tight">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {category.description}
            </p>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-heading font-bold text-foreground">
            Products ({products?.length || 0})
          </h2>
          <Link
            href="/products"
            className="text-xs font-semibold text-primary inline-flex items-center gap-1 cursor-default hover:border-2 hover:border-t-0 hover:p-0.5 hover:border-primary hover:rounded-xs transition-all duration-100"
          >
            <span>Browse All Products</span>
          </Link>
        </div>

        {products && products.length > 0 ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(280px,100%),1fr))] gap-6">
            {products.map((product: productsType) => {
              const primaryImg =
                product.product_images?.find((img) => img.is_primary)?.url ||
                product.product_images?.[0]?.url;

              return (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="cursor-default"
                >
                  <div className="group relative flex flex-col justify-between bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div>
                      {/* Image Container */}
                      <div className="relative w-full h-56 bg-muted overflow-hidden">
                        {primaryImg ? (
                          <Image
                            src={primaryImg}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                            No Image
                          </div>
                        )}

                        {/* Stock Badge */}
                        <span
                          className={`absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full shadow ${
                            product.stock_quantity > 0
                              ? "bg-emerald-500/90 text-white"
                              : "bg-red-500/90 text-white"
                          }`}
                        >
                          {product.stock_quantity > 0
                            ? "In Stock"
                            : "Out of Stock"}
                        </span>
                      </div>

                      {/* Content Details */}
                      <div className="px-5 py-3 space-y-2">
                        <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">
                          {product.categories?.name || category.name}
                        </span>
                        <h3 className="font-heading font-bold text-foreground text-base line-clamp-1 group-hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {product.description}
                        </p>
                      </div>
                    </div>

                    {/* Price & Add to Cart Footer */}
                    <div className="px-5 py-4 flex items-center justify-between gap-2 border-t border-border/40 mt-2">
                      <div>
                        <div className="text-base font-bold text-foreground">
                          {formatCurrency(product.price)}
                        </div>
                        {product.compare_at_price && (
                          <div className="text-xs text-muted-foreground line-through">
                            {formatCurrency(product.compare_at_price)}
                          </div>
                        )}
                      </div>

                      <Button
                        size="sm"
                        className="gap-1.5 rounded-xl cursor-default"
                        disabled={product.stock_quantity <= 0}
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>Add</span>
                      </Button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center bg-sidebar rounded-2xl border border-dashed border-border text-sm text-muted-foreground">
            No products found in this category yet.
          </div>
        )}
      </div>
    </div>
  );
}
