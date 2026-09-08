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
  const currentPrice = product.discountPrice || product.price;
  trackTikTokEvent('ViewContent', {
    contents: [
      {
        content_id: product.id,
        content_type: 'product',
        content_name: product.title,
        price: currentPrice
      }
    ],
    value: currentPrice,
    currency: 'BDT',
    event_id: eventId || generateEventId()
  });
};

export const trackAddToCart = (product: any, quantity: number, eventId?: string) => {
  if (!product) return;
  const currentPrice = product.discountPrice || product.price;
  trackTikTokEvent('AddToCart', {
    contents: [
      {
        content_id: product.id,
        content_type: 'product',
        content_name: product.title,
        price: currentPrice,
        quantity: quantity
      }
    ],
    value: currentPrice * quantity,
    currency: 'BDT',
    event_id: eventId || generateEventId()
  });
};

export const trackInitiateCheckout = (items: any[], totalValue: number, eventId?: string) => {
  if (!items || items.length === 0) return;
  const contents = items.map(item => ({
    content_id: item.id || item.productId,
    content_type: 'product',
    content_name: item.title,
    price: item.discountPrice || item.price,
    quantity: item.quantity || 1
  }));

  trackTikTokEvent('InitiateCheckout', {
    contents,
    value: totalValue,
    currency: 'BDT',
    event_id: eventId || generateEventId()
  });
};

export const trackPlaceAnOrder = (items: any[], totalValue: number, orderId: string, eventId?: string) => {
   if (!items || items.length === 0) return;
  const contents = items.map(item => ({
    content_id: item.id || item.productId,
    content_type: 'product',
    content_name: item.title,
    price: item.discountPrice || item.price,
    quantity: item.quantity || 1
  }));

  trackTikTokEvent('PlaceAnOrder', {
    contents,
    value: totalValue,
    currency: 'BDT',
    event_id: eventId || generateEventId(),
    order_id: orderId
  });
};

export const trackPurchase = (items: any[], totalValue: number, orderId: string, eventId?: string) => {
  if (!items || items.length === 0) return;
  const contents = items.map(item => ({
    content_id: item.id || item.productId,
    content_type: 'product',
    content_name: item.title,
    price: item.discountPrice || item.price,
    quantity: item.quantity || 1
  }));

  trackTikTokEvent('CompletePayment', { // TikTok's standard Purchase event
    contents,
    value: totalValue,
    currency: 'BDT',
    event_id: eventId || generateEventId(),
    order_id: orderId
  });
};

export const trackSearch = (query: string, eventId?: string) => {
  if (!query || query.trim() === '') return;
  trackTikTokEvent('Search', {
    query: query,
    event_id: eventId || generateEventId()
  });
};
