import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { handleDBError } from '../utils/dbErrorHandling';
import { v4 as uuidv4 } from 'uuid';

export interface Offer {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

interface OfferState {
  offers: Offer[];
  isLoading: boolean;
  initializeStore: () => () => void;
  addOffer: (offer: Omit<Offer, 'createdAt'>) => Promise<void>;
  updateOffer: (id: string, updatedOffer: Partial<Offer>) => Promise<void>;
  deleteOffer: (id: string) => Promise<void>;
}

export const useOfferStore = create<OfferState>((set) => ({
  offers: [],
  isLoading: true,
  
  initializeStore: () => {
    let mounted = true;
    
    const fetchOffers = async () => {
      if (!isSupabaseConfigured) {
        if (mounted) set({ isLoading: false });
        return;
      }
      try {
        const { data, error } = await supabase.from('offers').select('*').order('createdAt', { ascending: false });
        
        if (error) {
          if (error.code !== '42P01') handleDBError(error, 'offers');
          if (mounted) set({ isLoading: false });
          return;
        }
        
        if (data && mounted) {
          set({ offers: data as Offer[], isLoading: false });
        }
      } catch (error) {
        console.warn("Fetch offers exception:", error);
        if (mounted) set({ isLoading: false });
      }
    };

    fetchOffers();

    let channel: any = null;
    if (isSupabaseConfigured) {
      channel = supabase.channel('offers_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'offers' }, fetchOffers)
        .subscribe();
    }

    return () => {
      mounted = false;
      if (channel) supabase.removeChannel(channel);
    };
  },

  addOffer: async (offerData) => {
    if (!isSupabaseConfigured) return;
    try {
      const { error } = await supabase.from('offers').insert([{ ...offerData, createdAt: new Date().toISOString() }]);
      if (error) throw error;
    } catch (error: any) {
      handleDBError(error, 'offers');
      throw error;
    }
  },

  updateOffer: async (id, updatedOffer) => {
    if (!isSupabaseConfigured) return;
    try {
      const { error } = await supabase.from('offers').update(updatedOffer).eq('id', id);
      if (error) throw error;
    } catch (error: any) {
      handleDBError(error, 'offers');
      throw error;
    }
  },

  deleteOffer: async (id) => {
    if (!isSupabaseConfigured) return;
    try {
      const { error } = await supabase.from('offers').delete().eq('id', id);
      if (error) throw error;
    } catch (error: any) {
      handleDBError(error, 'offers');
      throw error;
    }
  },
}));
