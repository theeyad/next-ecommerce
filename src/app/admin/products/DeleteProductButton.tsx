"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { TbTrashXFilled } from "react-icons/tb";
import { deleteProduct } from "@/actions/admin";
import { toast } from "@/components/ui/toast";
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

interface DeleteProductButtonProps {
  id: string;
  productName: string;
}

export function DeleteProductButton({
  id,
  productName,
}: DeleteProductButtonProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteProduct(id);

      if (result?.error) {
        toast.add({
          title: "Error deleting product",
          description: result.error,
          type: "error",
        });
      } else {
        toast.add({
          title: "Product deleted",
          type: "success",
        });
        setOpen(false);
      }
    });
  }

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
            <strong className="text-foreground">{productName}</strong>? This action cannot be undone.
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
