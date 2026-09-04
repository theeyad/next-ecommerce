# Baskify | E-commerce App

## Technical Challenges & Solutions

### Supabase Auth Rate Limiting

- **The Problem:** Supabase default email provider limits outgoing authentication emails to **2 emails per hour** per project. This restricted efficient development testing and posed a critical bottleneck for production scalability.
- **The Solution:** Integrated **Resend** as a custom SMTP provider. This expanded the capacity to **100 emails per day for free**, allowing the Supabase rate limit configuration to be safely increased to 100 emails per hour to resolve the testing and production bottleneck.
