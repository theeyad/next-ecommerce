"use client";

import { useForm } from "react-hook-form";
import type { FieldValues } from "react-hook-form";
import { createProduct } from "@/actions/admin";
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
import { categoriesType } from "@/lib/validation/types";
import { useRouter } from "next/navigation";
import { useAdminMutation } from "@/hooks/useAdminMutation";
import { queryKeys } from "@/lib/queryKeys";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NewProductFormProps {
  categories: categoriesType[];
}

export default function NewProductForm({ categories }: NewProductFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = useForm({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      compare_at_price: null,
      category_id: "",
      stock_quantity: 0,
      is_active: true,
      images: [],
    },
  });

  const { mutate: handleCreateProduct, isPending } = useAdminMutation({
    action: (values: FieldValues) => createProduct(values),
    keysToInvalidate: [queryKeys.products.all, queryKeys.categories.all],
    successMessage: "Product created successfully",
    onSuccess: () => {
      reset();
      router.push("/admin/products");
    },
    onError: (errorMessage) => {
      setError("root", { message: errorMessage });
    },
  });

  function formSubmitHandler(values: FieldValues) {
    handleCreateProduct(values);
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
                <FieldLabel htmlFor="description">
                  Product Description
                </FieldLabel>
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
                  min={0.01}
                  step={0.01}
                  className="w-full outline-0 border border-input shadow-sm rounded-lg px-3 py-2 text-sm focus:outline-3 focus:border-muted transition-all duration-150"
                />
                {errors.price && (
                  <FieldError>{errors.price.message}</FieldError>
                )}
              </Field>

              <Field data-invalid={!!errors.compare_at_price}>
                <div className="w-fit">
                  <FieldLabel htmlFor="compare_at_price">
                    Compare At Price ($){" "}
                    <span className="text-xs text-muted-foreground">
                      (Optional)
                    </span>
                  </FieldLabel>
                </div>
                <input
                  id="compare_at_price"
                  {...register("compare_at_price")}
                  type="number"
                  min={0.01}
                  step={0.01}
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
                <Select
                  value={watch("category_id") || ""}
                  onValueChange={(val) =>
                    setValue("category_id", val as string, { shouldValidate: true })
                  }
                >
                  <SelectTrigger className="w-full cursor-default">
                    <SelectValue placeholder="Select a category">
                      {categories.find((c) => c.id === watch("category_id"))?.name}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id} label={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category_id && (
                  <FieldError>{errors.category_id.message}</FieldError>
                )}
              </Field>

              <Field data-invalid={!!errors.stock_quantity}>
                <div className="w-fit">
                  <FieldLabel htmlFor="stock_quantity">
                    Stock Quantity
                  </FieldLabel>
                </div>
                <input
                  id="stock_quantity"
                  {...register("stock_quantity")}
                  type="number"
                  min={0}
                  step={1}
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
                disabled={isSubmitting || isPending}
              />

              {errors.images && (
                <FieldError>{errors.images.message}</FieldError>
              )}
            </Field>

            {/* Submit Button */}
            <Field>
              <button
                type="submit"
                disabled={isSubmitting || isPending}
                className="w-full bg-black outline-0 text-white py-2 rounded-lg text-sm font-medium hover:tracking-[0.5px] transition-all duration-150 focus:outline-4 focus:border-muted disabled:opacity-50 disabled:cursor-not-allowed cursor-default"
              >
                {isPending ? "Please wait..." : "Create Product"}
              </button>
            </Field>
          </FieldGroup>
        </form>
      </FieldGroup>
    </div>
  );
}
