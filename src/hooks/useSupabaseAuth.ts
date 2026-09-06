import { useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { useAuthStore } from '../store/useAuthStore';

export function useSupabaseAuth() {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    let mounted = true;

    if (!isSupabaseConfigured) {
      if (mounted) {
        setUser(null);
        setLoading(false);
      }
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`Auth event: ${event}`, session?.user?.id);
      
      if (!mounted) return;

      if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
        return;
      }

      if (session?.user) {
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (error && error.code !== 'PGRST116') {
            console.error("Profile fetch error in onAuthStateChange:", error);
          }

          if (mounted) {
            setUser({
              uid: session.user.id,
              email: session.user.email!,
              name: profile?.full_name || session.user.user_metadata?.full_name || 'User',
              role: profile?.role || 'customer',
              phone: profile?.phone,
              createdAt: profile?.created_at || session.user.created_at || new Date().toISOString(),
              addresses: [],
            });
          }
        } catch (error) {
          console.error("Auth state error:", error);
        } finally {
          if (mounted) setLoading(false);
        }
      } else {
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [setUser, setLoading]);
}
