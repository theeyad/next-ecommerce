"use client";

import { useEffect, useState } from "react";
import { useProductsStore } from "@/lib/store/productsStore";
import { productsType } from "@/lib/validation/types";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddToCartButtonProps {
  product: productsType;
  quantity?: number;
  className?: string;
  variant?: "default" | "secondary" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  showText?: boolean;
}

export function AddToCartButton({
  product,
  quantity = 1,
  className,
  variant = "default",
  size = "sm",
  showText = true,
}: AddToCartButtonProps) {
  const [mounted, setMounted] = useState(false);
  const { items, addItem, removeItem } = useProductsStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isInCart = mounted
    ? items.some((item) => item.product.id === product.id)
    : false;

  const handleToggleCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.stock_quantity <= 0 && !isInCart) return;

    if (isInCart) {
      removeItem(product.id);
    } else {
      addItem(product, quantity);
    }
  };

  const isOutOfStock = product.stock_quantity <= 0;

  return (
    <Button
      type="button"
      size={size}
      variant={isInCart ? "secondary" : variant}
      onClick={handleToggleCart}
      disabled={isOutOfStock && !isInCart}
      className={cn(
        "gap-1.5 rounded-xl transition-all duration-200 cursor-default",
        isInCart &&
          "bg-emerald-500/15 text-emerald-600 border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-400 hover:bg-emerald-500/20",
        className
      )}
    >
      {isInCart ? (
        <>
          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-in zoom-in-50 duration-200" />
          {showText && (
            <span className="text-emerald-600 dark:text-emerald-400">
              Added
            </span>
          )}
        </>
      ) : (
        <>
          <ShoppingBag className="w-4 h-4" />
          {showText && <span>{isOutOfStock ? "Out of Stock" : "Add"}</span>}
        </>
      )}
    </Button>
  );
}
