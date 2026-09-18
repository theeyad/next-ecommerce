"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Search, X, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { debounce, formatCurrency } from "@/lib/utils";
import { productsType } from "@/lib/validation/types";
import { queryKeys } from "@/lib/queryKeys";

export default function NavSearch() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Debounce state update using existing debounce utility from @/lib/utils.ts
  const debouncedSetSearch = useMemo(
    () => debounce((val: string) => setDebouncedSearch(val), 300),
    [],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsOpen(true);
    debouncedSetSearch(value);
  };

  const handleClear = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setIsOpen(false);
  };

  // TanStack Query for product search using queryKeys factory
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.products.search(debouncedSearch),
    queryFn: async () => {
      if (!debouncedSearch.trim()) return { products: [], count: 0 };
      const supabase = createClient();
      const { data: products, count } = await supabase
        .from("products")
        .select(
          `
          *,
          categories ( name ),
          product_images ( url, is_primary )
        `,
          { count: "exact" },
        )
        .eq("is_active", true)
        .ilike("name", `%${debouncedSearch}%`)
        .limit(5);

      return {
        products: (products as productsType[]) || [],
        count: count || 0,
      };
    },
    enabled: debouncedSearch.trim().length > 0,
  });

  const products = data?.products || [];
  const totalCount = data?.count || 0;

  // Handle submit search via Enter key or View All button
  const handleViewAll = () => {
    if (!searchTerm.trim()) return;
    setIsOpen(false);
    router.push(`/products?q=${encodeURIComponent(searchTerm.trim())}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleViewAll();
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Helper to highlight matching text in title
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={index} className="text-black bg-yellow-300 font-extrabold">
          {part}
        </span>
      ) : (
        part
      ),
    );
  };

  return (
    <div ref={containerRef} className="relative flex-1 max-w-sm">
      {/* Search Input Bar */}
      <div className="relative flex items-center">
        <Search className="w-4 h-4 absolute left-3.5 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => {
            if (searchTerm.trim()) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search products..."
          className="w-full bg-sidebar border border-input rounded-full pl-9 pr-9 py-1.5 text-xs text-foreground outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
        />
        {searchTerm.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 p-0.5 rounded-full text-muted-foreground hover:text-foreground transition-colors cursor-default"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Popover Live Search Dropdown */}
      {isOpen && debouncedSearch.trim().length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-card border border-border shadow-2xl rounded-2xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
          {isLoading ? (
            <div className="p-6 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span>Searching products...</span>
            </div>
          ) : products.length > 0 ? (
            <div className="flex flex-col max-h-96">
              {/* Product Results List */}
              <div className="overflow-y-auto divide-y divide-border/50">
                {products.map((product) => {
                  const primaryImg =
                    product.product_images?.find((img) => img.is_primary)
                      ?.url || product.product_images?.[0]?.url;

                  return (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 p-3 hover:bg-muted/60 transition-colors cursor-default group"
                    >
                      {/* Image Thumbnail */}
                      <div className="relative w-11 h-11 rounded-lg bg-muted overflow-hidden shrink-0 border border-border/50">
                        {primaryImg ? (
                          <Image
                            src={primaryImg}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="44px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">
                            No Img
                          </div>
                        )}
                      </div>

                      {/* Title & Price */}
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <h4 className="text-xs font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                          {highlightMatch(product.name, debouncedSearch)}
                        </h4>
                        <div className="flex items-baseline gap-2 text-xs">
                          <span className="font-bold text-foreground">
                            {formatCurrency(product.price)}
                          </span>
                          {product.compare_at_price && (
                            <span className="text-[10px] text-muted-foreground line-through">
                              {formatCurrency(product.compare_at_price)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* View All Results Button */}
              <div className="p-2 border-t border-border bg-sidebar">
                <button
                  type="button"
                  onClick={handleViewAll}
                  className="w-full py-2 px-4 bg-primary text-primary-foreground text-xs font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors cursor-default shadow-xs"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>View All Results ({totalCount})</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">No products found</p>
              <p>
                We couldn&apos;t find any items matching &quot;{debouncedSearch}
                &quot;
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
