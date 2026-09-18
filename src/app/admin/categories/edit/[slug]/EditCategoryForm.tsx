"use client";

import { useForm } from "react-hook-form";
import type { FieldValues } from "react-hook-form";
import { updateCategory } from "@/actions/admin";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCatSchema } from "@/lib/validation/categories/createCat";
import { ImageUploader } from "@/components/shared/ImageUploader";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { useRouter } from "next/navigation";
import { categoriesType } from "@/lib/validation/types";
import { useAdminMutation } from "@/hooks/useAdminMutation";
import { queryKeys } from "@/lib/queryKeys";

export default function EditCategoryForm({
  category,
}: {
  category: categoriesType;
}) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: zodResolver(createCatSchema),
    defaultValues: {
      cat_name: category.name || "",
      cat_desc: category.description || "",
      cat_img: category.image_url || "",
    },
  });

  const { mutate: handleUpdateCategory, isPending } = useAdminMutation({
    action: (values: FieldValues) => updateCategory(category.id, values),
    keysToInvalidate: [queryKeys.categories.all, queryKeys.products.all],
    successMessage: "Category updated successfully",
    onSuccess: () => {
      router.push("/admin/categories");
    },
    onError: (errorMessage) => {
      setError("root", { message: errorMessage });
    },
  });

  function formSubmitHandler(values: FieldValues) {
    handleUpdateCategory(values);
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
            <Field data-invalid={!!errors.cat_name}>
              <div className="w-fit">
                <FieldLabel htmlFor="cat_name">Category Name</FieldLabel>
              </div>
              <input
                id="cat_name"
                {...register("cat_name")}
                type="text"
                className="w-full outline-0 border border-input shadow-sm rounded-lg px-3 py-2 text-sm focus:outline-3 focus:border-muted transition-all duration-150"
              />
              {errors.cat_name && (
                <FieldError>{errors.cat_name.message}</FieldError>
              )}
            </Field>

            <Field data-invalid={!!errors.cat_desc}>
              <div className="w-fit">
                <FieldLabel htmlFor="cat_desc">Category Description</FieldLabel>
              </div>
              <input
                id="cat_desc"
                {...register("cat_desc")}
                type="text"
                className="w-full outline-0 border border-input shadow-sm rounded-lg px-3 py-2 text-sm focus:outline-3 focus:border-muted transition-all duration-150"
              />
              {errors.cat_desc && (
                <FieldError>{errors.cat_desc.message}</FieldError>
              )}
            </Field>

            <Field data-invalid={!!errors.cat_img}>
              <div className="w-fit">
                <FieldLabel>Category Image</FieldLabel>
              </div>

              {/* Hidden RHF input field registered with zod schema */}
              <input type="hidden" {...register("cat_img")} />

              <ImageUploader
                value={watch("cat_img")}
                onChange={(url) =>
                  setValue("cat_img", url, { shouldValidate: true })
                }
                onError={(message) => setError("cat_img", { message })}
                bucket="catalog"
                folder="categories"
                disabled={isSubmitting || isPending}
              />

              {errors.cat_img && (
                <FieldError>{errors.cat_img.message}</FieldError>
              )}
            </Field>

            <Field>
              <button
                type="submit"
                disabled={isSubmitting || isPending}
                className="w-full bg-black outline-0 text-white py-2 rounded-lg text-sm font-medium hover:tracking-[0.5px] transition-all duration-150 focus:outline-4 focus:border-muted disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? "Please wait..." : "Update category"}
              </button>
            </Field>
          </FieldGroup>
        </form>
      </FieldGroup>
    </div>
  );
}
