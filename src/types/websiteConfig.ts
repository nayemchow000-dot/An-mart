export interface SectionConfig {
  id: string;
  type: string;
  isHidden: boolean;
  order: number;
  data: any;
}

export interface SiteConfig {
  theme: {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    font?: string;
  };
  branding: {
    logoUrl?: string;
    faviconUrl?: string;
    storeName?: string;
    contactEmail?: string;
    contactPhone?: string;
  };
  sections: SectionConfig[];
}

export const defaultSiteConfig: SiteConfig = {
  theme: {
    primaryColor: '#0ea5e9',
    secondaryColor: '#f0f9ff',
  },
  branding: {
    storeName: 'AN Mart',
  },
  sections: [
    {
      id: 'hero-slider',
      type: 'hero',
      isHidden: false,
      order: 0,
      data: {
        slides: [
          {
            id: 'slide-1',
            imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
            title: 'Welcome to AN Mart',
            subtitle: 'Best products at the best prices',
            link: '/shop',
            buttonText: 'Shop Now'
          }
        ]
      }
    },
    {
      id: 'featured-categories',
      type: 'categories',
      isHidden: false,
      order: 1,
      data: {
        title: 'Shop by Category',
        categories: []
      }
    },
    {
      id: 'promotional-banners',
      type: 'banners',
      isHidden: false,
      order: 2,
      data: {
        banners: []
      }
    },
    {
      id: 'featured-products',
      type: 'products',
      isHidden: false,
      order: 3,
      data: {
        title: 'Featured Products',
        productIds: []
      }
    }
  ]
};
