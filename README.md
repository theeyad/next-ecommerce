# Baskify | E-commerce App

## Technical Challenges & Solutions

### Supabase Auth Rate Limiting

- **The Problem:** Supabase default email provider limits outgoing authentication emails to **2 emails per hour** per project. This restricted efficient development testing and posed a critical bottleneck for production scalability.
- **The Solution:** Integrated **Resend** as a custom SMTP provider. This expanded the capacity to **100 emails per day for free**, allowing the Supabase rate limit configuration to be safely increased to 100 emails per hour to resolve the testing and production bottleneck.

### Image Upload Handler

- **The Problem:** Recreating an image upload handler each time I need it would be redundant and time consuming and would violate the DRY Principle. Also I needed a way to handle the loading state, preview, error handling, and keyboard accessibility which makes it even harder. not mentioning this should work with supabse.
- **The Solution:** Created a reusable image upload component `ImageUploader.tsx` in `src/components/shared/ImageUploader.tsx` that can be used in wherever I need, and also a handler function for it `uploadImage.ts` in `src/actions/upload.ts`. This component can be used normally with React Hook Form so we do not lose any of its benefits like validation, error handling, etc. in addition to a preview of the image, a loading state while uploading, and keyboard accessibility. By that I could use image upload feature for products, categories, and wherever I need without recreating it and without being worry about changing same lines of code in multiple times if I wanted to change anything in it.
- **Making it Useful for The Community:** I found this helpful so I saved it all in this repo `https://github.com/theeyad/image-upload-handler-for-supabase-and-nextjs` so anyone can benifit from it.

### Tanstack Query invalidation

- **The Problem:** When I added search for products feature in the navbar I faced a problem where when admins create, delete or update products or categories the data will be stale until I the page is refreshed so a new the real _fresh_ data is fetched. I could not just make the staleTime 0 because that would make the app slower because it will refetch the data every time the page is refreshed or visited. So I needed to use the invalidation feature of tanstack query. but invalidating everything is a dangerous and bad practice. so I needed to figure something out.
- **The Solution:** I used revalidatePath from next/cashe in server side for SSG pages. and a custom reusable `useAdminMutation` hook in `src/hooks/useAdminMutation.ts` for client side mutations that invalidates only the keys I need and not everything. a reusable client mutation hook that executes a server action,
  invalidates target tanstack query client caches, and displays toast notifications. it takes the server action function, keys to invalidate, success message, on success handler, and error handler as arguments. this is a hook that solves exactly my problem here. so now products and categories is up-to-date with **0ms** delay to customers.

### Race Conditions

- **The Problem:** In concurrent high-traffic scenarios (e.g. flash sales or concurrent Stripe webhooks), three potential race conditions could occur:
  1. *Lost Update Stock Decrement:* JavaScript read-then-write updates (`stock - quantity`) on simultaneous webhooks cause lost stock updates.
  2. *Duplicate Webhook Processing:* Concurrent Stripe webhook deliveries for the same payment intent can cause duplicate order records to be inserted into the database.
  3. *Overselling at Checkout:* Multiple users completing checkout for the last unit in stock at the exact same millisecond.
- **The Solution:** Implemented a multi-layered defense system:
  - **Database Level:** Added a PostgreSQL `UNIQUE (stripe_payment_intent_id)` constraint on the `orders` table to enforce idempotency at the database engine level, and created an atomic PostgreSQL RPC function (`decrement_product_stock`) to perform thread-safe inventory decrements directly in SQL.
  - **Pre-Checkout Audit:** Added server-side inventory verification in `src/actions/checkout.ts` before creating Stripe checkout sessions.
  - **Auto-Refund Safety Net:** Integrated an automatic Stripe refund mechanism (`stripe.refunds.create`) inside `src/app/api/webhooks/stripe/route.ts` that automatically cancels and refunds any order that encounters an oversold race condition.