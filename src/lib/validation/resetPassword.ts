import * as z from "zod";

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(
      8,
      "Password must be at least 8 characters long with at least one uppercase letter, one lowercase letter, one number and one special character",
    )
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^a-zA-Z0-9]/,
      "Password must contain at least one special character",
    ),
});
