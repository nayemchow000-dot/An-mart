export type ImportStatus = 'waiting' | 'analyzing' | 'extracting' | 'processing' | 'uploading_images' | 'ready' | 'imported' | 'failed' | 'duplicate' | 'requires_review';

export interface ImportItem {
  id: string;
  sourceUrl: string;
  status: ImportStatus;
  productData?: any; // The extracted/transformed data matching Product interface
  errorMessage?: string;
  importedImages?: string[]; // Permanent Cloudinary URLs
  originalImages?: string[]; // Extracted source images
  progress?: number;
}

export interface ImportSettings {
  defaultCategory: string;
  defaultStock: number;
  priceRuleType: 'none' | 'add_fixed' | 'add_percent' | 'manual';
  priceRuleValue: number;
  deliveryCharge: number;
  deliveryTime: string;
  isCodAvailable: boolean;
  defaultStatus: 'draft' | 'published' | 'unpublished';
}
