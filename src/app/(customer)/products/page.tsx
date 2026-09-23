import Link from "next/link";
import Image from "next/image";
import { createStaticClient } from "@/lib/supabase/static";
import { productsType } from "@/lib/validation/types";
import { formatCurrency } from "@/lib/utils";
import { SlidersHorizontal } from "lucide-react";
import { AddToCartButton } from "@/components/shared/AddToCartButton";

interface CustomerProductsPageProps {
  searchParams: Promise<{
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    q?: string;
  }>;
}

export default async function CustomerProductsPage({
  searchParams,
}: CustomerProductsPageProps) {
  const { category, minPrice, maxPrice, sort, q } = await searchParams;
  const supabase = createStaticClient();

  // Fetch Categories for Filter Sidebar / Bar
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  // Build Supabase Query
  let query = supabase
    .from("products")
    .select(`
      *,
      categories ( id, name, slug ),
      product_images ( id, url, position, is_primary )
    `)
    .eq("is_active", true);

  // Search Filter
  if (q) {
    query = query.ilike("name", `%${q}%`);
  }

  // Category Filter
  if (category) {
    const selectedCategory = categories?.find((c) => c.slug === category);
    if (selectedCategory) {
      query = query.eq("category_id", selectedCategory.id);
    }
  }

  // Price Filters
  if (minPrice && !isNaN(Number(minPrice))) {
    query = query.gte("price", Number(minPrice));
  }
  if (maxPrice && !isNaN(Number(maxPrice))) {
    query = query.lte("price", Number(maxPrice));
  }

  // Sorting
  if (sort === "price-asc") {
    query = query.order("price", { ascending: true });
  } else if (sort === "price-desc") {
    query = query.order("price", { ascending: false });
  } else if (sort === "name") {
    query = query.order("name", { ascending: true });
  } else {
    // default: newest
    query = query.order("created_at", { ascending: false });
  }

  const { data: products } = await query;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-heading font-extrabold text-foreground tracking-tight">
          All Products
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Explore our complete collection of high-quality products.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* FILTER SIDEBAR */}
        <aside className="space-y-6 lg:col-span-1 bg-sidebar border border-border p-6 rounded-2xl h-fit">
          <div className="flex items-center gap-2 border-b border-border pb-4">
            <SlidersHorizontal className="w-4 h-4 text-primary" />
            <h2 className="font-heading font-bold text-base text-foreground">
              Filter Products
            </h2>
          </div>

          {/* Category Filter */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Category
            </h3>
            <div className="space-y-1">
              <Link
                href="/products"
                className={`block text-xs py-1.5 px-3 rounded-lg transition-colors cursor-default ${
                  !category
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                All Categories
              </Link>
              {categories?.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}${sort ? `&sort=${sort}` : ""}`}
                  className={`block text-xs py-1.5 px-3 rounded-lg transition-colors cursor-default ${
                    category === cat.slug
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Sort Filter */}
          <div className="space-y-3 pt-4 border-t border-border">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Sort By
            </h3>
            <div className="space-y-1">
              {[
                { label: "Newest Arrivals", value: "newest" },
                { label: "Price: Low to High", value: "price-asc" },
                { label: "Price: High to Low", value: "price-desc" },
                { label: "Name (A-Z)", value: "name" },
              ].map((opt) => (
                <Link
                  key={opt.value}
                  href={`/products?${category ? `category=${category}&` : ""}sort=${opt.value}`}
                  className={`block text-xs py-1.5 px-3 rounded-lg transition-colors cursor-default ${
                    (sort || "newest") === opt.value
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {opt.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Clear Filters */}
          {(category || sort || q || minPrice || maxPrice) && (
            <div className="pt-4 border-t border-border">
              <Link
                href="/products"
                className="text-xs text-destructive block text-center cursor-default font-semibold hover:border-2 hover:border-t-0 hover:p-0.5 hover:border-primary hover:rounded-xs transition-all duration-100"
              >
                Reset All Filters
              </Link>
            </div>
          )}
        </aside>

        {/* PRODUCTS MAIN CONTENT */}
        <main className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Showing{" "}
              <strong className="text-foreground">
                {products?.length || 0}
              </strong>{" "}
              products
            </span>
          </div>

          {products && products.length > 0 ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(260px,100%),1fr))] gap-6">
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
                    <div className="h-full group relative flex flex-col justify-between bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
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
                            {product.categories?.name || "Catalog"}
                          </span>
                          <h2 className="font-heading font-bold text-foreground text-base line-clamp-1 group-hover:text-primary transition-colors">
                            {product.name}
                          </h2>
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

                        <AddToCartButton product={product} />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center bg-sidebar rounded-2xl border border-dashed border-border text-sm text-muted-foreground">
              No products found matching your filters.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
