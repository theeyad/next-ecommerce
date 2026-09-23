import Link from "next/link";
import Image from "next/image";
import { createStaticClient } from "@/lib/supabase/static";
import { productsType } from "@/lib/validation/types";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { AddToCartButton } from "@/components/shared/AddToCartButton";

export const revalidate = 60;

export default async function Home() {
  const supabase = createStaticClient();

  // Fetch Categories
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(6);

  // Fetch Featured Products
  const { data: products } = await supabase
    .from("products")
    .select(`
      *,
      categories ( name ),
      product_images ( id, url, position, is_primary )
    `)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(8);

  return (
    <div className="space-y-16 pb-12">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-sidebar border-b border-border py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide">
              <span>New Season Collection</span>
            </div>

            <h1 className="text-foreground font-heading font-extrabold tracking-tight text-[clamp(2rem,5vw+1rem,3.5rem)] leading-[1.1]">
              Elevate Your Everyday Lifestyle
            </h1>

            <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Discover curated essentials, premium products, and exclusive deals designed for modern living. Uncompromising quality delivered to your doorstep.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <Link href="#products" className="cursor-default">
                <Button size="lg" className="rounded-full px-8 gap-2">
                  <span>Shop New Arrivals</span>
                </Button>
              </Link>
              <Link href="#categories" className="cursor-default">
                <Button variant="outline" size="lg" className="rounded-full px-8">
                  Browse Categories
                </Button>
              </Link>
            </div>

            {/* Quick stats / trust */}
            <div className="pt-6 border-t border-border/60 flex items-center justify-center lg:justify-start gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Verified Quality</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Fast Worldwide Delivery</span>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative mx-auto lg:ml-auto w-full max-w-md lg:max-w-none h-72 sm:h-96 lg:h-105 rounded-2xl overflow-hidden shadow-2xl border border-border bg-card">
            <Image
              src="/hero.webp"
              alt="Baskify Featured Showcase"
              fill
              priority
              loading="eager"
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      {/* FEATURED CATEGORIES SECTION */}
      <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-heading font-bold text-foreground tracking-tight">
              Shop by Category
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Explore our wide variety of curated categories
            </p>
          </div>
          <Link
            href="/categories"
            className="text-xs font-semibold text-primary inline-flex items-center gap-1 cursor-default hover:border-2 hover:border-t-0 hover:p-0.5 hover:border-primary hover:rounded-xs transition-all duration-100"
          >
            <span>View All Categories</span>
          </Link>
        </div>

        {categories && categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="group relative h-64 rounded-2xl overflow-hidden border border-border shadow-sm bg-card transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-default"
              >
                {cat.image_url ? (
                  <Image
                    src={cat.image_url}
                    alt={cat.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-sm">
                    No image available
                  </div>
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white space-y-1">
                  <h3 className="text-lg font-bold font-heading transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-white/80 line-clamp-1">
                    {cat.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-sidebar rounded-2xl border border-dashed border-border text-sm text-muted-foreground">
            No categories available yet. Add some in the Admin panel!
          </div>
        )}
      </section>

      {/* FEATURED PRODUCTS SECTION */}
      <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-heading font-bold text-foreground tracking-tight">
              Featured Products
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Handpicked items for top quality and performance
            </p>
          </div>
          <Link
            href="/products"
            className="text-xs font-semibold text-primary inline-flex items-center gap-1 cursor-default hover:border-2 hover:border-t-0 hover:p-0.5 hover:border-primary hover:rounded-xs transition-all duration-100"
          >
            <span>View All Products</span>
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
                      {/* Add to Cart Button */}
                      <AddToCartButton
                        product={product}
                        size="sm"
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-sidebar rounded-2xl border border-dashed border-border text-sm text-muted-foreground">
            No active products available yet. Create products in your Admin portal!
          </div>
        )}
      </section>
    </div>
  );
}
