export interface User {
  uid: string;
  email: string;
  name: string;
  phone?: string;
  role: 'customer' | 'admin';
  addresses?: Address[];
  createdAt: string;
}

export interface Address {
  id: string;
  title: string;
  division: string;
  district: string;
  area: string;
  street: string;
  isDefault: boolean;
}

export interface Category {
  id: string;
  name: string; // General Name
  nameBn?: string; // Bangla Name
  nameEn?: string; // English Name
  slug: string;
  image?: string;
  description?: string;
  displayOrder: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt?: string;
}

export interface ProductFAQ {
  question: string;
  answer: string;
}

export interface Product {
  id: string;
  
  // Basic Information
  title: string; // Product Name
  titleBn?: string; // Bengali Name
  shortTitle?: string;
  slug: string;
  brand?: string;
  sku?: string;
  productCode?: string;
  category: string; // Category ID or Name
  subcategory?: string;
  productType?: string;
  tags?: string[];

  // Pricing
  price: number;
  discountPrice?: number;
  discountPercentage?: number;
  discountAmount?: number;
  offerPrice?: number;
  isFlashSale?: boolean;

  // Inventory
  stock: number;
  lowStockThreshold?: number;
  stockStatus?: 'in_stock' | 'out_of_stock' | 'low_stock';
  isAvailable?: boolean;

  // Product Media
  images: string[]; // Main Image is images[0]
  thumbnail?: string;
  videoUrl?: string;
  detailImages?: string[];

  // Description
  shortDescription: string;
  description: string; // Full Description / English
  descriptionBn?: string; // Bengali Description

  // Rich Content
  ingredients?: string;
  benefits?: string;
  howToUse?: string;
  features?: string[];
  specifications?: Record<string, string>;
  faqs?: ProductFAQ[];
  additionalInfo?: string;

  // Delivery
  deliveryCharge?: number;
  deliveryTime?: string;
  isCodAvailable?: boolean;

  // SEO
  seoTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;

  // Publishing & Status
  status: 'draft' | 'published' | 'unpublished';
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  
  createdAt: string;
  updatedAt?: string;
}

export interface CartItem extends Product {
  cartItemId: string;
  quantity: number;
  selectedVariant?: any;
}
