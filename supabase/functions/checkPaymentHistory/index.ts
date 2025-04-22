
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    // Fetch user's Bayou customer ID directly
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('bayou_customer_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profileData?.bayou_customer_id) {
      console.log("No Bayou customer ID found:", profileError);
      return new Response(JSON.stringify({ status: 'Not Available' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const bayouApiKey = Deno.env.get('BAYOU_API_KEY');
    const bayouDomain = Deno.env.get('BAYOU_DOMAIN');
    
    if (!bayouApiKey || !bayouDomain) {
      console.error("Bayou API configuration missing");
      return new Response(JSON.stringify({ status: 'Not Available' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    try {
      // Directly fetch bills from Bayou API
      const billsResponse = await fetch(`https://${bayouDomain}/api/v2/customers/${profileData.bayou_customer_id}/bills`, {
        headers: {
          'Authorization': `Basic ${btoa(bayouApiKey + ':')}`,
        },
      });

      if (!billsResponse.ok) {
        console.error(`Error fetching bills: ${billsResponse.status} ${billsResponse.statusText}`);
        return new Response(JSON.stringify({ status: 'Not Available' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const billsData = await billsResponse.json();

      // Check if there's bills data available
      if (!billsData || !billsData.bills || billsData.bills.length === 0) {
        return new Response(JSON.stringify({ status: 'Not Available' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Log sample bill structure to help with debugging
      console.log("Sample bill structure:", JSON.stringify(billsData.bills[0]));

      // Get most recent bills 
      const recentBills = billsData.bills.slice(-3); // Last 3 bills
      
      // Check for specific fields to determine payment status
      // First check if the bills have balance_remaining or is_paid fields
      let hasOverdueBill = false;
      
      if (recentBills[0].hasOwnProperty('balance_remaining') && recentBills[0].hasOwnProperty('due_date')) {
        // Check if any bill has remaining balance and is past due date
        hasOverdueBill = recentBills.some((bill) => 
          bill.balance_remaining > 0 && new Date(bill.due_date) < new Date()
        );
      } 
      else if (recentBills[0].hasOwnProperty('is_paid') && recentBills[0].hasOwnProperty('due_date')) {
        // Alternative check using is_paid field
        hasOverdueBill = recentBills.some((bill) => 
          bill.is_paid === false && new Date(bill.due_date) < new Date()
        );
      }
      else {
        console.log("Bills missing payment status fields:", recentBills[0]);
        return new Response(JSON.stringify({ status: 'Not Available' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const status = hasOverdueBill ? 'Overdue' : 'Good Standing';

      return new Response(JSON.stringify({ status }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (fetchError) {
      console.error("Error fetching bills data:", fetchError);
      return new Response(JSON.stringify({ status: 'Not Available', error: fetchError.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error("Uncaught error in checkPaymentHistory:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
