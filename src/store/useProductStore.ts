import { create } from 'zustand';
import { Product } from '../types';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { mockProducts } from '../data/mockProducts';

interface ProductState {
  products: Product[];
  isLoading: boolean;
  hasRlsError: boolean;
  initializeStore: () => () => void;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (id: string, updatedProduct: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  isLoading: true,
  hasRlsError: false,
  initializeStore: () => {
    let mounted = true;

    const fetchProducts = async () => {
      if (get().hasRlsError) {
        // If we know RLS is blocking us, stick to local state to preserve Admin UI changes
        if (mounted) set({ isLoading: false });
        return;
      }
      if (!isSupabaseConfigured) {
        console.log("Supabase is not configured. Falling back to mock products locally.");
        if (mounted) set({ products: mockProducts, isLoading: false });
        return;
      }

      try {
        const { data, error } = await supabase.from('products').select('*');
        
        if (error) {
          if (error.code === '42501' || error.code === '42P01' || error.code === 'PGRST205') {
            set({ hasRlsError: true });
            if (mounted) set({ isLoading: false });
            return;
          }
          throw error;
        }
        
        if (data && data.length > 0) {
          if (mounted) set({ products: data as Product[], isLoading: false });
        } else {
          // Auto-seed if empty
          console.log("Database products empty. Attempting to seed...");
          try {
            const { error: seedError } = await supabase.from('products').upsert(mockProducts);
            if (seedError) throw seedError;
            
            const { data: newData } = await supabase.from('products').select('*');
            if (mounted) set({ products: (newData || []) as Product[], isLoading: false });
          } catch(e) {
            console.log("Not authorized to auto-seed products or table missing. Using mock list locally.");
            set({ hasRlsError: true });
            if (mounted) set({ products: mockProducts, isLoading: false });
          }
        }
      } catch (error) {
        console.error("Supabase Error in products:", error);
        console.log("Falling back to mock products due to Supabase error.");
        if (mounted) set({ products: mockProducts, isLoading: false });
      }
    };

    // Only fetch initially if we don't already have products, or if we haven't hit an RLS error yet
    if (get().products.length === 0 || !get().hasRlsError) {
      fetchProducts();
    }

    let channel: any = null;
    if (isSupabaseConfigured && !get().hasRlsError) {
      channel = supabase.channel('products_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, fetchProducts)
        .subscribe();
    }

    return () => {
      mounted = false;
      if (channel) supabase.removeChannel(channel);
    };
  },
  addProduct: async (product) => {
    if (!isSupabaseConfigured) return;
    try {
      let productToSave = { ...product };
      
      let result = await supabase.from('products').insert([productToSave]);
      
      // Dynamically strip any columns that don't exist in the database schema yet
      while (result.error && result.error.code === 'PGRST204') {
        const match = result.error.message.match(/Could not find the '([^']+)' column/);
        if (match && match[1]) {
          const col = match[1];
          delete (productToSave as any)[col];
          result = await supabase.from('products').insert([productToSave]);
        } else {
          break;
        }
      }
      
      if (result.error) {
        if (result.error.code === '42501' || result.error.code === '42P01' || result.error.code === 'PGRST205') {
          console.warn(`Product add failed (${result.error.code}). Using local state.`);
          set((state) => ({ products: [...state.products, product], hasRlsError: true }));
          return;
        }
        throw result.error;
      }
      
      // Update local state on success for instant UI feedback
      set((state) => {
        const exists = state.products.find(p => p.id === product.id);
        if (!exists) {
          return { products: [...state.products, product] };
        }
        return state;
      });
    } catch (error) {
      console.error("Failed to add product:", error);
      throw error;
    }
  },
  updateProduct: async (id, updatedProduct) => {
    if (!isSupabaseConfigured) return;
    try {
      let productToSave = { ...updatedProduct };

      let result = await supabase.from('products').update(productToSave).eq('id', id);
      
      // Dynamically strip any columns that don't exist in the database schema yet
      while (result.error && result.error.code === 'PGRST204') {
        const match = result.error.message.match(/Could not find the '([^']+)' column/);
        if (match && match[1]) {
          const col = match[1];
          delete (productToSave as any)[col];
          result = await supabase.from('products').update(productToSave).eq('id', id);
        } else {
          break;
        }
      }

      if (result.error) {
        if (result.error.code === '42501' || result.error.code === '42P01' || result.error.code === 'PGRST205') {
          console.warn(`Product update failed (${result.error.code}). Using local state.`);
          set((state) => ({ 
            products: state.products.map(p => p.id === id ? { ...p, ...updatedProduct } : p),
            hasRlsError: true
          }));
          return;
        }
        throw result.error;
      }
      
      // Update local state on success for instant UI feedback
      set((state) => ({ 
        products: state.products.map(p => p.id === id ? { ...p, ...updatedProduct } : p) 
      }));
    } catch (error) {
      console.error("Failed to update product:", error);
      throw error;
    }
  },
  deleteProduct: async (id) => {
    if (!isSupabaseConfigured) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) {
        if (error.code === '42501' || error.code === '42P01' || error.code === 'PGRST205') {
          console.warn(`Product delete failed (${error.code}). Using local state.`);
          set((state) => ({ products: state.products.filter(p => p.id !== id), hasRlsError: true }));
          return;
        }
        throw error;
      }
      
      // Update local state on success for instant UI feedback
      set((state) => ({ products: state.products.filter(p => p.id !== id) }));
    } catch (error) {
      console.error("Failed to delete product:", error);
      throw error;
    }
  },
}));
