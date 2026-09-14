const fs = require('fs');
let code = fs.readFileSync('src/store/useLandingPageStore.ts', 'utf8');

// Always write to localStorage
code = code.replace(/if \(!isSupabaseConfigured\) localStorage\.setItem/g, "localStorage.setItem");

// In initializeStore, if Supabase fails (e.g., table missing), load from local
const newInit = `
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
`;

code = code.replace(/if \(!isSupabaseConfigured\) \{[\s\S]*?\} catch \(error\) \{[\s\S]*?if \(mounted\) set\(\{ isLoading: false \}\);\n      \}/, newInit.trim());

fs.writeFileSync('src/store/useLandingPageStore.ts', code);
