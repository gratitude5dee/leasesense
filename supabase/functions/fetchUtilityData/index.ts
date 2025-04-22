
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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

    // Fetch user's Bayou customer ID
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('bayou_customer_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profileData?.bayou_customer_id) {
      return new Response(JSON.stringify({ 
        error: 'No Bayou customer ID found. Please complete utility onboarding first.' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const bayouApiKey = Deno.env.get('BAYOU_API_KEY');
    const bayouDomain = Deno.env.get('BAYOU_DOMAIN');
    
    if (!bayouApiKey || !bayouDomain) {
      return new Response(JSON.stringify({ error: 'Bayou API configuration missing' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    // Data readiness polling
    let customerDetails;
    let dataIsReady = false;
    
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const customerResponse = await fetch(`https://${bayouDomain}/api/v2/customers/${profileData.bayou_customer_id}`, {
        headers: {
          'Authorization': `Basic ${btoa(bayouApiKey + ':')}`,
        },
      });

      if (!customerResponse.ok) {
        console.error(`Error fetching customer details: ${customerResponse.status} ${customerResponse.statusText}`);
        if (attempt === MAX_RETRIES - 1) {
          return new Response(JSON.stringify({ error: `Failed to fetch customer details: ${customerResponse.statusText}` }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          });
        }
        await delay(RETRY_DELAY);
        continue;
      }

      customerDetails = await customerResponse.json();
      console.log("Customer details:", JSON.stringify(customerDetails));

      // Check if credentials are filled and data is ready
      if (customerDetails.customer && 
          customerDetails.customer.has_filled_credentials && 
          customerDetails.customer.bills_are_ready && 
          customerDetails.customer.intervals_are_ready) {
        dataIsReady = true;
        break;
      }

      // Wait before retrying if we haven't reached max retries
      if (attempt < MAX_RETRIES - 1) {
        await delay(RETRY_DELAY);
      }
    }

    // If data is not ready after polling, return empty array
    if (!dataIsReady) {
      console.log("Data not ready after polling");
      return new Response(JSON.stringify([]), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch intervals since data is ready
    const intervalsResponse = await fetch(`https://${bayouDomain}/api/v2/customers/${profileData.bayou_customer_id}/intervals`, {
      headers: {
        'Authorization': `Basic ${btoa(bayouApiKey + ':')}`,
      },
    });

    if (!intervalsResponse.ok) {
      console.error(`Error fetching intervals: ${intervalsResponse.status} ${intervalsResponse.statusText}`);
      return new Response(JSON.stringify({ error: `Failed to fetch intervals: ${intervalsResponse.statusText}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const intervalsData = await intervalsResponse.json();
    console.log("Intervals data sample:", JSON.stringify(intervalsData.meters?.slice(0, 1)));

    // Normalize interval data - handle multiple meters
    let normalizedIntervals = [];
    
    // Check if meters exist and handle multiple meters
    if (intervalsData.meters && Array.isArray(intervalsData.meters)) {
      // Iterate through all meters
      intervalsData.meters.forEach(meter => {
        if (meter.intervals && Array.isArray(meter.intervals)) {
          const meterIntervals = meter.intervals.map(interval => ({
            timestamp: interval.start_time,
            kwh: interval.consumption || 0,
            cost: interval.cost || 0
          }));
          normalizedIntervals = [...normalizedIntervals, ...meterIntervals];
        }
      });
    }

    // Return only the normalized intervals array to match the expected UtilityDataPoint[] type
    return new Response(JSON.stringify(normalizedIntervals), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error in fetchUtilityData:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
