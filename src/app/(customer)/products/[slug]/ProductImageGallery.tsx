"use client";

import { useState } from "react";
import Image from "next/image";
import { productImageType } from "@/lib/validation/types";
import { cn } from "@/lib/utils";

interface ProductImageGalleryProps {
  images: productImageType[];
  productName: string;
}

export function ProductImageGallery({
  images,
  productName,
}: ProductImageGalleryProps) {
  // Find primary image or default to first image
  const primaryIndex = Math.max(
    0,
    images.findIndex((img) => img.is_primary)
  );
  const [selectedImageIndex, setSelectedImageIndex] = useState(primaryIndex);

  const selectedImage = images[selectedImageIndex]?.url || images[0]?.url;

  return (
    <div className="space-y-4">
      {/* Main Image Display */}
      <div className="relative w-full h-80 sm:h-96 md:h-112.5 rounded-3xl overflow-hidden border border-border bg-card shadow-sm">
        {selectedImage ? (
          <Image
            src={selectedImage}
            alt={productName}
            fill
            priority
            className="object-cover transition-all duration-300"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
            No image available
          </div>
        )}
      </div>

      {/* Thumbnails Strip */}
      {images.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto p-2">
          {images.map((img, idx) => (
            <button
              key={img.id || idx}
              type="button"
              onClick={() => setSelectedImageIndex(idx)}
              className={cn(
                "relative w-20 h-20 rounded-xl overflow-hidden border shrink-0 transition-all duration-150 cursor-default",
                selectedImageIndex === idx
                  ? "ring-2 ring-primary border-primary scale-105"
                  : "border-border opacity-70 hover:opacity-100"
              )}
            >
              <Image
                src={img.url}
                alt={`${productName} thumbnail ${idx + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
