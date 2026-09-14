import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TbEditFilled } from "react-icons/tb";
import { DeleteProductButton } from "./DeleteProductButton";
import { productsType } from "@/lib/validation/types";
import { formatCurrency } from "@/lib/utils";

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select(`
      *,
      categories ( name ),
      product_images ( id, url, is_primary, position )
    `)
    .order("created_at", { ascending: false });

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Products Page</h2>
        <Link href="/admin/products/new">
          <Button size="sm">Add Product</Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {products?.map((product: productsType) => {
          // Find primary image or fallback to the first image
          const primaryImg =
            product.product_images?.find((img) => img.is_primary)?.url ||
            product.product_images?.[0]?.url;

          return (
            <Card
              key={product.id}
              className="relative py-0 pt-4 shadow-lg overflow-hidden flex flex-col justify-between"
            >
              <div>
                <CardHeader>
                  <span className="text-sm font-semibold text-primary uppercase tracking-wider">
                    {product.categories?.name || "Uncategorized"}
                  </span>
                  <div className="mt-4 flex justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {product.name}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {product.description}
                      </CardDescription>
                    </div>
                    <div className="ml-8 flex items-center gap-2">
                      <span className="text-base font-bold text-foreground">
                        {formatCurrency(product.price)}
                      </span>
                      {product.compare_at_price && (
                        <span className="text-xs text-muted-foreground line-through">
                          {formatCurrency(product.compare_at_price)}
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <div className="flex gap-2 absolute top-4 right-4 z-10">
                  <Link href={`/admin/products/edit/${product.slug}`}>
                    <Button size="sm" variant="outline">
                      <TbEditFilled />
                    </Button>
                  </Link>
                  <DeleteProductButton
                    id={product.id}
                    productName={product.name}
                  />
                </div>
              </div>

              {primaryImg ? (
                <div className="relative w-full h-92">
                  <Image
                    src={primaryImg}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-full h-32 mt-4 bg-muted/40 border-t border-input flex items-center justify-center text-xs text-muted-foreground">
                  No image available
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </>
  );
}
