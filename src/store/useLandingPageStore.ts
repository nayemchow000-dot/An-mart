import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { handleDBError } from '../utils/dbErrorHandling';
import { v4 as uuidv4 } from 'uuid';

export interface LandingPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

interface LandingPageState {
  pages: LandingPage[];
  isLoading: boolean;
  initializeStore: () => () => void;
  addPage: (page: Omit<LandingPage, 'createdAt'>) => Promise<void>;
  updatePage: (id: string, updatedPage: Partial<LandingPage>) => Promise<void>;
  deletePage: (id: string) => Promise<void>;
}

export const useLandingPageStore = create<LandingPageState>((set) => ({
  pages: [],
  isLoading: true,
  
  initializeStore: () => {
    let mounted = true;
    
    const fetchPages = async () => {
      if (!isSupabaseConfigured) {
        if (mounted) set({ isLoading: false });
        return;
      }
      try {
        const { data, error } = await supabase.from('landing_pages').select('*').order('createdAt', { ascending: false });
        
        if (error) {
          if (error.code !== '42P01') handleDBError(error, 'landing_pages');
          if (mounted) set({ isLoading: false });
          return;
        }
        
        if (data && mounted) {
          set({ pages: data as LandingPage[], isLoading: false });
        }
      } catch (error) {
        console.warn("Fetch landing_pages exception:", error);
        if (mounted) set({ isLoading: false });
      }
    };

    fetchPages();

    let channel: any = null;
    if (isSupabaseConfigured) {
      channel = supabase.channel('landing_pages_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'landing_pages' }, fetchPages)
        .subscribe();
    }

    return () => {
      mounted = false;
      if (channel) supabase.removeChannel(channel);
    };
  },

  addPage: async (pageData) => {
    if (!isSupabaseConfigured) return;
    try {
      const { error } = await supabase.from('landing_pages').insert([{ ...pageData, createdAt: new Date().toISOString() }]);
      if (error) throw error;
    } catch (error: any) {
      handleDBError(error, 'landing_pages');
      throw error;
    }
  },

  updatePage: async (id, updatedPage) => {
    if (!isSupabaseConfigured) return;
    try {
      const { error } = await supabase.from('landing_pages').update(updatedPage).eq('id', id);
      if (error) throw error;
    } catch (error: any) {
      handleDBError(error, 'landing_pages');
      throw error;
    }
  },

  deletePage: async (id) => {
    if (!isSupabaseConfigured) return;
    try {
      const { error } = await supabase.from('landing_pages').delete().eq('id', id);
      if (error) throw error;
    } catch (error: any) {
      handleDBError(error, 'landing_pages');
      throw error;
    }
  },
}));
