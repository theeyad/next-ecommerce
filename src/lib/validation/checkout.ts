import { z } from "zod";

export const checkoutSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name is too long"),
  email: z.email("Please enter a valid email address"),
  phone: z.string().min(5, "Phone number is required"),
  addressLine1: z.string().min(3, "Address line 1 is required"),
  city: z.string().min(2, "City is required"),
  postalCode: z.string().optional().or(z.literal("")),
  country: z.string().min(2, "Country is required"),
});

export type checkoutSchemaType = z.infer<typeof checkoutSchema>;
