
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
    const { utilityData, userType, sqFt } = await req.json();

    // Simple rule-based recommendations
    const recommendations = [
      {
        id: 'peak-usage',
        title: 'Reduce Peak Hour Usage',
        description: 'Your energy usage is highest during peak hours. Consider shifting some activities to off-peak times.',
        potential_savings: '$20/month',
        type: 'behavioral',
      },
      {
        id: 'led-lighting',
        title: 'Switch to LED Lighting',
        description: 'Replacing traditional bulbs with LEDs can reduce lighting energy use by up to 75%.',
        potential_savings: '$10/month',
        type: 'equipment',
      },
      {
        id: 'thermostat',
        title: 'Optimize Thermostat Settings',
        description: 'Adjusting your thermostat by just 1-2 degrees can lead to significant savings.',
        potential_savings: '$15/month',
        type: 'behavioral',
      },
    ];

    return new Response(JSON.stringify(recommendations), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
