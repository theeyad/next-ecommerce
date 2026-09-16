import Link from "next/link";
import Image from "next/image";
import { createStaticClient } from "@/lib/supabase/static";

export const revalidate = 60;

export default async function CustomerCategoriesPage() {
  const supabase = createStaticClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-extrabold text-foreground tracking-tight">
          All Categories
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Browse our full list of curated categories and discover your favorite products.
        </p>
      </div>

      {categories && categories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="group relative h-72 rounded-2xl overflow-hidden border border-border shadow-sm bg-card transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-default"
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
              <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/35 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white space-y-2">
                <h2 className="text-xl font-bold font-heading">
                  {cat.name}
                </h2>
                <p className="text-xs text-white/80 line-clamp-2">
                  {cat.description}
                </p>
                <div className="pt-2">
                  <span className="text-xs font-semibold text-primary inline-flex items-center gap-1 cursor-default hover:border-2 hover:border-t-0 hover:p-0.5 hover:border-primary hover:rounded-xs transition-all duration-100">
                    Explore Category
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-sidebar rounded-2xl border border-dashed border-border text-sm text-muted-foreground">
          No categories found. Check back soon!
        </div>
      )}
    </div>
  );
}
