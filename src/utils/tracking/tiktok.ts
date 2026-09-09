import { v4 as uuidv4 } from 'uuid';
import { supabase, isSupabaseConfigured } from '../../config/supabase';

declare global {
  interface Window {
    ttq: any;
  }
}

// Generate a consistent ID for the session to tie frontend and backend events
export const generateEventId = () => uuidv4();

const getTikTokConfig = () => {
  return {
    pixelId: import.meta.env.VITE_TIKTOK_PIXEL_ID,
    testEventCode: import.meta.env.VITE_TIKTOK_TEST_EVENT_CODE // Optional for browser testing
  };
};

export const trackTikTokEvent = async (eventName: string, params: any = {}) => {
  try {
    const { pixelId, testEventCode } = getTikTokConfig();
    
    // 1. Browser Tracking (Pixel)
    if (typeof window !== 'undefined' && window.ttq && pixelId) {
      const browserParams = { ...params };
      if (testEventCode) {
         browserParams.test_event_code = testEventCode;
      }
      
      window.ttq.track(eventName, browserParams);
      
      if (import.meta.env.DEV) {
        console.log(`[TikTok Pixel] ${eventName}`, browserParams);
      }
    }
    
    // 2. Server-side Tracking (Events API) via Supabase Edge Functions
    // We send this to a secure edge function where the TIKTOK_ACCESS_TOKEN is safely stored.
    if (isSupabaseConfigured) {
       await supabase.functions.invoke('tiktok-events-api', {
         body: {
           event_name: eventName,
           event_time: Math.floor(Date.now() / 1000),
           event_id: params.event_id,
           event_source_url: window.location.href,
           user: {
             // Future enhancement: pass hashed user data here if available securely
           },
           properties: params,
           test_event_code: testEventCode || undefined
         }
       }).catch((err) => {
         console.warn('Failed to invoke tiktok-events-api edge function:', err);
       });
    }
    
  } catch (error) {
    console.error('TikTok tracking error:', error);
  }
};

export const trackViewContent = (product: any, eventId?: string) => {
  if (!product) return;
  const currentPrice = Number(product.discountPrice || product.price || 0);
  const safeId = String(product._id || product.id || 'unknown');
  trackTikTokEvent('ViewContent', {
    content_id: safeId,
    content_type: 'product',
    content_name: product.title || product.name || 'Product',
    contents: [
      {
        content_id: safeId,
        content_type: 'product',
        content_name: product.title || product.name || 'Product',
        price: currentPrice,
        quantity: 1
      }
    ],
    value: currentPrice,
    currency: 'BDT',
    event_id: eventId || generateEventId()
  });
};

export const trackAddToCart = (product: any, quantity: number, eventId?: string) => {
  if (!product) return;
  const currentPrice = Number(product.discountPrice || product.price || 0);
  const safeId = String(product._id || product.id || 'unknown');
  trackTikTokEvent('AddToCart', {
    content_id: safeId,
    content_type: 'product',
    content_name: product.title || product.name || 'Product',
    contents: [
      {
        content_id: safeId,
        content_type: 'product',
        content_name: product.title || product.name || 'Product',
        price: currentPrice,
        quantity: Number(quantity) || 1
      }
    ],
    value: currentPrice * (Number(quantity) || 1),
    currency: 'BDT',
    event_id: eventId || generateEventId()
  });
};

export const trackInitiateCheckout = (items: any[], totalValue: number, eventId?: string) => {
  if (!items || items.length === 0) return;
  const contents = items.map(item => ({
    content_id: String(item._id || item.id || item.productId || 'unknown'),
    content_type: 'product',
    content_name: item.title || item.name || 'Product',
    price: Number(item.discountPrice || item.price || 0),
    quantity: Number(item.quantity) || 1
  }));
  const contentIds = items.map(item => String(item._id || item.id || item.productId || 'unknown'));

  trackTikTokEvent('InitiateCheckout', {
    content_id: contentIds.length === 1 ? contentIds[0] : contentIds,
    content_type: 'product',
    contents,
    value: Number(totalValue),
    currency: 'BDT',
    event_id: eventId || generateEventId()
  });
};

export const trackPlaceAnOrder = (items: any[], totalValue: number, orderId: string, eventId?: string) => { 
  if (!items || items.length === 0) return;
  const contents = items.map(item => ({
    content_id: String(item._id || item.id || item.productId || 'unknown'),
    content_type: 'product',
    content_name: item.title || item.name || 'Product',
    price: Number(item.discountPrice || item.price || 0),
    quantity: Number(item.quantity) || 1
  }));
  const contentIds = items.map(item => String(item._id || item.id || item.productId || 'unknown'));

  trackTikTokEvent('PlaceAnOrder', {
    content_id: contentIds.length === 1 ? contentIds[0] : contentIds,
    content_type: 'product',
    contents,
    value: Number(totalValue),
    currency: 'BDT',
    event_id: eventId || generateEventId(),
    order_id: String(orderId)
  });
};

export const trackPurchase = (items: any[], totalValue: number, orderId: string, eventId?: string) => {
  if (!items || items.length === 0) return;
  const contents = items.map(item => ({
    content_id: String(item._id || item.id || item.productId || 'unknown'),
    content_type: 'product',
    content_name: item.title || item.name || 'Product',
    price: Number(item.discountPrice || item.price || 0),
    quantity: Number(item.quantity) || 1
  }));

  trackTikTokEvent('CompletePayment', { // TikTok's standard Purchase event
    content_id: String(orderId),
    content_type: 'product',
    contents,
    value: Number(totalValue),
    currency: 'BDT',
    event_id: eventId || generateEventId(),
    order_id: String(orderId)
  });
};

export const trackSearch = (query: string, eventId?: string) => {
  if (!query || query.trim() === '') return;
  trackTikTokEvent('Search', {
    query: query,
    event_id: eventId || generateEventId()
  });
};
