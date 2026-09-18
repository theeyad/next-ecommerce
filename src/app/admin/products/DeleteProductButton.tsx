"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TbTrashXFilled } from "react-icons/tb";
import { deleteProduct } from "@/actions/admin";
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

interface DeleteProductButtonProps {
  id: string;
  productName: string;
}

export function DeleteProductButton({
  id,
  productName,
}: DeleteProductButtonProps) {
  const [open, setOpen] = useState(false);

  const { mutate: handleDelete, isPending } = useAdminMutation({
    action: () => deleteProduct(id),
    keysToInvalidate: [queryKeys.products.all],
    successMessage: "Product deleted successfully",
    onSuccess: () => setOpen(false),
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
          <DialogTitle>Delete Product</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            <strong className="text-foreground">{productName}</strong>? This
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
            {isPending ? "Deleting..." : "Delete Product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
