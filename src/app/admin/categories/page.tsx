import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AdminCategoriesPage() {
  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-xl">Categories Page</h2>
        <Link href="/admin/categories/new">
          <Button size="sm">Add Category</Button>
        </Link>
      </div>
    </>
  );
}
