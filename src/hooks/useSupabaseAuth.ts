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
          // Fetch existing profile
          let { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          // If no profile exists (PGRST116), create one! This is common for Google Sign-ins.
          if (error && error.code === 'PGRST116') {
            console.log("No profile found, creating one for:", session.user.email);
            
            // Generate a default name if not available
            let fullName = session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'Customer';
            if (fullName === 'Customer' && session.user.email) {
              fullName = session.user.email.split('@')[0];
            }

            const newProfile = {
              id: session.user.id,
              email: session.user.email,
              full_name: fullName,
              role: 'customer',
              created_at: new Date().toISOString()
            };

            const { data: createdProfile, error: insertError } = await supabase
              .from('profiles')
              .insert(newProfile)
              .select()
              .single();

            if (!insertError && createdProfile) {
              profile = createdProfile;
            } else {
              console.warn("Failed to create profile on sign-in:", insertError);
              // Fallback to minimal data if insert fails
              profile = newProfile;
            }
          } else if (error) {
            console.warn("Profile fetch error in onAuthStateChange:", error);
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
          console.warn("Auth state error:", error);
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
