import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { 
      event_name, 
      event_time, 
      event_id, 
      event_source_url, 
      user, 
      properties,
      test_event_code 
    } = await req.json();
    
    // Retrieve secrets securely from Supabase environment
    const accessToken = Deno.env.get('TIKTOK_ACCESS_TOKEN');
    const pixelId = Deno.env.get('TIKTOK_PIXEL_ID');

    if (!accessToken || !pixelId) {
      console.warn('TikTok Events API not configured on server. Missing TIKTOK_ACCESS_TOKEN or TIKTOK_PIXEL_ID');
      return new Response(
        JSON.stringify({ status: 'ignored', reason: 'Missing configuration secrets' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    const payload: any = {
      pixel_code: pixelId,
      events: [
        {
          event: event_name,
          event_time: event_time || Math.floor(Date.now() / 1000),
          event_id: event_id,
          page: {
             url: event_source_url
          },
          user: user || {},
          properties: properties || {}
        }
      ]
    };

    if (test_event_code) {
       payload.test_event_code = test_event_code;
    }

    const response = await fetch('https://business-api.tiktok.com/open_api/v1.3/pixel/track/', {
      method: 'POST',
      headers: {
        'Access-Token': accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    if (data.code !== 0) {
      console.error('TikTok Events API error:', data);
      return new Response(
        JSON.stringify({ status: 'error', details: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    return new Response(
      JSON.stringify({ status: 'success', data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Failed to send TikTok event:', error.message);
    return new Response(
      JSON.stringify({ status: 'error', message: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
