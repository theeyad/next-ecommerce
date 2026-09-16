import Link from "next/link";
import { Package, ShieldCheck, RefreshCw, Headset } from "lucide-react";

export default function CustomerFooter() {
  return (
    <footer className="bg-sidebar border-t border-border mt-20">
      {/* Value Proposition Pillars */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-b border-border/60">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-xl shrink-0">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm">
                Free Shipping
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                On all orders over $50 worldwide
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-xl shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm">
                Secure Payment
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                256-bit encrypted checkout
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-xl shrink-0">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm">
                30-Day Returns
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                Hassle-free 100% money back
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-xl shrink-0">
              <Headset className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm">
                24/7 Support
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                Dedicated customer assistance
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1 space-y-3">
            <Link
              href="/"
              className="text-xl font-heading font-bold text-foreground cursor-default"
            >
              Baskify
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed mt-1">
              Your one-stop destination for premium products, curated
              collections, and seamless shopping.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link
                  href="/"
                  className="hover:text-foreground transition-colors cursor-default"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="hover:text-foreground transition-colors cursor-default"
                >
                  Shop Products
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className="hover:text-foreground transition-colors cursor-default"
                >
                  Categories
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">
              Account & Orders
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link
                  href="/login"
                  className="hover:text-foreground transition-colors cursor-default"
                >
                  Sign In
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="hover:text-foreground transition-colors cursor-default"
                >
                  Create Account
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="hover:text-foreground transition-colors cursor-default"
                >
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border/60 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Baskify E-Commerce. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
