
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { period } = await req.json();
    
    // For now, return mock data until Bayou API integration is implemented
    const mockData = Array.from({ length: 24 }, (_, i) => ({
      timestamp: new Date(Date.now() - i * 3600000).toISOString(),
      kwh: Math.random() * 2 + 0.5,
      cost: (Math.random() * 2 + 0.5) * 0.15, // Mock cost at $0.15/kWh
    }));

    return new Response(JSON.stringify(mockData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
