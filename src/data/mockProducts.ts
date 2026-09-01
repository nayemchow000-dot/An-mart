import { Product } from '../types';

export const mockProducts: Product[] = [
  {
    id: '1',
    slug: 'luxe-matte-lipstick-rose-wood',
    title: 'Luxe Matte Lipstick - Rose Wood',
    shortDescription: 'Long-lasting, hydrating matte lipstick in a beautiful rose wood shade.',
    description: 'Experience the ultimate luxury with our Luxe Matte Lipstick. Infused with hydrating oils, this long-wearing formula provides full coverage color with a velvet-matte finish that never feels dry.',
    price: 1250,
    discountPrice: 950,
    stock: 50,
    category: 'cosmetics',
    subcategory: 'lips',
    brand: 'Aura Beauty',
    images: [
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=600'
    ],
    status: 'published',
    isFeatured: true,
    isNewArrival: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    slug: 'glow-serum-vitamin-c',
    title: 'Radiance Glow Vitamin C Serum',
    shortDescription: 'Brightening and anti-aging serum with 15% pure Vitamin C.',
    description: 'Achieve a radiant, even-toned complexion with our powerful Vitamin C serum. Formulated to reduce dark spots and boost collagen production for a youthful glow.',
    price: 2450,
    stock: 120,
    category: 'skincare',
    subcategory: 'serum',
    brand: 'GlowRx',
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&q=80&w=600'
    ],
    status: 'published',
    isBestSeller: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    slug: 'rose-gold-pendant-necklace',
    title: 'Minimalist Rose Gold Pendant',
    shortDescription: 'Elegant 18k rose gold plated necklace with a subtle crystal pendant.',
    description: 'Add a touch of elegance to any outfit with this minimalist rose gold pendant. Perfect for everyday wear or special occasions. Comes in a premium gift box.',
    price: 3200,
    discountPrice: 2800,
    stock: 15,
    category: 'jewellery',
    subcategory: 'necklace',
    brand: 'Lumina',
    images: [
      'https://images.unsplash.com/photo-1599643478514-4a420804ce68?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=600'
    ],
    status: 'published',
    isFeatured: true,
    isFlashSale: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    slug: 'hydrating-floral-mist',
    title: 'Hydrating Floral Face Mist',
    shortDescription: 'Refreshing rose water facial mist for instant hydration.',
    description: 'Instantly refresh and hydrate your skin with our Floral Face Mist. Made with 100% natural rose water, it balances skin pH and sets makeup perfectly.',
    price: 850,
    stock: 200,
    category: 'skincare',
    subcategory: 'toner',
    brand: 'NatureBloom',
    images: [
      'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&q=80&w=600'
    ],
    status: 'published',
    isNewArrival: true,
    createdAt: new Date().toISOString()
  }
];
