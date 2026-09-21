import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { productsType } from "@/lib/validation/types";

export interface CartItem {
  product: productsType;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: productsType, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
}

export const useProductsStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product: productsType, quantity = 1) => {
        const currentItems = get().items;
        const existingIndex = currentItems.findIndex(
          (item) => item.product.id === product.id
        );

        if (existingIndex > -1) {
          const existingItem = currentItems[existingIndex];
          const newQty = Math.min(
            existingItem.quantity + quantity,
            product.stock_quantity || 99
          );
          const updatedItems = [...currentItems];
          updatedItems[existingIndex] = {
            ...existingItem,
            product, // update product data in case price/name changed
            quantity: newQty,
          };
          set({ items: updatedItems });
        } else {
          const initialQty = Math.min(
            quantity,
            product.stock_quantity || 99
          );
          set({
            items: [...currentItems, { product, quantity: initialQty }],
          });
        }
      },

      removeItem: (productId: string) => {
        set({
          items: get().items.filter((item) => item.product.id !== productId),
        });
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set({
          items: get().items.map((item) => {
            if (item.product.id === productId) {
              const maxStock = item.product.stock_quantity || 99;
              return {
                ...item,
                quantity: Math.min(quantity, maxStock),
              };
            }
            return item;
          }),
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        );
      },
    }),
    {
      name: "baskify-cart-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
