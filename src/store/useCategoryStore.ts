import { create } from 'zustand';
import { Category } from '../types';
import { supabase, isSupabaseConfigured } from '../config/supabase';

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  initializeStore: () => () => void;
  addCategory: (category: Category) => Promise<void>;
  updateCategory: (id: string, updatedCategory: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set) => ({
  categories: [],
  isLoading: true,
  initializeStore: () => {
    let mounted = true;

    const fetchCategories = async () => {
      if (!isSupabaseConfigured) {
        console.log("Supabase is not configured. Categories will be empty.");
        if (mounted) set({ isLoading: false });
        return;
      }
      try {
        const { data, error } = await supabase.from('categories').select('*');
        if (error) throw error;
        
        if (data && mounted) {
          const categoriesData = data as Category[];
          categoriesData.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
          set({ categories: categoriesData, isLoading: false });
        }
      } catch (error) {
        console.error("Supabase Error in categories:", error);
        if (mounted) set({ isLoading: false });
      }
    };

    fetchCategories();

    let channel: any = null;
    if (isSupabaseConfigured) {
      channel = supabase.channel('categories_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, fetchCategories)
        .subscribe();
    }

    return () => {
      mounted = false;
      if (channel) supabase.removeChannel(channel);
    };
  },
  addCategory: async (category) => {
    if (!isSupabaseConfigured) return;
    try {
      const { error } = await supabase.from('categories').insert([category]);
      if (error) throw error;
    } catch (error) {
      console.error("Failed to add category:", error);
      throw error;
    }
  },
  updateCategory: async (id, updatedCategory) => {
    if (!isSupabaseConfigured) return;
    try {
      const { error } = await supabase.from('categories').update(updatedCategory).eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error("Failed to update category:", error);
      throw error;
    }
  },
  deleteCategory: async (id) => {
    if (!isSupabaseConfigured) return;
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error("Failed to delete category:", error);
      throw error;
    }
  },
}));
