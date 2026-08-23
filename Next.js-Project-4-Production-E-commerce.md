# Next.js Project 4 — Production E-commerce
## Business Requirements & Learning Reference
 
---
 
## Purpose
 
This is the capstone project. Every technology learned across all previous projects
converges here into a single production-ready application. The goal is not to learn
new isolated concepts — it is to combine everything correctly, make real architectural
decisions, and build something that reflects how senior engineers think about systems.
 
This project is your portfolio centerpiece.
 
---
 
## What This Project Combines
 
| Technology | Where Used |
|---|---|
| Next.js App Router | Entire project |
| TypeScript | Entire project |
| TailwindCSS + shadcn/ui | UI layer |
| Supabase (PostgreSQL) | Database |
| Supabase Auth | Email/password + Google OAuth |
| Supabase Storage | Product image uploads |
| Supabase RLS | Data security per user/role |
| Server Components | All public-facing pages |
| Server Actions | All mutations (cart, orders, products) |
| React Hook Form + Zod | All forms with validation |
| Zustand | Client cart state |
| Stripe (test mode) | Checkout + payment |
| GSAP | Animations throughout |
| Middleware | Route protection (customer + admin) |
| revalidatePath / revalidateTag | Cache invalidation after mutations |
 
---
 
## Tech Stack
 
- **Next.js** (latest) + **TypeScript**
- **TailwindCSS** + **shadcn/ui**
- **Supabase** — database, auth, storage
- **@supabase/ssr** — cookie-based session
- **Stripe** — test mode checkout
- **React Hook Form** + **Zod** — form handling + validation
- **Zustand** — client cart state (persisted)
- **GSAP** — animations
- **Vercel** — deployment
---
 
## User Roles
 
### Customer
- Browse products and categories
- Search products
- Add to cart (Zustand, persisted)
- Checkout via Stripe
- View order history
- Manage profile (name, email)
- Sign in via email/password or Google
### Admin
- Manage products (create, edit, delete, set price, upload images)
- Manage categories (create, edit, delete)
- View all orders + update order status
- Access via `/admin/*` routes (same Next.js app)
- No customer-facing UI
### Guest (not logged in)
- Browse products and categories
- Search products
- Add to cart (Zustand persisted locally)
- Prompted to login at checkout
---
 
## Database Schema
 
### Tables
 
```sql
-- Categories
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
 
-- Products
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  compare_at_price DECIMAL(10,2),        -- original price for sale display
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  stock_quantity INTEGER DEFAULT 0 NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
 
-- Product Images
CREATE TABLE product_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,                     -- Supabase Storage URL
  position INTEGER DEFAULT 0 NOT NULL,   -- display order
  is_primary BOOLEAN DEFAULT false NOT NULL
);
 
-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'customer' NOT NULL, -- 'customer' | 'admin'
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
 
-- Orders
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' NOT NULL, -- pending | paid | shipped | delivered | cancelled
  total_amount DECIMAL(10,2) NOT NULL,
  stripe_payment_intent_id TEXT,
  shipping_address JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
 
-- Order Items
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,            -- snapshot at time of purchase
  product_price DECIMAL(10,2) NOT NULL,  -- snapshot at time of purchase
  quantity INTEGER NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL
);
```
 
**Why snapshot product name and price in order_items?**
If a product is later renamed or repriced, the order history must show what the
customer actually paid for. Never reference live product data for historical orders.
 
### Triggers
 
```sql
-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;
 
CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
 
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
 
-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
 
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```
 
---
 
## Row Level Security (RLS)
 
### Products + Categories — Public Read, Admin Write
 
```sql
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
 
-- Anyone can read active products
CREATE POLICY "Anyone can read active products"
ON products FOR SELECT
USING (is_active = true);
 
-- Admins can do everything with products
CREATE POLICY "Admins can manage products"
ON products FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
 
-- Same pattern for categories and product_images
CREATE POLICY "Anyone can read categories"
ON categories FOR SELECT USING (true);
 
CREATE POLICY "Admins can manage categories"
ON categories FOR ALL
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
```
 
### Orders — Users See Only Their Own
 
```sql
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
 
CREATE POLICY "Users can read own orders"
ON orders FOR SELECT
USING (auth.uid() = user_id);
 
CREATE POLICY "Users can create own orders"
ON orders FOR INSERT
WITH CHECK (auth.uid() = user_id);
 
CREATE POLICY "Admins can read all orders"
ON orders FOR SELECT
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
 
CREATE POLICY "Admins can update order status"
ON orders FOR UPDATE
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
 
-- Order items follow same pattern as orders
CREATE POLICY "Users can read own order items"
ON order_items FOR SELECT
USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_id AND orders.user_id = auth.uid())
);
```
 
### Profiles
 
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
 
CREATE POLICY "Users can read own profile"
ON profiles FOR SELECT USING (auth.uid() = id);
 
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE USING (auth.uid() = id);
 
CREATE POLICY "Admins can read all profiles"
ON profiles FOR SELECT
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
```
 
---
 
## App Router File Structure
 
```
app/
├── layout.tsx                        ← root layout (Navbar, Footer, GSAP init)
├── page.tsx                          ← homepage
├── not-found.tsx
├── globals.css
│
├── (store)/                          ← route group — customer-facing
│   ├── layout.tsx                    ← store layout (Navbar + Footer)
│   ├── products/
│   │   ├── page.tsx                  ← /products — catalog + filters
│   │   ├── loading.tsx
│   │   └── [slug]/
│   │       ├── page.tsx              ← /products/[slug] — product detail
│   │       ├── loading.tsx
│   │       └── error.tsx
│   ├── categories/
│   │   └── [slug]/
│   │       ├── page.tsx              ← /categories/[slug]
│   │       └── loading.tsx
│   ├── cart/
│   │   └── page.tsx                  ← /cart ('use client' — Zustand)
│   ├── checkout/
│   │   ├── page.tsx                  ← /checkout (protected)
│   │   └── success/
│   │       └── page.tsx              ← /checkout/success
│   ├── orders/
│   │   ├── page.tsx                  ← /orders — order history (protected)
│   │   └── [id]/
│   │       └── page.tsx              ← /orders/[id] — order detail
│   └── profile/
│       └── page.tsx                  ← /profile (protected)
│
├── (auth)/                           ← route group — auth pages (no Navbar)
│   ├── layout.tsx
│   ├── login/
│   │   └── page.tsx
│   └── register/
│       └── page.tsx
│
├── admin/                            ← admin section (protected, role = admin)
│   ├── layout.tsx                    ← admin layout (sidebar navigation)
│   ├── page.tsx                      ← /admin — dashboard overview
│   ├── products/
│   │   ├── page.tsx                  ← product list + search
│   │   ├── new/
│   │   │   └── page.tsx              ← create product
│   │   └── [id]/
│   │       └── edit/
│   │           └── page.tsx          ← edit product
│   ├── categories/
│   │   ├── page.tsx
│   │   ├── new/
│   │   │   └── page.tsx
│   │   └── [id]/
│   │       └── edit/
│   │           └── page.tsx
│   └── orders/
│       ├── page.tsx                  ← all orders + status filter
│       └── [id]/
│           └── page.tsx              ← order detail + status update
│
└── api/
    └── webhooks/
        └── stripe/
            └── route.ts              ← Stripe webhook handler
 
lib/
├── supabase/
│   ├── server.ts
│   ├── client.ts
│   └── middleware.ts
├── stripe.ts                         ← Stripe client init
├── validations/                      ← Zod schemas
│   ├── product.ts
│   ├── category.ts
│   ├── checkout.ts
│   └── auth.ts
└── types.ts                          ← all TypeScript types
 
components/
├── layout/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── CartIcon.tsx                  ← 'use client' (Zustand)
│   └── AdminSidebar.tsx
├── store/
│   ├── ProductCard.tsx               ← Server Component
│   ├── ProductGrid.tsx               ← Server Component
│   ├── ProductFilters.tsx            ← 'use client'
│   ├── ProductImageGallery.tsx       ← 'use client' (image switching)
│   ├── AddToCartButton.tsx           ← 'use client' (Zustand)
│   ├── CartDrawer.tsx                ← 'use client'
│   └── ReviewStars.tsx
├── admin/
│   ├── ProductForm.tsx               ← 'use client' (React Hook Form)
│   ├── CategoryForm.tsx              ← 'use client' (React Hook Form)
│   ├── ImageUploader.tsx             ← 'use client' (Supabase Storage)
│   └── OrderStatusSelect.tsx        ← 'use client'
├── ui/                               ← shadcn/ui components
└── animations/
    ├── FadeIn.tsx                    ← GSAP wrapper component
    ├── StaggerChildren.tsx           ← GSAP stagger wrapper
    └── HeroAnimation.tsx             ← GSAP hero entrance
 
store/
└── useCartStore.ts                   ← Zustand cart (persisted)
 
app/actions/
├── auth.ts                           ← signUp, signIn, signOut
├── products.ts                       ← createProduct, updateProduct, deleteProduct
├── categories.ts                     ← createCategory, updateCategory, deleteCategory
├── orders.ts                         ← createOrder, updateOrderStatus
└── profile.ts                        ← updateProfile
 
middleware.ts                         ← route protection (customer + admin roles)
```
 
---
 
## Middleware — Two-Level Protection
 
```ts
// middleware.ts
const protectedCustomerRoutes = ['/checkout', '/orders', '/profile']
const adminRoutes = ['/admin']
 
export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request)
  const pathname = request.nextUrl.pathname
 
  // Not logged in → trying to access protected customer route
  if (!user && protectedCustomerRoutes.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
 
  // Trying to access admin → check role
  if (pathname.startsWith('/admin')) {
    if (!user) return NextResponse.redirect(new URL('/login', request.url))
 
    const supabase = await createClient()
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
 
    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }
 
  return supabaseResponse
}
```
 
---
 
## Zod Schemas — Validation Layer
 
```ts
// lib/validations/product.ts
import { z } from 'zod'
 
export const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only'),
  description: z.string().optional(),
  price: z.coerce.number().positive('Price must be positive'),
  compare_at_price: z.coerce.number().positive().optional(),
  category_id: z.string().uuid('Invalid category'),
  stock_quantity: z.coerce.number().int().min(0),
  is_active: z.boolean().default(true),
})
 
export type ProductFormData = z.infer<typeof productSchema>
 
// lib/validations/checkout.ts
export const checkoutSchema = z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
  address_line1: z.string().min(5),
  city: z.string().min(2),
  country: z.string().min(2),
  postal_code: z.string().min(3),
})
 
export type CheckoutFormData = z.infer<typeof checkoutSchema>
```
 
---
 
## React Hook Form + Zod Pattern
 
```tsx
// components/admin/ProductForm.tsx
'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { productSchema, type ProductFormData } from '@/lib/validations/product'
import { createProduct } from '@/app/actions/products'
 
export function ProductForm() {
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: { is_active: true, stock_quantity: 0 },
  })
 
  async function onSubmit(data: ProductFormData) {
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, String(value))
    })
    await createProduct(formData)
  }
 
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register('name')} />
      {form.formState.errors.name && (
        <p>{form.formState.errors.name.message}</p>
      )}
      {/* rest of fields */}
      <button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? 'Saving...' : 'Save Product'}
      </button>
    </form>
  )
}
```
 
---
 
## Stripe Integration
 
### Flow
```
Customer fills checkout form (React Hook Form + Zod)
→ createCheckoutSession Server Action
→ Creates Stripe PaymentIntent
→ Returns clientSecret to browser
→ Stripe Elements renders card input
→ Customer submits payment
→ Stripe processes payment
→ Stripe sends webhook to /api/webhooks/stripe
→ Webhook handler: marks order as 'paid', decrements stock
→ Customer redirected to /checkout/success
```
 
### Server Action
```ts
// app/actions/orders.ts
'use server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
 
export async function createCheckoutSession(cartItems: CartItem[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
 
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
 
  // Create order in DB with status 'pending'
  const { data: order } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      total_amount: total,
      status: 'pending',
    })
    .select()
    .single()
 
  // Insert order items
  await supabase.from('order_items').insert(
    cartItems.map((item) => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.name,      // snapshot
      product_price: item.price,    // snapshot
      quantity: item.quantity,
      subtotal: item.price * item.quantity,
    }))
  )
 
  // Create Stripe PaymentIntent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(total * 100),  // Stripe uses cents
    currency: 'usd',
    metadata: { order_id: order.id },
  })
 
  return { clientSecret: paymentIntent.client_secret, orderId: order.id }
}
```
 
### Webhook Handler
```ts
// app/api/webhooks/stripe/route.ts
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'  // service role — bypasses RLS
 
export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!
 
  const event = stripe.webhooks.constructEvent(
    body, signature, process.env.STRIPE_WEBHOOK_SECRET!
  )
 
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object
    const orderId = paymentIntent.metadata.order_id
 
    // Use service role here — webhook has no user session
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!  // never expose this to client
    )
 
    await supabase
      .from('orders')
      .update({
        status: 'paid',
        stripe_payment_intent_id: paymentIntent.id,
      })
      .eq('id', orderId)
  }
 
  return new Response('ok', { status: 200 })
}
```
 
**Why service role in the webhook?**
Webhooks come from Stripe's servers — no user session, no cookie, no auth.uid().
RLS would block everything. Service role bypasses RLS. This is the only legitimate
use of the service role key. Never use it in client-facing code.
 
---
 
## Supabase Storage — Product Images
 
```ts
// Upload image in admin product form
export async function uploadProductImage(file: File, productId: string) {
  const supabase = await createClient()
  const fileName = `${productId}/${Date.now()}-${file.name}`
 
  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(fileName, file, { upsert: false })
 
  if (error) throw error
 
  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(fileName)
 
  return publicUrl  // store this URL in product_images table
}
```
 
Storage bucket setup in Supabase dashboard:
- Bucket name: `product-images`
- Public bucket: yes (product images are public)
- RLS on storage: only admins can upload/delete
---
 
## GSAP — Animation Plan
 
```ts
// Install
npm install gsap
 
// components/animations/FadeIn.tsx
'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
 
gsap.registerPlugin(ScrollTrigger)
 
export function FadeIn({ children, delay = 0 }) {
  const ref = useRef(null)
 
  useEffect(() => {
    gsap.fromTo(ref.current,
      { opacity: 0, y: 30 },
      {
        opacity: 1, y: 0, duration: 0.6, delay,
        scrollTrigger: { trigger: ref.current, start: 'top 85%' }
      }
    )
  }, [delay])
 
  return <div ref={ref}>{children}</div>
}
```
 
### Where GSAP is used
 
| Location | Animation |
|---|---|
| Homepage hero | Text + CTA entrance (timeline) |
| Product cards | Fade + slide up on scroll (ScrollTrigger + stagger) |
| Category cards | Scale in on scroll |
| Product detail | Image fade in, details slide in from right |
| Cart drawer | Slide in from right (x: '100%' → x: 0) |
| Page transitions | Fade out on leave, fade in on enter |
| Admin dashboard stats | Count up animation on numbers |
| Checkout success | Celebration entrance animation |
 
---
 
## Google OAuth Setup
 
In Supabase dashboard:
- Authentication → Providers → Google → Enable
- Add Google Client ID + Secret (from Google Cloud Console)
- Add redirect URL to Google Console: `https://your-project.supabase.co/auth/v1/callback`
```tsx
// In login page
import { createClient } from '@/lib/supabase/client'
 
async function signInWithGoogle() {
  const supabase = createClient()
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
}
 
// app/(auth)/auth/callback/route.ts — handles OAuth redirect
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
 
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
 
  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }
 
  return NextResponse.redirect(new URL('/', request.url))
}
```
 
---
 
## Environment Variables
 
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # server only — never NEXT_PUBLIC_
 
STRIPE_SECRET_KEY=                # server only
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=   # safe for client (Stripe Elements)
STRIPE_WEBHOOK_SECRET=            # server only
```
 
---
 
## Pages — Full List
 
### Customer-Facing
 
| Route | Description | Rendering |
|---|---|---|
| `/` | Homepage — hero, featured products, categories | SSG + ISR |
| `/products` | Full catalog + filters + search | SSR (searchParams) |
| `/products/[slug]` | Product detail + related products | SSG + ISR |
| `/categories/[slug]` | Category page + products | SSG + ISR |
| `/cart` | Cart page | Client (Zustand) |
| `/checkout` | Checkout form + Stripe | Client + Server Action |
| `/checkout/success` | Order confirmation | Client |
| `/orders` | Order history | SSR (protected) |
| `/orders/[id]` | Order detail | SSR (protected) |
| `/profile` | User profile edit | SSR (protected) |
| `/login` | Login — email + Google | Client |
| `/register` | Register — email + Google | Client |
 
### Admin
 
| Route | Description |
|---|---|
| `/admin` | Dashboard — stats overview |
| `/admin/products` | Product list + search |
| `/admin/products/new` | Create product form |
| `/admin/products/[id]/edit` | Edit product form |
| `/admin/categories` | Category list |
| `/admin/categories/new` | Create category |
| `/admin/categories/[id]/edit` | Edit category |
| `/admin/orders` | All orders + status filter |
| `/admin/orders/[id]` | Order detail + status update |
 
---
 
## Next.js Concepts Covered
 
| Concept | Where |
|---|---|
| App Router + Route Groups | `(store)`, `(auth)` groups |
| Server Components | All public pages |
| Client Components | Forms, cart, animations |
| Server Actions | All mutations |
| Middleware | Customer + admin protection |
| generateStaticParams | Products + categories |
| generateMetadata | All public pages |
| ISR (revalidate) | Products, categories, homepage |
| revalidatePath | After every product/category/order mutation |
| revalidateTag | Product cache invalidation after stock change |
| loading.tsx | All data-fetching pages |
| error.tsx | Product detail, order detail |
| not-found.tsx | Invalid product/category slug |
| Route Handlers (API routes) | Stripe webhook only |
| next/image | All product images |
| next/link | All navigation |
 
---
 
## Completion Checklist
 
### Auth
- [ ] Email/password register + login works
- [ ] Google OAuth login works
- [ ] Session persists across page refresh
- [ ] Middleware protects `/checkout`, `/orders`, `/profile`
- [ ] Middleware protects `/admin/*` and checks role = 'admin'
- [ ] Non-admin user redirected away from `/admin`
### Products + Categories
- [ ] Admin can create/edit/delete products
- [ ] Admin can upload product images to Supabase Storage
- [ ] Admin can create/edit/delete categories
- [ ] Products visible on public catalog
- [ ] Category filter works via URL param
- [ ] Product detail page renders correct product
- [ ] generateStaticParams pre-generates all product + category pages
- [ ] ISR revalidates after admin edits a product
### Cart
- [ ] Add to cart works (logged in + guest)
- [ ] Cart persists across page refresh (localStorage)
- [ ] Cart drawer opens/closes with GSAP animation
- [ ] Quantity update + remove works
### Checkout + Stripe
- [ ] Checkout form validates with Zod
- [ ] Stripe PaymentIntent created on form submit
- [ ] Test card payment succeeds
- [ ] Stripe webhook updates order status to 'paid'
- [ ] Customer redirected to /checkout/success
- [ ] Order appears in /orders after purchase
### Admin Dashboard
- [ ] Admin sees all orders
- [ ] Admin can update order status
- [ ] Admin dashboard shows stats (total orders, revenue, product count)
### RLS
- [ ] Customer can only see their own orders
- [ ] Only admins can create/edit/delete products
- [ ] Public products visible without login
### Animations (GSAP)
- [ ] Hero entrance animation
- [ ] Product cards fade in on scroll
- [ ] Cart drawer slides in/out
- [ ] Page transitions
- [ ] Checkout success animation
### Deployment
- [ ] All env vars set in Vercel dashboard
- [ ] Stripe webhook URL set to Vercel deployment URL
- [ ] Supabase redirect URLs include Vercel domain
- [ ] `npm run build` passes with no errors
- [ ] View Page Source on `/products/[slug]` shows full product HTML
---
 
## Questions You Must Be Able to Answer When Done
 
| Question | Answer |
|---|---|
| Why does the Stripe webhook use service role? | Webhooks have no user session — RLS would block all DB writes |
| Why snapshot product name/price in order_items? | Products can change — order history must reflect what was actually purchased |
| Why use route groups `(store)` and `(auth)`? | Different layouts without affecting URL structure |
| Why is the cart page 'use client'? | Cart lives in Zustand — server has no access to client state |
| Why revalidateTag after product edit? | All pages showing that product (catalog, detail, category) need cache cleared |
| Why Google OAuth needs a callback route? | OAuth returns an auth code — Next.js must exchange it for a session server-side |
| Why never expose SUPABASE_SERVICE_ROLE_KEY to client? | It bypasses all RLS — anyone with it has full DB access |
| When would you use ISR vs SSR for product pages? | ISR for product detail (changes rarely), SSR for catalog with filters (searchParams) |
 
---
 
## Build Order (Recommended)
 
Build in this order — each phase is testable before moving to the next:
 
1. **Database + RLS** — schema, all policies, test in SQL Editor
2. **Auth** — login, register, Google OAuth, middleware, session
3. **Admin — Categories** — simplest CRUD, no images
4. **Admin — Products** — CRUD + image upload to Supabase Storage
5. **Public catalog** — product listing, filters, product detail, SSG
6. **Cart** — Zustand store, cart page, cart drawer
7. **Checkout + Stripe** — form, PaymentIntent, success page
8. **Stripe webhook** — order status update, stock decrement
9. **Order history** — customer orders page + detail
10. **Admin — Orders** — view all orders, update status
11. **Admin — Dashboard** — stats overview
12. **GSAP animations** — add last, after all functionality works
13. **Polish + SEO** — metadata, OG images, loading skeletons
14. **Deploy** — Vercel + webhook URL + env vars
---
 
## Estimated Time
 
| Phase | Time |
|---|---|
| Database + RLS | 2–3 hours |
| Auth (email + Google) | 3–4 hours |
| Admin CRUD (products + categories) | 6–8 hours |
| Public catalog + SSG | 4–5 hours |
| Cart (Zustand) | 2–3 hours |
| Checkout + Stripe | 4–6 hours |
| Orders (customer + admin) | 3–4 hours |
| Admin dashboard stats | 2–3 hours |
| GSAP animations | 4–6 hours |
| Polish + SEO + deployment | 3–4 hours |
| **Total** | **33–46 hours** |
 