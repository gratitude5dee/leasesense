
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

    try {
      // Fetch bills data from the fetchUtilityData function
      const { data: billsData, error } = await supabase.functions.invoke('fetchUtilityData', {
        headers: { authorization: authHeader },
      });

      if (error) {
        console.error("Error fetching utility data:", error);
        return new Response(JSON.stringify({ 
          status: 'Not Available', 
          error: 'Failed to fetch utility data'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Check if there's bills data available
      if (!billsData || !billsData.bills || billsData.bills.length === 0) {
        return new Response(JSON.stringify({ status: 'Not Available' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Log sample bill structure to help with debugging
      console.log("Sample bill structure:", JSON.stringify(billsData.bills[0]));

      // Check payment status of recent bills
      const recentBills = billsData.bills.slice(-3); // Last 3 bills
      
      // Check if bills have payment status fields
      if (!recentBills[0].hasOwnProperty('is_paid') || !recentBills[0].hasOwnProperty('due_date')) {
        console.log("Bills missing payment status fields:", recentBills[0]);
        return new Response(JSON.stringify({ status: 'Not Available' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const hasOverdueBill = recentBills.some((bill: any) => 
        bill.is_paid === false && new Date(bill.due_date) < new Date()
      );

      const status = hasOverdueBill ? 'Overdue' : 'Good Standing';

      return new Response(JSON.stringify({ status }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (invokeError) {
      console.error("Error in checkPaymentHistory:", invokeError);
      return new Response(JSON.stringify({ status: 'Not Available', error: invokeError.message }), {
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
