"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useProductsStore } from "@/lib/store/productsStore";
import { formatCurrency } from "@/lib/utils";
import {
  SHIPPING_FEE,
  FREE_SHIPPING_THRESHOLD,
  TAX_RATE,
} from "@/lib/constants/consts";
import { Button } from "@/components/ui/button";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  PackageX,
  Truck,
} from "lucide-react";

export default function CustomerCartPage() {
  const [mounted, setMounted] = useState(false);
  const { items, removeItem, updateQuantity, clearCart, getSubtotal } =
    useProductsStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          <div className="h-96 bg-muted/40 rounded-3xl" />
          <div className="h-80 bg-muted/40 rounded-3xl" />
        </div>
      </div>
    );
  }

  const subtotal = getSubtotal();
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0;
  const shippingCost = isFreeShipping ? 0 : SHIPPING_FEE;
  const estimatedTax = subtotal * TAX_RATE;
  const totalDue = subtotal + shippingCost + estimatedTax;

  const freeShippingProgress = Math.min(
    (subtotal / FREE_SHIPPING_THRESHOLD) * 100,
    100
  );
  const remainingForFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal;

  // Scenario 1: Empty Cart State
  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-card border border-dashed border-border p-12 rounded-3xl text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 mx-auto bg-primary/10 text-primary rounded-full flex items-center justify-center">
            <PackageX className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h1 className="text-2xl font-heading font-extrabold text-foreground tracking-tight">
              No products yet
            </h1>
            <p className="text-sm text-muted-foreground">
              Your shopping bag is currently empty. Explore our catalog and add
              some awesome items to get started!
            </p>
          </div>

          <div>
            <Link href="/products" className="cursor-default">
              <Button
                size="lg"
                className="gap-2 rounded-2xl px-8 cursor-default"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Browse Products</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Scenario 2: Cart with items
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-foreground tracking-tight">
            Shopping Cart
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Review your selected items before proceeding to checkout.
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={clearCart}
          className="text-xs text-muted-foreground hover:text-destructive gap-1.5 cursor-default self-start sm:self-auto"
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear Cart</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
        {/* LEFT COLUMN: Cart Items List */}
        <div className="space-y-4">
          {/* Free shipping progress alert */}
          <div className="bg-sidebar border border-border p-4 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-foreground">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-primary" />
                {isFreeShipping ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    🎉 You unlocked FREE Shipping!
                  </span>
                ) : (
                  <span>
                    Add{" "}
                    <strong className="text-primary">
                      {formatCurrency(remainingForFreeShipping)}
                    </strong>{" "}
                    more for FREE Shipping
                  </span>
                )}
              </span>
              <span>{Math.round(freeShippingProgress)}%</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500 rounded-full"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Item Cards */}
          {items.map(({ product, quantity }) => {
            const primaryImg =
              product.product_images?.find((img) => img.is_primary)?.url ||
              product.product_images?.[0]?.url;

            const lineTotal = product.price * quantity;

            return (
              <div
                key={product.id}
                className="group bg-card border border-border rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-sm hover:shadow-md transition-all"
              >
                {/* Product Image */}
                <Link
                  href={`/products/${product.slug}`}
                  className="relative w-20 h-20 sm:w-24 sm:h-24 bg-muted rounded-xl overflow-hidden shrink-0 cursor-default"
                >
                  {primaryImg ? (
                    <Image
                      src={primaryImg}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="96px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                      No Image
                    </div>
                  )}
                </Link>

                {/* Info & Title */}
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {product.categories && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        {product.categories.name}
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground font-mono">
                      REF: {product.slug.toUpperCase()}
                    </span>
                  </div>

                  <Link
                    href={`/products/${product.slug}`}
                    className="block cursor-default"
                  >
                    <h3 className="font-heading font-bold text-foreground text-sm sm:text-base line-clamp-1 hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                  </Link>

                  <p className="text-xs text-muted-foreground">
                    Unit Price: {formatCurrency(product.price)}
                  </p>
                </div>

                {/* Quantity Controls & Line Total */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-border">
                  {/* Stepper */}
                  <div className="flex items-center border border-border rounded-xl bg-background overflow-hidden">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(product.id, quantity - 1)
                      }
                      className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-default"
                      title="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-bold text-foreground min-w-8 text-center select-none">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(product.id, quantity + 1)
                      }
                      disabled={quantity >= (product.stock_quantity || 99)}
                      className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors cursor-default"
                      title="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Line Total */}
                  <div className="text-right shrink-0">
                    <span className="block font-heading font-extrabold text-foreground text-base">
                      {formatCurrency(lineTotal)}
                    </span>
                  </div>

                  {/* Remove Action */}
                  <button
                    type="button"
                    onClick={() => removeItem(product.id)}
                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-default"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT COLUMN: Summary of Purchase Sidebar */}
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm sticky top-20">
          <div className="border-b border-border pb-4">
            <h2 className="text-lg font-heading font-extrabold text-foreground uppercase tracking-wide">
              Summary of Purchase
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span className="font-semibold text-foreground">
                {formatCurrency(subtotal)}
              </span>
            </div>

            <div className="flex items-center justify-between text-muted-foreground">
              <span>Estimated Shipping</span>
              <span className="font-semibold text-foreground">
                {isFreeShipping ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase">
                    Free
                  </span>
                ) : (
                  formatCurrency(shippingCost)
                )}
              </span>
            </div>

            <div className="flex items-center justify-between text-muted-foreground">
              <span>Estimated Taxes ({(TAX_RATE * 100).toFixed(0)}%)</span>
              <span className="font-semibold text-foreground">
                {formatCurrency(estimatedTax)}
              </span>
            </div>

            <div className="pt-3 border-t border-border flex items-baseline justify-between">
              <div>
                <span className="text-xs uppercase font-bold text-muted-foreground block">
                  Total Due
                </span>
                <span className="text-[10px] text-muted-foreground">
                  (Includes taxes & shipping)
                </span>
              </div>
              <span className="text-2xl font-heading font-black text-foreground">
                {formatCurrency(totalDue)}
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <Link href="/checkout" className="block cursor-default">
              <Button
                size="lg"
                className="w-full gap-2 rounded-2xl font-bold uppercase tracking-wider text-xs py-6 cursor-default"
              >
                <span>Proceed to Secure Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground/80 uppercase font-semibold tracking-wider pt-2">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              <span>256-Bit Encrypted Bespoke Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
