export type adminUserType = {
  fullName: string;
  email: string;
  avatar: string;
};

export type categoriesType = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
};

export type productImageType = {
  id: string;
  product_id: string;
  url: string;
  position?: number;
  is_primary: boolean;
};

export type productsType = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price?: number | null;
  category_id: string;
  stock_quantity: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  categories?: { name: string } | null;
  product_images: productImageType[];
};

export type profileType = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: "customer" | "admin";
  phone?: string | null;
  address_line1?: string | null;
  city?: string | null;
  postal_code?: string | null;
  country?: string | null;
  created_at?: string;
  email?: string; // joined from auth.users
};

export type { checkoutSchemaType } from "@/lib/validation/checkout";
