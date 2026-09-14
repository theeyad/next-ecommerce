"use client";

import { useForm } from "react-hook-form";
import type { FieldValues } from "react-hook-form";
import { updateProduct } from "@/actions/admin";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProductSchema } from "@/lib/validation/products/createProduct";
import {
  MultiImageUploader,
  UploadedImage,
} from "@/components/shared/MultiImageUploader";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { toast } from "@/components/ui/toast";
import { categoriesType, productsType } from "@/lib/validation/types";
import { useRouter } from "next/navigation";

interface EditProductFormProps {
  product: productsType;
  categories: categoriesType[];
}

export default function EditProductForm({
  product,
  categories,
}: EditProductFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: product.name || "",
      description: product.description || "",
      price: product.price || 0,
      compare_at_price: product.compare_at_price || null,
      category_id: product.category_id || "",
      stock_quantity: product.stock_quantity || 0,
      is_active: product.is_active ?? true,
      images:
        product.product_images?.map((img) => ({
          url: img.url,
          is_primary: img.is_primary,
        })) || [],
    },
  });

  async function formSubmitHandler(values: FieldValues) {
    const result = await updateProduct(product.id, values);

    if (result?.error) {
      setError("root", {
        message: result.error,
      });
    }

    if (result?.success) {
      toast.add({
        title: "Product updated successfully",
        type: "success",
      });

      router.push("/admin/products");
    }
  }

  return (
    <div className="bg-sidebar mx-4 my-8 rounded-xl p-8">
      <FieldGroup>
        {errors.root && (
          <FieldError className="mb-4 text-sm text-black bg-[#ef767a] p-3 rounded">
            {errors.root.message}
          </FieldError>
        )}

        <form onSubmit={handleSubmit(formSubmitHandler)} className="space-y-4">
          <FieldGroup>
            {/* Product Name */}
            <Field data-invalid={!!errors.name}>
              <div className="w-fit">
                <FieldLabel htmlFor="name">Product Name</FieldLabel>
              </div>
              <input
                id="name"
                {...register("name")}
                type="text"
                className="w-full outline-0 border border-input shadow-sm rounded-lg px-3 py-2 text-sm focus:outline-3 focus:border-muted transition-all duration-150"
              />
              {errors.name && <FieldError>{errors.name.message}</FieldError>}
            </Field>

            {/* Description */}
            <Field data-invalid={!!errors.description}>
              <div className="w-fit">
                <FieldLabel htmlFor="description">Product Description</FieldLabel>
              </div>
              <textarea
                id="description"
                {...register("description")}
                rows={3}
                className="w-full outline-0 border border-input shadow-sm rounded-lg px-3 py-2 text-sm focus:outline-3 focus:border-muted transition-all duration-150"
              />
              {errors.description && (
                <FieldError>{errors.description.message}</FieldError>
              )}
            </Field>

            {/* Price & Compare At Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field data-invalid={!!errors.price}>
                <div className="w-fit">
                  <FieldLabel htmlFor="price">Price ($)</FieldLabel>
                </div>
                <input
                  id="price"
                  {...register("price")}
                  type="number"
                  step="0.01"
                  className="w-full outline-0 border border-input shadow-sm rounded-lg px-3 py-2 text-sm focus:outline-3 focus:border-muted transition-all duration-150"
                />
                {errors.price && <FieldError>{errors.price.message}</FieldError>}
              </Field>

              <Field data-invalid={!!errors.compare_at_price}>
                <div className="w-fit">
                  <FieldLabel htmlFor="compare_at_price">
                    Compare At Price ($) <span className="text-xs text-muted-foreground">(Optional)</span>
                  </FieldLabel>
                </div>
                <input
                  id="compare_at_price"
                  {...register("compare_at_price")}
                  type="number"
                  step="0.01"
                  className="w-full outline-0 border border-input shadow-sm rounded-lg px-3 py-2 text-sm focus:outline-3 focus:border-muted transition-all duration-150"
                />
                {errors.compare_at_price && (
                  <FieldError>{errors.compare_at_price.message}</FieldError>
                )}
              </Field>
            </div>

            {/* Category & Stock Quantity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field data-invalid={!!errors.category_id}>
                <div className="w-fit">
                  <FieldLabel htmlFor="category_id">Category</FieldLabel>
                </div>
                <select
                  id="category_id"
                  {...register("category_id")}
                  className="w-full outline-0 border border-input shadow-sm rounded-lg px-3 py-2 text-sm bg-background focus:outline-3 focus:border-muted transition-all duration-150 cursor-pointer"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.category_id && (
                  <FieldError>{errors.category_id.message}</FieldError>
                )}
              </Field>

              <Field data-invalid={!!errors.stock_quantity}>
                <div className="w-fit">
                  <FieldLabel htmlFor="stock_quantity">Stock Quantity</FieldLabel>
                </div>
                <input
                  id="stock_quantity"
                  {...register("stock_quantity")}
                  type="number"
                  className="w-full outline-0 border border-input shadow-sm rounded-lg px-3 py-2 text-sm focus:outline-3 focus:border-muted transition-all duration-150"
                />
                {errors.stock_quantity && (
                  <FieldError>{errors.stock_quantity.message}</FieldError>
                )}
              </Field>
            </div>

            {/* Multi Image Uploader */}
            <Field data-invalid={!!errors.images}>
              <div className="w-fit mb-1">
                <FieldLabel>Product Images</FieldLabel>
              </div>

              <MultiImageUploader
                value={(watch("images") || []) as UploadedImage[]}
                onChange={(imgs) =>
                  setValue("images", imgs, { shouldValidate: true })
                }
                onError={(message) => setError("images", { message })}
                bucket="catalog"
                folder="products"
                disabled={isSubmitting}
              />

              {errors.images && (
                <FieldError>{errors.images.message}</FieldError>
              )}
            </Field>

            {/* Submit Button */}
            <Field>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-black outline-0 text-white py-2 rounded-lg text-sm font-medium hover:tracking-[0.5px] transition-all duration-150 focus:outline-4 focus:border-muted disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? "Please wait..." : "Update Product"}
              </button>
            </Field>
          </FieldGroup>
        </form>
      </FieldGroup>
    </div>
  );
}
