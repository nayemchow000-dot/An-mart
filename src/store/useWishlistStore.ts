import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '../types';

interface WishlistState {
  items: Product[];
  addItem: (item: Product) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => set((state) => {
        if (state.items.find((i) => i.id === item.id)) return state;
        return { items: [...state.items, item] };
      }),
      removeItem: (productId) => set((state) => ({
        items: state.items.filter((i) => i.id !== productId)
      })),
      isInWishlist: (productId) => get().items.some((i) => i.id === productId),
      clearWishlist: () => set({ items: [] }),
    }),
    { name: 'an-mart-wishlist' }
  )
);
