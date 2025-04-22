
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
    const { lat, lon } = await req.json();
    const API_KEY = Deno.env.get('ELECTRICITY_MAPS_API_KEY');

    if (!API_KEY) {
      throw new Error('Electricity Maps API key not configured');
    }

    const response = await fetch(
      `https://api.electricitymap.org/v3/carbon-intensity/latest?lat=${lat}&lon=${lon}`,
      {
        headers: {
          'auth-token': API_KEY,
        },
      }
    );

    const data = await response.json();
    
    return new Response(JSON.stringify({
      timestamp: new Date().toISOString(),
      co2e_per_kwh: data.carbonIntensity || 400, // Fallback value if API fails
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching carbon intensity:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
