import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { handleDBError } from '../utils/dbErrorHandling';
import { v4 as uuidv4 } from 'uuid';

export interface Coupon {
  id: string;
  code: string;
  discount: string;
  minOrder: number;
  expiry: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

interface CouponState {
  coupons: Coupon[];
  isLoading: boolean;
  initializeStore: () => () => void;
  addCoupon: (coupon: Omit<Coupon, 'createdAt'>) => Promise<void>;
  updateCoupon: (id: string, updatedCoupon: Partial<Coupon>) => Promise<void>;
  deleteCoupon: (id: string) => Promise<void>;
}

export const useCouponStore = create<CouponState>((set) => ({
  coupons: [],
  isLoading: true,
  
  initializeStore: () => {
    let mounted = true;
    
    const fetchCoupons = async () => {
      if (!isSupabaseConfigured) {
        if (mounted) set({ isLoading: false });
        return;
      }
      try {
        const { data, error } = await supabase.from('coupons').select('*').order('createdAt', { ascending: false });
        
        if (error) {
          if (error.code !== '42P01') handleDBError(error, 'coupons');
          if (mounted) set({ isLoading: false });
          return;
        }
        
        if (data && mounted) {
          set({ coupons: data as Coupon[], isLoading: false });
        }
      } catch (error) {
        console.warn("Fetch coupons exception:", error);
        if (mounted) set({ isLoading: false });
      }
    };

    fetchCoupons();

    let channel: any = null;
    if (isSupabaseConfigured) {
      channel = supabase.channel('coupons_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'coupons' }, fetchCoupons)
        .subscribe();
    }

    return () => {
      mounted = false;
      if (channel) supabase.removeChannel(channel);
    };
  },

  addCoupon: async (couponData) => {
    if (!isSupabaseConfigured) return;
    try {
      const { error } = await supabase.from('coupons').insert([{ ...couponData, createdAt: new Date().toISOString() }]);
      if (error) throw error;
    } catch (error: any) {
      handleDBError(error, 'coupons');
      throw error;
    }
  },

  updateCoupon: async (id, updatedCoupon) => {
    if (!isSupabaseConfigured) return;
    try {
      const { error } = await supabase.from('coupons').update(updatedCoupon).eq('id', id);
      if (error) throw error;
    } catch (error: any) {
      handleDBError(error, 'coupons');
      throw error;
    }
  },

  deleteCoupon: async (id) => {
    if (!isSupabaseConfigured) return;
    try {
      const { error } = await supabase.from('coupons').delete().eq('id', id);
      if (error) throw error;
    } catch (error: any) {
      handleDBError(error, 'coupons');
      throw error;
    }
  },
}));
