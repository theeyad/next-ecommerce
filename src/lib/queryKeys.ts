// Query Key Factory for TanStack Query
// Provides consistent, type-safe query keys across the
// application for caching and invalidation

export const queryKeys = {
  products: {
    all: ["products"] as const,
    lists: () => [...queryKeys.products.all, "list"] as const,
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.products.lists(), filters] as const,
    search: (term: string) =>
      [...queryKeys.products.all, "search", term] as const,
    details: () => [...queryKeys.products.all, "detail"] as const,
    detail: (slugOrId: string) =>
      [...queryKeys.products.details(), slugOrId] as const,
  },
  categories: {
    all: ["categories"] as const,
    lists: () => [...queryKeys.categories.all, "list"] as const,
    detail: (slugOrId: string) =>
      [...queryKeys.categories.all, "detail", slugOrId] as const,
  },
  auth: {
    user: () => ["auth", "user"] as const,
    profile: (userId: string) => ["auth", "profile", userId] as const,
  },
} as const;
