import * as z from "zod";

export const createCatSchema = z.object({
  cat_name: z.string().min(1, "Category name is required"),
  cat_desc: z.string().min(1, "Category description is required"),
  cat_img: z.url("Invalid image URL"),
});
