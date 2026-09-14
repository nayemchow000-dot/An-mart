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
        const local = localStorage.getItem('anmart_landing_pages');
        if (local && mounted) set({ pages: JSON.parse(local), isLoading: false });
        else if (mounted) set({ isLoading: false });
        return;
      }
      try {
        const { data, error } = await supabase.from('landing_pages').select('*').order('createdAt', { ascending: false });
        
        if (error) {
          if (error.code !== '42P01') handleDBError(error, 'landing_pages');
          // Load local on DB error
          const local = localStorage.getItem('anmart_landing_pages');
          if (local && mounted) set({ pages: JSON.parse(local), isLoading: false });
          else if (mounted) set({ isLoading: false });
          return;
        }
        
        if (data && mounted) {
          set({ pages: data as LandingPage[], isLoading: false });
          localStorage.setItem('anmart_landing_pages', JSON.stringify(data));
        }
      } catch (error) {
        console.warn("Fetch landing_pages exception:", error);
        const local = localStorage.getItem('anmart_landing_pages');
        if (local && mounted) set({ pages: JSON.parse(local), isLoading: false });
        else if (mounted) set({ isLoading: false });
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
    const newPage = { ...pageData, createdAt: new Date().toISOString() };
    
    // Always update local state for immediate feedback
    set((state) => {
      const newPages = [newPage, ...state.pages];
      localStorage.setItem('anmart_landing_pages', JSON.stringify(newPages));
      return { pages: newPages };
    });

    if (!isSupabaseConfigured) return;

    try {
      const { error } = await supabase.from('landing_pages').insert([newPage]);
      if (error) throw error;
    } catch (error: any) {
      handleDBError(error, 'landing_pages');
      // don't throw, let local state persist
    }
  },

  updatePage: async (id, updatedPage) => {
    // Always update local state
    set((state) => {
      const newPages = state.pages.map(p => p.id === id ? { ...p, ...updatedPage } : p);
      localStorage.setItem('anmart_landing_pages', JSON.stringify(newPages));
      return { pages: newPages };
    });

    if (!isSupabaseConfigured) return;

    try {
      const { error } = await supabase.from('landing_pages').update(updatedPage).eq('id', id);
      if (error) throw error;
    } catch (error: any) {
      handleDBError(error, 'landing_pages');
    }
  },

  deletePage: async (id) => {
    set((state) => {
      const newPages = state.pages.filter(p => p.id !== id);
      localStorage.setItem('anmart_landing_pages', JSON.stringify(newPages));
      return { pages: newPages };
    });

    if (!isSupabaseConfigured) return;

    try {
      const { error } = await supabase.from('landing_pages').delete().eq('id', id);
      if (error) throw error;
    } catch (error: any) {
      handleDBError(error, 'landing_pages');
    }
  },
}));
