import { useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { useAuthStore } from '../store/useAuthStore';

export function useSupabaseAuth() {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    let mounted = true;

    async function getInitialSession() {
      if (!isSupabaseConfigured) {
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (mounted) {
            setUser({
              uid: session.user.id,
              email: session.user.email!,
              name: profile?.full_name || session.user.user_metadata?.full_name || 'User',
              role: profile?.role || 'customer',
              phone: profile?.phone,
              createdAt: profile?.created_at || new Date().toISOString(),
              addresses: [], // Address management can be added later
            });
          }
        } else {
          if (mounted) setUser(null);
        }
      } catch (error) {
        console.error("Auth state error:", error);
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    getInitialSession();

    let subscription: any = null;
    
    if (isSupabaseConfigured) {
      const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          setUser({
            uid: session.user.id,
            email: session.user.email!,
            name: profile?.full_name || session.user.user_metadata?.full_name || 'User',
            role: profile?.role || 'customer',
            phone: profile?.phone,
            createdAt: profile?.created_at || new Date().toISOString(),
            addresses: [],
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      });
      subscription = data.subscription;
    }

    return () => {
      mounted = false;
      if (subscription) subscription.unsubscribe();
    };
  }, [setUser, setLoading]);
}
