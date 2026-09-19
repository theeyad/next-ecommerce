import { z } from "zod";

export const updateProfileSchema = z.object({
  full_name: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name is too long"),
  avatar_url: z.string().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  address_line1: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  postal_code: z.string().optional().or(z.literal("")),
  country: z.string().optional().or(z.literal("")),
});

export type updateProfileType = z.infer<typeof updateProfileSchema>;
