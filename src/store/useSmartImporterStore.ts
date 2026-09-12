import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { ImportItem, ImportSettings } from '../types/importer';
import { extractProductData, uploadRemoteImageToCloudinary } from '../services/importer/api';
import { supabase, isSupabaseConfigured } from '../config/supabase';

interface ImporterState {
  items: ImportItem[];
  settings: ImportSettings;
  isImporting: boolean;
  
  // Actions
  addUrls: (urls: string[]) => void;
  removeItems: (ids: string[]) => void;
  updateSettings: (settings: Partial<ImportSettings>) => void;
  startImport: () => Promise<void>;
  retryFailed: () => Promise<void>;
  clearAll: () => void;
  updateItem: (id: string, updates: Partial<ImportItem>) => void;
  importSelectedToStore: (ids: string[]) => Promise<void>;
}

const generateSlug = (title: string): string => {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);
};

const generateSku = (brand: string, title: string): string => {
  const b = (brand || 'ANM').substring(0, 3).toUpperCase();
  const t = title.substring(0, 3).toUpperCase();
  return `${b}-${t}-${Math.floor(Math.random() * 10000)}`;
};

export const useSmartImporterStore = create<ImporterState>((set, get) => ({
  items: [],
  settings: {
    defaultCategory: 'Uncategorized',
    defaultStock: 10,
    priceRuleType: 'none',
    priceRuleValue: 0,
    deliveryCharge: 60,
    deliveryTime: '2-3 Days',
    isCodAvailable: true,
    defaultStatus: 'draft'
  },
  isImporting: false,

  addUrls: (urls) => {
    const newItems = urls.map(url => ({
      id: uuidv4(),
      sourceUrl: url.trim(),
      status: 'waiting' as const
    }));
    set(state => ({ items: [...state.items, ...newItems] }));
  },

  removeItems: (ids) => {
    set(state => ({ items: state.items.filter(item => !ids.includes(item.id)) }));
  },

  updateSettings: (newSettings) => {
    set(state => ({ settings: { ...state.settings, ...newSettings } }));
  },

  updateItem: (id, updates) => {
    set(state => ({
      items: state.items.map(item => item.id === id ? { ...item, ...updates } : item)
    }));
  },

  clearAll: () => set({ items: [] }),

  startImport: async () => {
    const { items, settings, updateItem } = get();
    const pendingItems = items.filter(i => i.status === 'waiting' || i.status === 'failed');
    
    if (pendingItems.length === 0) return;
    
    set({ isImporting: true });

    // Process concurrently with a limit of 3
    const CONCURRENCY = 3;
    const processItem = async (item: ImportItem) => {
      try {
        updateItem(item.id, { status: 'analyzing' });
        
        // 1. Extract Data via Gemini
        updateItem(item.id, { status: 'extracting' });
        const extractedData = await extractProductData(item.sourceUrl);
        
        // 2. Transform & Apply Settings
        updateItem(item.id, { status: 'processing' });
        
        let finalPrice = extractedData.price || 0;
        if (settings.priceRuleType === 'add_fixed') finalPrice += settings.priceRuleValue;
        if (settings.priceRuleType === 'add_percent') finalPrice += finalPrice * (settings.priceRuleValue / 100);

        const transformedProduct: any = {
          title: extractedData.title,
          titleBn: extractedData.titleBn || '',
          slug: generateSlug(extractedData.title),
          brand: extractedData.brand || '',
          sku: extractedData.sku || generateSku(extractedData.brand, extractedData.title),
          category: extractedData.category || settings.defaultCategory,
          shortDescription: extractedData.shortDescription || '',
          description: extractedData.description || '',
          descriptionBn: extractedData.descriptionBn || '',
          ingredients: extractedData.ingredients || '',
          benefits: extractedData.benefits || '',
          howToUse: extractedData.howToUse || '',
          price: finalPrice,
          stock: settings.defaultStock,
          stockStatus: extractedData.stockStatus || 'in_stock',
          status: settings.defaultStatus,
          deliveryCharge: settings.deliveryCharge,
          deliveryTime: settings.deliveryTime,
          isCodAvailable: settings.isCodAvailable,
          features: extractedData.features || []
        };

        const originalImages = extractedData.images || [];
        updateItem(item.id, { 
          productData: transformedProduct,
          originalImages
        });

        // 3. Upload Images to Cloudinary
        if (originalImages.length > 0) {
          updateItem(item.id, { status: 'uploading_images' });
          const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
          const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
          
          if (cloudName && uploadPreset) {
            const uploadedUrls = [];
            for (const imgUrl of originalImages) {
              try {
                const secureUrl = await uploadRemoteImageToCloudinary(imgUrl, cloudName, uploadPreset);
                uploadedUrls.push(secureUrl);
              } catch (e) {
                console.warn(`Failed to upload image ${imgUrl}`, e);
              }
            }
            
            transformedProduct.images = uploadedUrls;
            if (uploadedUrls.length > 0) transformedProduct.thumbnail = uploadedUrls[0];
            
            updateItem(item.id, { 
              importedImages: uploadedUrls,
              productData: transformedProduct
            });
          } else {
            console.warn("Cloudinary not configured. Skipping image upload.");
          }
        }

        updateItem(item.id, { status: 'ready' });

      } catch (error: any) {
        updateItem(item.id, { 
          status: 'failed', 
          errorMessage: error.message || 'Unknown error occurred' 
        });
      }
    };

    // Execute with concurrency
    for (let i = 0; i < pendingItems.length; i += CONCURRENCY) {
      const chunk = pendingItems.slice(i, i + CONCURRENCY);
      await Promise.all(chunk.map(processItem));
    }

    set({ isImporting: false });
  },

  retryFailed: async () => {
    get().startImport();
  },

  importSelectedToStore: async (ids: string[]) => {
    if (!isSupabaseConfigured) {
       console.error("Supabase not configured");
       return;
    }
    
    const { items, updateItem } = get();
    const itemsToImport = items.filter(i => ids.includes(i.id) && i.status === 'ready' && i.productData);

    for (const item of itemsToImport) {
      try {
        let productData = { ...item.productData };
        productData.id = uuidv4();
        
        let result = await supabase.from('products').insert([productData]);
        
        // Dynamically strip any columns that don't exist in the database schema yet
        while (result.error && (result.error.code === 'PGRST204' || result.error.code === '42703')) {
          const match = result.error.message.match(/Could not find the '([^']+)' column/) || result.error.message.match(/column "([^"]+)" of relation/);
          if (match && match[1]) {
            const col = match[1];
            delete (productData as any)[col];
            result = await supabase.from('products').insert([productData]);
          } else {
            break;
          }
        }

        if (result.error) {
          if (result.error.code === '23505') { // Duplicate unique constraint
            updateItem(item.id, { status: 'duplicate', errorMessage: 'Duplicate SKU or Slug found in database' });
          } else {
            updateItem(item.id, { status: 'failed', errorMessage: result.error.message });
          }
        } else {
          updateItem(item.id, { status: 'imported' });
        }
      } catch (error: any) {
        updateItem(item.id, { status: 'failed', errorMessage: error.message });
      }
    }
  }
}));
