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
import { DeleteCategoryButton } from "@/app/admin/categories/DeleteCategoryButton";

export default async function AdminCategoriesPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-xl">Categories Page</h2>
        <Link href="/admin/categories/new">
          <Button size="sm">Add Category</Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {categories?.map((category) => (
          <Card key={category.id} className="relative py-0 pt-4">
            <CardHeader>
              <CardTitle>{category.name}</CardTitle>
              <CardDescription>{category.description}</CardDescription>
            </CardHeader>
            <div className="flex gap-2 absolute top-4 right-4">
              <Link href={`/admin/categories/${category.id}/edit`}>
                <Button size="sm" variant="outline">
                  <TbEditFilled />
                </Button>
              </Link>
              <DeleteCategoryButton
                id={category.id}
                categoryName={category.name}
              />
            </div>
            <Image
              src={category.image_url}
              alt={category.name}
              width={400}
              height={400}
            />
          </Card>
        ))}
      </div>
    </>
  );
}
