import { create } from 'zustand';
import { Product } from '../types';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { mockProducts } from '../data/mockProducts';
import { handleDBError } from '../utils/dbErrorHandling';

interface ProductState {
  products: Product[];
  isLoading: boolean;
  initializeStore: () => () => void;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (id: string, updatedProduct: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  isLoading: true,
  initializeStore: () => {
    let mounted = true;

    const fetchProducts = async () => {
      if (!isSupabaseConfigured) {
        console.log("Supabase is not configured. Falling back to mock products locally.");
        if (mounted) set({ products: mockProducts, isLoading: false });
        return;
      }

      try {
        const { data, error } = await supabase.from('products').select('*');
        
        if (error) {
          handleDBError(error, 'products');
          throw error;
        }
        
        if (data && data.length > 0) {
          if (mounted) set({ products: data as Product[], isLoading: false });
        } else {
          // Auto-seed if empty
          console.log("Database products empty. Attempting to seed...");
          try {
            const { error: seedError } = await supabase.from('products').upsert(mockProducts);
            if (seedError) {
              handleDBError(seedError, 'products');
              throw seedError;
            }
            
            const { data: newData } = await supabase.from('products').select('*');
            if (mounted) set({ products: (newData || []) as Product[], isLoading: false });
          } catch(e) {
            console.log("Not authorized to auto-seed products or table missing.");
            if (mounted) set({ products: [], isLoading: false });
          }
        }
      } catch (error) {
        console.warn("Supabase Error in products:", error);
        if (mounted) set({ products: [], isLoading: false });
      }
    };

    fetchProducts();

    let channel: any = null;
    if (isSupabaseConfigured) {
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
      while (result.error && (result.error.code === 'PGRST204' || result.error.code === '42703')) {
        const match = result.error.message.match(/Could not find the '([^']+)' column/) || result.error.message.match(/column "([^"]+)" of relation/);
        if (match && match[1]) {
          const col = match[1];
          delete (productToSave as any)[col];
          result = await supabase.from('products').insert([productToSave]);
        } else {
          break;
        }
      }
      
      if (result.error) {
        handleDBError(result.error, 'products');
        throw result.error;
      }
      
      // We don't need to manually update state here because the Realtime subscription (postgres_changes) 
      // will catch the insert and call fetchProducts(). Or we can optimistically update AFTER success.
      set((state) => {
        const exists = state.products.find(p => p.id === product.id);
        if (!exists) {
          return { products: [...state.products, product] };
        }
        return state;
      });
    } catch (error) {
      console.warn("Failed to add product:", error);
      throw error;
    }
  },
  updateProduct: async (id, updatedProduct) => {
    if (!isSupabaseConfigured) return;
    try {
      let productToSave = { ...updatedProduct };

      let result = await supabase.from('products').update(productToSave).eq('id', id);
      
      // Dynamically strip any columns that don't exist in the database schema yet
      while (result.error && (result.error.code === 'PGRST204' || result.error.code === '42703')) {
        const match = result.error.message.match(/Could not find the '([^']+)' column/) || result.error.message.match(/column "([^"]+)" of relation/);
        if (match && match[1]) {
          const col = match[1];
          delete (productToSave as any)[col];
          result = await supabase.from('products').update(productToSave).eq('id', id);
        } else {
          break;
        }
      }

      if (result.error) {
        handleDBError(result.error, 'products');
        throw result.error;
      }
      
      // Update local state on actual DB success for instant UI feedback
      set((state) => ({ 
        products: state.products.map(p => p.id === id ? { ...p, ...updatedProduct } : p) 
      }));
    } catch (error) {
      console.warn("Failed to update product:", error);
      throw error;
    }
  },
  deleteProduct: async (id) => {
    if (!isSupabaseConfigured) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) {
        handleDBError(error, 'products');
        throw error;
      }
      
      // Update local state on actual DB success for instant UI feedback
      set((state) => ({ products: state.products.filter(p => p.id !== id) }));
    } catch (error) {
      console.warn("Failed to delete product:", error);
      throw error;
    }
  },
}));
