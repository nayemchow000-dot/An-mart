const fs = require('fs');
let code = fs.readFileSync('src/store/useLandingPageStore.ts', 'utf8');

code = code.replace(/if \(!isSupabaseConfigured\) {[\s\S]*?return;[\s\S]*?}/, `if (!isSupabaseConfigured) {
        const local = localStorage.getItem('anmart_landing_pages');
        if (local) {
          if (mounted) set({ pages: JSON.parse(local), isLoading: false });
        } else {
          if (mounted) set({ isLoading: false });
        }
        return;
      }`);

code = code.replace(/addPage: async \(pageData\) => {[\s\S]*?},/, `addPage: async (pageData) => {
    const newPage = { ...pageData, createdAt: new Date().toISOString() };
    
    // Always update local state for immediate feedback
    set((state) => {
      const newPages = [newPage, ...state.pages];
      if (!isSupabaseConfigured) localStorage.setItem('anmart_landing_pages', JSON.stringify(newPages));
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
  },`);

code = code.replace(/updatePage: async \(id, updatedPage\) => {[\s\S]*?},/, `updatePage: async (id, updatedPage) => {
    // Always update local state
    set((state) => {
      const newPages = state.pages.map(p => p.id === id ? { ...p, ...updatedPage } : p);
      if (!isSupabaseConfigured) localStorage.setItem('anmart_landing_pages', JSON.stringify(newPages));
      return { pages: newPages };
    });

    if (!isSupabaseConfigured) return;

    try {
      const { error } = await supabase.from('landing_pages').update(updatedPage).eq('id', id);
      if (error) throw error;
    } catch (error: any) {
      handleDBError(error, 'landing_pages');
    }
  },`);

code = code.replace(/deletePage: async \(id\) => {[\s\S]*?},/, `deletePage: async (id) => {
    set((state) => {
      const newPages = state.pages.filter(p => p.id !== id);
      if (!isSupabaseConfigured) localStorage.setItem('anmart_landing_pages', JSON.stringify(newPages));
      return { pages: newPages };
    });

    if (!isSupabaseConfigured) return;

    try {
      const { error } = await supabase.from('landing_pages').delete().eq('id', id);
      if (error) throw error;
    } catch (error: any) {
      handleDBError(error, 'landing_pages');
    }
  },`);

fs.writeFileSync('src/store/useLandingPageStore.ts', code);
