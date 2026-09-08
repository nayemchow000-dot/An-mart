import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { handleDBError } from '../utils/dbErrorHandling';
import { v4 as uuidv4 } from 'uuid';

export interface SupportSettings {
  id: string;
  phone: string;
  email: string;
  whatsapp: string;
  messenger: string;
  address: string;
  updatedAt: string;
}

export interface SupportMessage {
  id: string;
  name: string;
  phone: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  createdAt: string;
}

interface SupportState {
  settings: SupportSettings | null;
  messages: SupportMessage[];
  isLoading: boolean;
  initializeStore: () => () => void;
  updateSettings: (settings: Partial<SupportSettings>) => Promise<void>;
  sendMessage: (message: Omit<SupportMessage, 'id' | 'status' | 'createdAt'>) => Promise<void>;
  updateMessageStatus: (id: string, status: 'unread' | 'read' | 'replied') => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
}

export const useSupportStore = create<SupportState>((set, get) => ({
  settings: null,
  messages: [],
  isLoading: true,
  
  initializeStore: () => {
    let mounted = true;
    
    const fetchData = async () => {
      if (!isSupabaseConfigured) {
        if (mounted) set({ isLoading: false });
        return;
      }
      try {
        // Fetch Settings
        const { data: settingsData, error: settingsError } = await supabase
          .from('support_settings')
          .select('*')
          .limit(1)
          .single();
          
        if (settingsError && settingsError.code !== 'PGRST116' && settingsError.code !== '42P01') {
          console.warn("Settings error:", settingsError);
        }
        
        // Fetch Messages
        const { data: messagesData, error: messagesError } = await supabase
          .from('support_messages')
          .select('*')
          .order('createdAt', { ascending: false });
          
        if (messagesError && messagesError.code !== '42P01') {
          console.warn("Messages error:", messagesError);
        }
        
        if (mounted) {
          set({ 
            settings: settingsData || {
              id: 'default',
              phone: '+880 1234-567890',
              email: 'support@anmart.com',
              whatsapp: '8801234567890',
              messenger: 'anmart',
              address: 'House 12, Road 5, Block C, Banani, Dhaka'
            }, 
            messages: messagesData || [], 
            isLoading: false 
          });
        }
      } catch (error) {
        console.warn("Fetch support exception:", error);
        if (mounted) set({ isLoading: false });
      }
    };

    fetchData();

    let channelSettings: any = null;
    let channelMessages: any = null;
    
    if (isSupabaseConfigured) {
      channelSettings = supabase.channel('support_settings_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'support_settings' }, fetchData)
        .subscribe();
        
      channelMessages = supabase.channel('support_messages_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'support_messages' }, fetchData)
        .subscribe();
    }

    return () => {
      mounted = false;
      if (channelSettings) supabase.removeChannel(channelSettings);
      if (channelMessages) supabase.removeChannel(channelMessages);
    };
  },

  updateSettings: async (updatedSettings) => {
    if (!isSupabaseConfigured) {
      set((state) => ({ settings: { ...state.settings, ...updatedSettings } as SupportSettings }));
      return;
    }
    try {
      const currentSettings = get().settings;
      if (!currentSettings || currentSettings.id === 'default') {
        const { error } = await supabase.from('support_settings').insert([{ 
          id: uuidv4(), 
          ...updatedSettings,
          updatedAt: new Date().toISOString()
        }]);
        if (error) { handleDBError(error, 'support_settings'); throw error; }
      } else {
        const { error } = await supabase.from('support_settings').update({
          ...updatedSettings,
          updatedAt: new Date().toISOString()
        }).eq('id', currentSettings.id);
        if (error) { handleDBError(error, 'support_settings'); throw error; }
      }
    } catch (error: any) {
      handleDBError(error, 'support_settings');
      throw error;
    }
  },

  sendMessage: async (messageData) => {
    if (!isSupabaseConfigured) return;
    try {
      const { error } = await supabase.from('support_messages').insert([{ 
        id: uuidv4(), 
        ...messageData,
        status: 'unread',
        createdAt: new Date().toISOString()
      }]);
      if (error) { handleDBError(error, 'support_messages'); throw error; }
    } catch (error: any) {
      handleDBError(error, 'support_messages');
      throw error;
    }
  },

  updateMessageStatus: async (id, status) => {
    if (!isSupabaseConfigured) return;
    try {
      const { error } = await supabase.from('support_messages').update({ status }).eq('id', id);
      if (error) { handleDBError(error, 'support_messages'); throw error; }
    } catch (error: any) {
      handleDBError(error, 'support_messages');
      throw error;
    }
  },
  
  deleteMessage: async (id) => {
    if (!isSupabaseConfigured) return;
    try {
      const { error } = await supabase.from('support_messages').delete().eq('id', id);
      if (error) { handleDBError(error, 'support_messages'); throw error; }
    } catch (error: any) {
      handleDBError(error, 'support_messages');
      throw error;
    }
  }
}));
