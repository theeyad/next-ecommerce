"use client";

import { useForm } from "react-hook-form";
import type { FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfileSchema } from "@/lib/validation/profile";
import { profileType } from "@/lib/validation/types";
import { updateProfile } from "@/actions/profile";
import { ImageUploader } from "@/components/shared/ImageUploader";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAdminMutation } from "@/hooks/useAdminMutation";
import { queryKeys } from "@/lib/queryKeys";
import Link from "next/link";
import { User, Phone, MapPin, Save, ArrowLeft } from "lucide-react";

interface ProfileEditFormProps {
  profile: profileType;
  isAdminView?: boolean;
}

export function ProfileEditForm({
  profile,
  isAdminView = false,
}: ProfileEditFormProps) {
  const router = useRouter();
  const backHref = isAdminView ? "/admin/profile" : "/profile";

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      full_name: profile.full_name || "",
      avatar_url: profile.avatar_url || "",
      phone: profile.phone || "",
      address_line1: profile.address_line1 || "",
      city: profile.city || "",
      postal_code: profile.postal_code || "",
      country: profile.country || "",
    },
  });

  const { mutate: handleSaveProfile, isPending } = useAdminMutation({
    action: (values: FieldValues) => updateProfile(values),
    keysToInvalidate: [queryKeys.auth.profile(profile.id)],
    successMessage: "Profile updated successfully",
    onSuccess: () => {
      router.push(backHref);
    },
    onError: (errorMessage) => {
      setError("root", { message: errorMessage });
    },
  });

  function onSubmit(values: FieldValues) {
    handleSaveProfile(values);
  }

  return (
    <div className="bg-sidebar border border-border rounded-3xl p-6 sm:p-8 space-y-6 max-w-3xl mx-auto">
      {/* Form Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h2 className="text-xl font-heading font-bold text-foreground">
            Edit Profile
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Update your personal details and default delivery address.
          </p>
        </div>

        <Link href={backHref} className="cursor-default">
          <Button size="sm" variant="ghost" className="gap-1.5 cursor-default">
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>
        </Link>
      </div>

      <FieldGroup>
        {errors.root && (
          <FieldError className="mb-4 text-sm text-black bg-[#ef767a] p-3 rounded-lg">
            {errors.root.message}
          </FieldError>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Avatar Upload */}
          <Field data-invalid={!!errors.avatar_url}>
            <div className="w-fit mb-1">
              <FieldLabel>Profile Avatar</FieldLabel>
            </div>
            <input type="hidden" {...register("avatar_url")} />
            <ImageUploader
              value={watch("avatar_url") || ""}
              onChange={(url) =>
                setValue("avatar_url", url || "", { shouldValidate: true })
              }
              onError={(message) => setError("avatar_url", { message })}
              bucket="profiles"
              folder={profile.id}
              disabled={isSubmitting || isPending}
            />
            {errors.avatar_url && (
              <FieldError>{errors.avatar_url.message}</FieldError>
            )}
          </Field>

          {/* Full Name & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field data-invalid={!!errors.full_name}>
              <div className="flex items-center gap-1.5 w-fit">
                <User className="w-3.5 h-3.5 text-muted-foreground" />
                <FieldLabel htmlFor="full_name">Full Name</FieldLabel>
              </div>
              <input
                id="full_name"
                {...register("full_name")}
                type="text"
                className="w-full outline-0 border border-input bg-background shadow-xs rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              />
              {errors.full_name && (
                <FieldError>{errors.full_name.message}</FieldError>
              )}
            </Field>

            <Field data-invalid={!!errors.phone}>
              <div className="flex items-center gap-1.5 w-fit">
                <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
              </div>
              <input
                id="phone"
                {...register("phone")}
                type="text"
                placeholder="+20 123 456 7890"
                className="w-full outline-0 border border-input bg-background shadow-xs rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              />
              {errors.phone && (
                <FieldError>{errors.phone.message}</FieldError>
              )}
            </Field>
          </div>

          {/* Address Line 1 */}
          <Field data-invalid={!!errors.address_line1}>
            <div className="flex items-center gap-1.5 w-fit">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
              <FieldLabel htmlFor="address_line1">
                Default Shipping Address
              </FieldLabel>
            </div>
            <input
              id="address_line1"
              {...register("address_line1")}
              type="text"
              placeholder="123 Main St, Apt / Suite"
              className="w-full outline-0 border border-input bg-background shadow-xs rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
            />
            {errors.address_line1 && (
              <FieldError>{errors.address_line1.message}</FieldError>
            )}
          </Field>

          {/* City, Postal Code, Country */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field data-invalid={!!errors.city}>
              <div className="w-fit">
                <FieldLabel htmlFor="city">City</FieldLabel>
              </div>
              <input
                id="city"
                {...register("city")}
                type="text"
                placeholder="Cairo"
                className="w-full outline-0 border border-input bg-background shadow-xs rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              />
              {errors.city && <FieldError>{errors.city.message}</FieldError>}
            </Field>

            <Field data-invalid={!!errors.postal_code}>
              <div className="w-fit">
                <FieldLabel htmlFor="postal_code">Postal Code</FieldLabel>
              </div>
              <input
                id="postal_code"
                {...register("postal_code")}
                type="text"
                placeholder="11511"
                className="w-full outline-0 border border-input bg-background shadow-xs rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              />
              {errors.postal_code && (
                <FieldError>{errors.postal_code.message}</FieldError>
              )}
            </Field>

            <Field data-invalid={!!errors.country}>
              <div className="w-fit">
                <FieldLabel htmlFor="country">Country</FieldLabel>
              </div>
              <input
                id="country"
                {...register("country")}
                type="text"
                placeholder="Egypt"
                className="w-full outline-0 border border-input bg-background shadow-xs rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              />
              {errors.country && (
                <FieldError>{errors.country.message}</FieldError>
              )}
            </Field>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Link href={backHref} className="cursor-default">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting || isPending}
                className="cursor-default"
              >
                Cancel
              </Button>
            </Link>

            <Button
              type="submit"
              disabled={isSubmitting || isPending}
              className="gap-2 px-6 cursor-default"
            >
              <Save className="w-4 h-4" />
              <span>{isPending ? "Saving..." : "Save Changes"}</span>
            </Button>
          </div>
        </form>
      </FieldGroup>
    </div>
  );
}
