"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useProductsStore } from "@/lib/store/productsStore";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ShoppingBag, User } from "lucide-react";

export default function OrderSuccessPage() {
  const [mounted, setMounted] = useState(false);
  const clearCart = useProductsStore((state) => state.clearCart);

  useEffect(() => {
    setMounted(true);
    // Automatically clear the shopping cart upon successful payment return
    clearCart();
  }, [clearCart]);

  if (!mounted) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-6 animate-pulse">
        <div className="w-20 h-20 mx-auto bg-muted rounded-full" />
        <div className="h-8 w-64 bg-muted rounded-lg mx-auto" />
        <div className="h-16 w-96 bg-muted rounded-lg mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="bg-card border border-border p-8 sm:p-12 rounded-3xl text-center space-y-6 shadow-xl animate-in zoom-in-95 duration-300">
        <div className="w-20 h-20 mx-auto bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2 max-w-md mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
            Payment Successful
          </span>
          <h1 className="text-3xl font-heading font-black text-foreground tracking-tight pt-2">
            Thank You for Your Order!
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your payment has been processed securely via Stripe. Our team is now
            preparing your items for fulfillment.
          </p>
        </div>

        <div className="bg-sidebar border border-border p-6 rounded-2xl max-w-md mx-auto text-center space-y-1 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">
            Your transaction has been recorded successfully.
          </p>
          <p>You can track your order history from your account profile.</p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/products" className="cursor-default">
            <Button
              size="lg"
              className="gap-2 rounded-2xl px-8 cursor-default"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Continue Shopping</span>
            </Button>
          </Link>

          <Link href="/profile" className="cursor-default">
            <Button
              size="lg"
              variant="outline"
              className="gap-2 rounded-2xl px-8 cursor-default"
            >
              <User className="w-4 h-4" />
              <span>View Account Profile</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
