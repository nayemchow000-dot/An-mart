import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '../types';

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalAmount: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => set((state) => {
        // Try to find if identical item exists (matching product ID and variant)
        const existingItemIndex = state.items.findIndex(
          i => i.id === item.id && JSON.stringify(i.selectedVariant) === JSON.stringify(item.selectedVariant)
        );

        if (existingItemIndex >= 0) {
          const newItems = [...state.items];
          newItems[existingItemIndex].quantity += item.quantity;
          return { items: newItems };
        }
        return { items: [...state.items, item] };
      }),
      removeItem: (cartItemId) => set((state) => ({
        items: state.items.filter(i => i.cartItemId !== cartItemId)
      })),
      updateQuantity: (cartItemId, quantity) => set((state) => ({
        items: state.items.map(i => 
          i.cartItemId === cartItemId ? { ...i, quantity: Math.max(1, quantity) } : i
        )
      })),
      clearCart: () => set({ items: [] }),
      getTotalAmount: () => get().items.reduce((total, item) => {
        const itemPrice = item.discountPrice || item.price;
        return total + (itemPrice * item.quantity);
      }, 0),
      getTotalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
    }),
    { name: 'an-mart-cart' }
  )
);
