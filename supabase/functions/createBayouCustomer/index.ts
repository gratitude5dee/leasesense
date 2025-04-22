
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Map of display names to Bayou utility codes for commonly used utilities
const utilityCodeMap: Record<string, string> = {
  "PG&E": "pge",
  "Southern California Edison": "sce",
  "San Diego Gas & Electric": "sdge",
  "Austin Energy": "austin_energy",
  "CPS Energy": "cps",
  "Duke Energy": "duke_energy",
  "Speculoos Power (Test)": "speculoos_power" // This is the test utility from the Quickstart
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Extract the Supabase authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify the user's JWT and extract user ID
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid authentication' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    // Parse request body to get utility display name
    const { utility_name } = await req.json();

    // Map the display name to a utility code or use as-is if not in the map
    const utilityCode = utilityCodeMap[utility_name] || utility_name;
    
    console.log(`Mapped utility name "${utility_name}" to code "${utilityCode}"`);

    // Prepare Bayou API request
    const bayouApiKey = Deno.env.get('BAYOU_API_KEY');
    const bayouDomain = Deno.env.get('BAYOU_DOMAIN');
    
    if (!bayouApiKey || !bayouDomain) {
      return new Response(JSON.stringify({ error: 'Bayou API configuration missing' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    // Create Bayou customer
    const bayouResponse = await fetch(`https://${bayouDomain}/api/v2/customers`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(bayouApiKey + ':')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ utility: utilityCode }),
    });

    const customerData = await bayouResponse.json();

    if (!bayouResponse.ok) {
      console.error('Bayou API error:', customerData);
      return new Response(JSON.stringify({ 
        error: 'Failed to create Bayou customer', 
        details: customerData,
        utility_used: utilityCode
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: bayouResponse.status,
      });
    }

    // Update user profile with Bayou customer ID
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ bayou_customer_id: customerData.customer.id })
      .eq('id', user.id);

    if (updateError) {
      return new Response(JSON.stringify({ 
        error: 'Failed to update user profile', 
        details: updateError 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    // Return onboarding link
    return new Response(JSON.stringify({ 
      onboarding_link: customerData.customer.onboarding_link 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
