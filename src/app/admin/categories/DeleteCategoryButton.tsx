"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TbTrashXFilled } from "react-icons/tb";
import { deleteCategory } from "@/actions/admin";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { useAdminMutation } from "@/hooks/useAdminMutation";
import { queryKeys } from "@/lib/queryKeys";

interface DeleteCategoryButtonProps {
  id: string;
  categoryName: string;
}

export function DeleteCategoryButton({
  id,
  categoryName,
}: DeleteCategoryButtonProps) {
  const [open, setOpen] = useState(false);

  const { mutate: handleDelete, isPending } = useAdminMutation({
    action: () => deleteCategory(id),
    keysToInvalidate: [queryKeys.categories.all, queryKeys.products.all],
    successMessage: "Category deleted successfully",
    onSuccess: () => setOpen(false), // Close modal on success
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" variant="destructive">
            <TbTrashXFilled />
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Category</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            <strong className="text-foreground">{categoryName}</strong>? This
            action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <DialogClose
            render={
              <Button variant="outline" disabled={isPending}>
                Cancel
              </Button>
            }
          />
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? "Deleting..." : "Delete Category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
