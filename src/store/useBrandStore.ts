import { create } from 'zustand';
import { Brand } from '../types';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { v4 as uuidv4 } from 'uuid';

interface BrandState {
  brands: Brand[];
  isLoading: boolean;
  initializeStore: () => () => void;
  addBrand: (brand: Omit<Brand, 'id' | 'createdAt'>) => Promise<void>;
  updateBrand: (id: string, updatedBrand: Partial<Brand>) => Promise<void>;
  deleteBrand: (id: string) => Promise<void>;
}

export const useBrandStore = create<BrandState>((set, get) => ({
  brands: [],
  isLoading: true,

  initializeStore: () => {
    let mounted = true;

    const fetchBrands = async () => {
      if (!isSupabaseConfigured) {
        if (mounted) set({ isLoading: false });
        return;
      }
      try {
        const { data, error } = await supabase.from('brands').select('*').order('name', { ascending: true });
        if (error) {
          if (error.code !== '42P01' && error.code !== 'PGRST205') { // Ignore table not found error for now
            console.error("Supabase Error in brands:", error);
          }
          if (mounted) set({ isLoading: false });
          return;
        }
        
        if (data && mounted) {
          set({ brands: data as Brand[], isLoading: false });
        }
      } catch (error) {
        console.error("Fetch brands exception:", error);
        if (mounted) set({ isLoading: false });
      }
    };

    fetchBrands();

    let channel: any = null;
    if (isSupabaseConfigured) {
      channel = supabase.channel('brands_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'brands' }, fetchBrands)
        .subscribe();
    }

    return () => {
      mounted = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  },

  addBrand: async (brandData) => {
    if (!isSupabaseConfigured) {
      const newBrand = { ...brandData, id: uuidv4(), createdAt: new Date().toISOString() };
      set((state) => ({ brands: [...state.brands, newBrand] }));
      return;
    }

    const { data, error } = await supabase
      .from('brands')
      .insert([brandData])
      .select()
      .single();

    if (error) {
      if (error.code === '42P01' || error.code === 'PGRST205') {
        const newBrand = { ...brandData, id: uuidv4(), createdAt: new Date().toISOString() };
        set((state) => ({ brands: [...state.brands, newBrand] }));
        return;
      }
      throw error;
    }
  },

  updateBrand: async (id, updatedBrand) => {
    if (!isSupabaseConfigured) {
      set((state) => ({
        brands: state.brands.map((b) => (b.id === id ? { ...b, ...updatedBrand, updatedAt: new Date().toISOString() } : b)),
      }));
      return;
    }

    const { error } = await supabase
      .from('brands')
      .update({ ...updatedBrand, updatedAt: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      if (error.code === '42P01' || error.code === 'PGRST205') {
        set((state) => ({
          brands: state.brands.map((b) => (b.id === id ? { ...b, ...updatedBrand, updatedAt: new Date().toISOString() } : b)),
        }));
        return;
      }
      throw error;
    }
  },

  deleteBrand: async (id) => {
    if (!isSupabaseConfigured) {
      set((state) => ({
        brands: state.brands.filter((b) => b.id !== id),
      }));
      return;
    }

    const { error } = await supabase.from('brands').delete().eq('id', id);
    
    if (error) {
      if (error.code === '42P01' || error.code === 'PGRST205') {
        set((state) => ({
          brands: state.brands.filter((b) => b.id !== id),
        }));
        return;
      }
      throw error;
    }
  },
}));
