import * as z from "zod";

export const productImageSchema = z.object({
  url: z.string().min(1, "Image URL is required"),
  is_primary: z.boolean(),
});

export const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Product description is required"),
  price: z.coerce.number().min(0.01, "Price must be greater than 0"),
  compare_at_price: z.coerce
    .number()
    .optional()
    .nullable()
    .transform((val) => (val && val > 0 ? val : null)),
  category_id: z.string().min(1, "Please select a category"),
  stock_quantity: z.coerce
    .number()
    .min(0, "Stock quantity cannot be negative"),
  is_active: z.boolean().default(true),
  images: z
    .array(productImageSchema)
    .min(1, "At least one product image is required"),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
