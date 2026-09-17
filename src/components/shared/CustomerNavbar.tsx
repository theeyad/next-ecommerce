"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CoolThemeToggle } from "@/components/lightswind/cool-theme-toggle";
import { ShoppingBag, Search, User, Shield } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";

export default function CustomerNavbar() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    const supabase = createClient();

    const fetchUserAndRole = async (authUser: SupabaseUser | null) => {
      setUser(authUser);
      if (authUser) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", authUser.id)
          .maybeSingle();
        setIsAdmin(profile?.role === "admin");
      } else {
        setIsAdmin(false);
      }
    };

    supabase.auth.getUser().then(({ data }) => {
      fetchUserAndRole(data.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchUserAndRole(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Main Nav */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 cursor-default">
            <span className="text-xl font-heading font-bold text-foreground tracking-tight">
              Baskify
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link
              href="/products"
              className="hover:text-foreground transition-colors cursor-default"
            >
              Products
            </Link>
            <Link
              href="/categories"
              className="hover:text-foreground transition-colors cursor-default"
            >
              Categories
            </Link>
          </nav>
        </div>

        {/* Search Bar */}
        <div className="hidden sm:flex flex-1 max-w-xs relative items-center">
          <Search className="w-4 h-4 absolute left-3 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full bg-sidebar border border-input rounded-full pl-9 pr-4 py-1.5 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring/50 transition-all"
          />
        </div>

        {/* User & Cart Actions */}
        <div className="flex items-center gap-3">
          {/* Admin Link (Only if logged in & Admin) */}
          {isAdmin && (
            <Link
              href="/admin"
              className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-default"
              title="Admin Dashboard"
            >
              <Shield className="w-5 h-5" />
            </Link>
          )}

          {/* Cart Icon */}
          <Link
            href="/cart"
            className="relative p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-default"
            title="Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute top-1 right-1 bg-primary text-primary-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              0
            </span>
          </Link>

          {/* Auth Button / Profile */}
          {user ? (
            <Link
              href="/profile"
              className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-default"
              title="Your Account"
            >
              <User className="w-5 h-5" />
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-muted/50 transition-colors cursor-default"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="text-xs font-medium px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors cursor-default"
              >
                Register
              </Link>
            </div>
          )}

          {/* Theme Toggle */}
          <CoolThemeToggle />
        </div>
      </div>
    </header>
  );
}

