"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";
import { uploadStorageImage } from "@/actions/upload";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  onError: (message: string) => void;
  bucket: string;
  folder: string;
  disabled?: boolean;
}

export function ImageUploader({
  value,
  onChange,
  onError,
  bucket,
  folder,
  disabled = false,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function processFile(file: File) {
    if (!file.type.startsWith("image/")) {
      onError("Please select a valid image file");
      return;
    }

    setUploading(true);
    try {
      const result = await uploadStorageImage(file, bucket, folder);

      if (result.error) {
        onError(result.error);
        return;
      }

      if (result.publicUrl) {
        onChange(result.publicUrl);
      }
    } catch {
      onError("Failed to upload image");
    } finally {
      setUploading(false);
    }
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }

  function handleDragOver(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !uploading) {
      setIsDragging(true);
    }
  }

  function handleDragLeave(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || uploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLLabelElement>) {
    if ((e.key === "Enter" || e.key === " ") && !disabled && !uploading) {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  }

  function handleRemoveImage() {
    onChange("");
  }

  return (
    <div>
      {value ? (
        <div className="relative w-full h-36 rounded-lg overflow-hidden border border-input shadow-sm">
          <Image
            src={value}
            alt="Uploaded Preview"
            fill
            className="object-cover"
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            disabled={disabled}
            className="absolute top-2 right-2 bg-black/70 text-white p-1 rounded-full hover:bg-black transition-colors disabled:opacity-50 cursor-default"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label
          tabIndex={disabled || uploading ? -1 : 0}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onKeyDown={handleKeyDown}
          className={cn(
            "flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-lg transition-all duration-150 outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
            disabled || uploading
              ? "cursor-not-allowed opacity-60 pointer-events-none"
              : "cursor-default",
            isDragging
              ? "border-primary bg-primary/10 scale-[0.99]"
              : "border-input bg-background/50 hover:border-muted-foreground/50",
          )}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {uploading ? (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span>Uploading image to Supabase...</span>
              </div>
            ) : (
              <>
                <Upload
                  className={cn(
                    "w-7 h-7 mb-2 transition-transform duration-200",
                    isDragging
                      ? "scale-110 text-primary"
                      : "text-muted-foreground",
                  )}
                />
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    Click to upload
                  </span>{" "}
                  or drag and drop
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  PNG, JPG, WebP, GIF, or SVG (max 5MB)
                </p>
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            disabled={disabled || uploading}
            onChange={handleImageUpload}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
}
