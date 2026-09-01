import { create } from 'zustand';
import { SiteConfig, defaultSiteConfig, SectionConfig } from '../types/websiteConfig';
import { db } from '../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

interface SiteConfigState {
  draftConfig: SiteConfig;
  publishedConfig: SiteConfig;
  hasUnsavedChanges: boolean;
  isLoading: boolean;
  
  initializeStore: () => Promise<void>;
  updateTheme: (themeUpdates: Partial<SiteConfig['theme']>) => void;
  updateBranding: (brandingUpdates: Partial<SiteConfig['branding']>) => void;
  updateSection: (sectionId: string, data: any) => void;
  reorderSections: (startIndex: number, endIndex: number) => void;
  toggleSectionVisibility: (sectionId: string) => void;
  
  publishChanges: () => Promise<void>;
  discardChanges: () => void;
}

export const useSiteConfigStore = create<SiteConfigState>((set, get) => ({
  draftConfig: JSON.parse(JSON.stringify(defaultSiteConfig)),
  publishedConfig: JSON.parse(JSON.stringify(defaultSiteConfig)),
  hasUnsavedChanges: false,
  isLoading: true,

  initializeStore: async () => {
    try {
      const docRef = doc(db, 'settings', 'website');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        set({
          publishedConfig: {
            ...defaultSiteConfig,
            ...(data.publishedConfig || {}),
            theme: { ...defaultSiteConfig.theme, ...(data.publishedConfig?.theme || {}) },
            branding: { ...defaultSiteConfig.branding, ...(data.publishedConfig?.branding || {}) },
            sections: data.publishedConfig?.sections || defaultSiteConfig.sections,
          },
          draftConfig: {
            ...defaultSiteConfig,
            ...(data.draftConfig || data.publishedConfig || {}),
            theme: { ...defaultSiteConfig.theme, ...(data.draftConfig?.theme || data.publishedConfig?.theme || {}) },
            branding: { ...defaultSiteConfig.branding, ...(data.draftConfig?.branding || data.publishedConfig?.branding || {}) },
            sections: data.draftConfig?.sections || data.publishedConfig?.sections || defaultSiteConfig.sections,
          },
          isLoading: false
        });
      } else {
        // Only attempt to initialize default in firestore if we might have permissions
        // For now, just set local state
        set({ isLoading: false });
        try {
          await setDoc(docRef, {
            publishedConfig: defaultSiteConfig,
            draftConfig: defaultSiteConfig
          });
        } catch(e) {
          console.log("Not authorized to write default settings. Using local defaults.");
        }
      }
    } catch (e) {
      console.error("Failed to load site config:", e);
      set({ isLoading: false });
    }
  },

  updateTheme: (themeUpdates) => set((state) => ({
    draftConfig: { ...state.draftConfig, theme: { ...state.draftConfig.theme, ...themeUpdates } },
    hasUnsavedChanges: true,
  })),

  updateBranding: (brandingUpdates) => set((state) => ({
    draftConfig: { ...state.draftConfig, branding: { ...state.draftConfig.branding, ...brandingUpdates } },
    hasUnsavedChanges: true,
  })),

  updateSection: (sectionId, data) => set((state) => ({
    draftConfig: {
      ...state.draftConfig,
      sections: state.draftConfig.sections.map(sec => 
        sec.id === sectionId ? { ...sec, data: { ...sec.data, ...data } } : sec
      )
    },
    hasUnsavedChanges: true,
  })),

  reorderSections: (startIndex, endIndex) => set((state) => {
    const result = Array.from(state.draftConfig.sections);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    
    // Update order values
    const orderedResult = result.map((sec, index) => ({ ...sec, order: index }));
    
    return {
      draftConfig: { ...state.draftConfig, sections: orderedResult },
      hasUnsavedChanges: true,
    };
  }),

  toggleSectionVisibility: (sectionId) => set((state) => ({
    draftConfig: {
      ...state.draftConfig,
      sections: state.draftConfig.sections.map(sec => 
        sec.id === sectionId ? { ...sec, isHidden: !sec.isHidden } : sec
      )
    },
    hasUnsavedChanges: true,
  })),

  publishChanges: async () => {
    const { draftConfig } = get();
    try {
      await setDoc(doc(db, 'settings', 'website'), {
        draftConfig: draftConfig,
        publishedConfig: draftConfig
      }, { merge: true });

      set((state) => ({
        publishedConfig: JSON.parse(JSON.stringify(state.draftConfig)),
        hasUnsavedChanges: false,
      }));
      toast.success('Website changes published successfully!');
    } catch (error) {
      console.error('Failed to publish changes', error);
      toast.error('Failed to publish changes');
    }
  },

  discardChanges: () => {
    set((state) => ({
      draftConfig: JSON.parse(JSON.stringify(state.publishedConfig)),
      hasUnsavedChanges: false,
    }));
    toast.success('Changes discarded. Restored to last published version.');
  },
}));
