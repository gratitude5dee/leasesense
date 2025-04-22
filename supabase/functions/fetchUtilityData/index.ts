
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
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const customerResponse = await fetch(`https://${bayouDomain}/api/v2/customers/${profileData.bayou_customer_id}`, {
        headers: {
          'Authorization': `Basic ${btoa(bayouApiKey + ':')}`,
        },
      });

      customerDetails = await customerResponse.json();

      // Check if credentials are filled and data is ready
      if (customerDetails.customer.has_filled_credentials && 
          customerDetails.customer.bills_are_ready && 
          customerDetails.customer.intervals_are_ready) {
        break;
      }

      // Wait before retrying
      await delay(RETRY_DELAY);
    }

    // Fetch bills
    const billsResponse = await fetch(`https://${bayouDomain}/api/v2/customers/${profileData.bayou_customer_id}/bills`, {
      headers: {
        'Authorization': `Basic ${btoa(bayouApiKey + ':')}`,
      },
    });
    const billsData = await billsResponse.json();

    // Fetch intervals
    const intervalsResponse = await fetch(`https://${bayouDomain}/api/v2/customers/${profileData.bayou_customer_id}/intervals`, {
      headers: {
        'Authorization': `Basic ${btoa(bayouApiKey + ':')}`,
      },
    });
    const intervalsData = await intervalsResponse.json();

    // Normalize interval data
    const normalizedIntervals = intervalsData.meters[0].intervals.map((interval: any) => ({
      timestamp: interval.start_time,
      kwh: interval.consumption,
      cost: interval.cost
    }));

    return new Response(JSON.stringify({
      intervals: normalizedIntervals,
      bills: billsData.bills,
      customerDetails: customerDetails.customer
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
