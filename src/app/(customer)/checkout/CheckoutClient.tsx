"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  checkoutSchema,
  checkoutSchemaType,
} from "@/lib/validation/checkout";
import { useProductsStore } from "@/lib/store/productsStore";
import { formatCurrency } from "@/lib/utils";
import {
  SHIPPING_FEE,
  FREE_SHIPPING_THRESHOLD,
  TAX_RATE,
} from "@/lib/constants/consts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ShieldCheck,
  CreditCard,
  Truck,
  CheckCircle2,
  ArrowLeft,
  Package,
} from "lucide-react";

interface InitialUserData {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  city: string;
  postalCode: string;
  country: string;
}

interface CheckoutClientProps {
  initialUser: InitialUserData;
}

export function CheckoutClient({ initialUser }: CheckoutClientProps) {
  const [mounted, setMounted] = useState(false);
  const { items, getSubtotal } = useProductsStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<checkoutSchemaType>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: initialUser,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
          <div className="h-96 bg-muted/40 rounded-3xl" />
          <div className="h-96 bg-muted/40 rounded-3xl" />
        </div>
      </div>
    );
  }

  const subtotal = getSubtotal();
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0;
  const shippingCost = isFreeShipping ? 0 : SHIPPING_FEE;
  const estimatedTax = subtotal * TAX_RATE;
  const totalDue = subtotal + shippingCost + estimatedTax;

  // Handle empty cart redirect or message
  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-6">
        <div className="bg-card border border-dashed border-border p-12 rounded-3xl space-y-4">
          <Package className="w-12 h-12 mx-auto text-muted-foreground" />
          <h1 className="text-2xl font-heading font-extrabold text-foreground">
            Your Cart is Empty
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            You don&apos;t have any products in your cart to checkout. Add items
            first to proceed.
          </p>
          <div className="pt-2">
            <Link href="/products" className="cursor-default">
              <Button size="lg" className="rounded-2xl cursor-default">
                Explore Products
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handlePlaceOrder = (_data: checkoutSchemaType) => {
    // Stripe checkout integration will be connected in the next phase
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Back to Cart Header */}
      <div className="flex items-center gap-4 border-b border-border pb-6">
        <Link
          href="/cart"
          className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-default"
          title="Return to Cart"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-foreground tracking-tight">
            Checkout
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Complete your order details and shipping location.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(handlePlaceOrder)}
        className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start"
      >
        {/* LEFT COLUMN: Shipping & Customer Details */}
        <div className="space-y-6">
          {/* Shipping Address Section */}
          <div className="bg-card border border-border p-6 sm:p-8 rounded-3xl space-y-6 shadow-sm">
            <div className="flex items-center gap-2 border-b border-border pb-4">
              <Truck className="w-5 h-5 text-primary" />
              <h2 className="font-heading font-bold text-lg text-foreground">
                Delivery & Shipping Address
              </h2>
            </div>

            <p className="text-xs text-muted-foreground">
              Delivery information is pre-filled from your profile settings. You can edit it for this order.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Full Name */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-semibold text-foreground">
                  Full Name <span className="text-destructive">*</span>
                </label>
                <Input
                  type="text"
                  {...register("fullName")}
                  placeholder="John Doe"
                  className="rounded-xl text-xs cursor-default"
                />
                {errors.fullName && (
                  <p className="text-[11px] text-destructive font-medium">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">
                  Email Address <span className="text-destructive">*</span>
                </label>
                <Input
                  type="email"
                  {...register("email")}
                  placeholder="john@example.com"
                  className="rounded-xl text-xs cursor-default"
                />
                {errors.email && (
                  <p className="text-[11px] text-destructive font-medium">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">
                  Phone Number <span className="text-destructive">*</span>
                </label>
                <Input
                  type="tel"
                  {...register("phone")}
                  placeholder="+1 (555) 000-0000"
                  className="rounded-xl text-xs cursor-default"
                />
                {errors.phone && (
                  <p className="text-[11px] text-destructive font-medium">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              {/* Address Line 1 */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-semibold text-foreground">
                  Address Line 1 <span className="text-destructive">*</span>
                </label>
                <Input
                  type="text"
                  {...register("addressLine1")}
                  placeholder="123 Main Street, Apt 4B"
                  className="rounded-xl text-xs cursor-default"
                />
                {errors.addressLine1 && (
                  <p className="text-[11px] text-destructive font-medium">
                    {errors.addressLine1.message}
                  </p>
                )}
              </div>

              {/* City */}
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">
                  City <span className="text-destructive">*</span>
                </label>
                <Input
                  type="text"
                  {...register("city")}
                  placeholder="New York"
                  className="rounded-xl text-xs cursor-default"
                />
                {errors.city && (
                  <p className="text-[11px] text-destructive font-medium">
                    {errors.city.message}
                  </p>
                )}
              </div>

              {/* Postal Code */}
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">
                  Postal Code
                </label>
                <Input
                  type="text"
                  {...register("postalCode")}
                  placeholder="10001"
                  className="rounded-xl text-xs cursor-default"
                />
                {errors.postalCode && (
                  <p className="text-[11px] text-destructive font-medium">
                    {errors.postalCode.message}
                  </p>
                )}
              </div>

              {/* Country */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-semibold text-foreground">
                  Country <span className="text-destructive">*</span>
                </label>
                <Input
                  type="text"
                  {...register("country")}
                  placeholder="United States"
                  className="rounded-xl text-xs cursor-default"
                />
                {errors.country && (
                  <p className="text-[11px] text-destructive font-medium">
                    {errors.country.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Payment Method Option Placeholder */}
          <div className="bg-card border border-border p-6 sm:p-8 rounded-3xl space-y-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-border pb-4">
              <CreditCard className="w-5 h-5 text-primary" />
              <h2 className="font-heading font-bold text-lg text-foreground">
                Payment Selection
              </h2>
            </div>

            <div className="p-4 bg-sidebar border border-primary/30 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                  <span className="w-1.5 h-1.5 bg-background rounded-full" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-foreground">
                    Cash on Delivery / Direct Standard Payment
                  </span>
                  <span className="block text-[11px] text-muted-foreground">
                    Pay securely upon delivery or order fulfillment.
                  </span>
                </div>
              </div>
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Order Summary & Place Order CTA */}
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm sticky top-20">
          <div className="border-b border-border pb-4">
            <h2 className="text-lg font-heading font-extrabold text-foreground uppercase tracking-wide">
              Order Summary
            </h2>
          </div>

          {/* Items Preview */}
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {items.map(({ product, quantity }) => {
              const img =
                product.product_images?.find((i) => i.is_primary)?.url ||
                product.product_images?.[0]?.url;

              return (
                <div
                  key={product.id}
                  className="flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative w-10 h-10 rounded-lg bg-muted overflow-hidden shrink-0">
                      {img && (
                        <Image
                          src={img}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="block font-semibold text-foreground line-clamp-1">
                        {product.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        Qty: {quantity} × {formatCurrency(product.price)}
                      </span>
                    </div>
                  </div>
                  <span className="font-bold text-foreground shrink-0">
                    {formatCurrency(product.price * quantity)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-border space-y-2 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span className="font-semibold text-foreground">
                {formatCurrency(subtotal)}
              </span>
            </div>

            <div className="flex justify-between text-muted-foreground">
              <span>Shipping</span>
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

            <div className="flex justify-between text-muted-foreground">
              <span>Taxes ({(TAX_RATE * 100).toFixed(0)}%)</span>
              <span className="font-semibold text-foreground">
                {formatCurrency(estimatedTax)}
              </span>
            </div>

            <div className="pt-3 border-t border-border flex items-baseline justify-between">
              <span className="text-xs uppercase font-bold text-muted-foreground">
                Total Due
              </span>
              <span className="text-2xl font-heading font-black text-foreground">
                {formatCurrency(totalDue)}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              type="submit"
              size="lg"
              className="w-full gap-2 rounded-2xl font-bold uppercase tracking-wider text-xs py-6 cursor-default"
            >
              <span>Place Order</span>
              <CheckCircle2 className="w-4 h-4" />
            </Button>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground/80 uppercase font-semibold tracking-wider text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              <span>Safe & Encrypted Transaction</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
