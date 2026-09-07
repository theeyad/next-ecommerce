# Baskify | E-commerce App

## Technical Challenges & Solutions

### Supabase Auth Rate Limiting

- **The Problem:** Supabase default email provider limits outgoing authentication emails to **2 emails per hour** per project. This restricted efficient development testing and posed a critical bottleneck for production scalability.
- **The Solution:** Integrated **Resend** as a custom SMTP provider. This expanded the capacity to **100 emails per day for free**, allowing the Supabase rate limit configuration to be safely increased to 100 emails per hour to resolve the testing and production bottleneck.

### Image Upload Handler

- **The Problem:** Recreating an image upload handler each time I need it would be redundant and time consuming and would violate the DRY Principle. Also I needed a way to handle the loading state, preview, error handling, and keyboard accessibility which makes it even harder. not mentioning this should work with supabse.
- **The Solution:** Created a reusable image upload component `ImageUploader.tsx` in `src/components/shared/ImageUploader.tsx` that can be used in wherever I need, and also a handler function for it `uploadImage.ts` in `src/actions/upload.ts`. This component can be used normally with React Hook Form so we do not lose any of its benefits like validation, error handling, etc. in addition to a preview of the image, a loading state while uploading, and keyboard accessibility. By that I could use image upload feature for products, categories, and wherever I need without recreating it and without being worry about changing same lines of code in multiple times if I wanted to change anything in it.
- **Making it Useful for The Community:** I found this helpful so I saved it all in this repo `https://github.com/theeyad/image-uplaod-handler-for-supabase-and-nextjs` so anyone can benifit from it.
