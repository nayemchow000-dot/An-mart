import { create } from 'zustand';
import { Product } from '../types';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { mockProducts } from '../data/mockProducts';

interface ProductState {
  products: Product[];
  isLoading: boolean;
  initializeStore: () => () => void;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (id: string, updatedProduct: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
}

export const useProductStore = create<ProductState>((set) => ({
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
        
        if (error) throw error;
        
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
            if (mounted) set({ products: mockProducts, isLoading: false });
          }
        }
      } catch (error) {
        console.error("Supabase Error in products:", error);
        console.log("Falling back to mock products due to Supabase error.");
        if (mounted) set({ products: mockProducts, isLoading: false });
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
      const { error } = await supabase.from('products').insert([product]);
      if (error) throw error;
    } catch (error) {
      console.error("Failed to add product:", error);
      throw error;
    }
  },
  updateProduct: async (id, updatedProduct) => {
    if (!isSupabaseConfigured) return;
    try {
      const { error } = await supabase.from('products').update(updatedProduct).eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error("Failed to update product:", error);
      throw error;
    }
  },
  deleteProduct: async (id) => {
    if (!isSupabaseConfigured) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error("Failed to delete product:", error);
      throw error;
    }
  },
}));
