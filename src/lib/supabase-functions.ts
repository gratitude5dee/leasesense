
import { supabase } from "@/integrations/supabase/client";
import { CarbonIntensityData, PaymentStatus, Recommendation, UtilityDataPoint } from "@/types/energy";

export async function fetchUtilityData(period: string): Promise<UtilityDataPoint[]> {
  try {
    const { data, error } = await supabase.functions.invoke('fetchUtilityData', {
      body: { period },
    });

    if (error) throw error;
    
    // If data is an empty array or null/undefined, return an empty array
    if (!data || !Array.isArray(data) || data.length === 0) {
      return [];
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching utility data:", error);
    return [];  // Return empty array on error for more resilient UX
  }
}

export async function fetchCarbonIntensity(lat: number, lon: number): Promise<CarbonIntensityData> {
  const { data, error } = await supabase.functions.invoke('fetchCarbonIntensity', {
    body: { lat, lon },
  });

  if (error) throw error;
  return data;
}

export async function generateRecommendations(
  utilityData: UtilityDataPoint[],
  userType: string,
  sqFt?: number
): Promise<Recommendation[]> {
  const { data, error } = await supabase.functions.invoke('generateRecommendations', {
    body: { utilityData, userType, sqFt },
  });

  if (error) throw error;
  return data;
}

export async function checkPaymentHistory(): Promise<PaymentStatus> {
  try {
    const { data, error } = await supabase.functions.invoke('checkPaymentHistory', {
      body: {},
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error checking payment history:", error);
    return { status: 'Not Available' };  // Return a safe default on error
  }
}

export async function createBayouCustomer(utilityName: string): Promise<{ onboarding_link: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('createBayouCustomer', {
      body: { utility_name: utilityName }
    });
    
    if (error) {
      console.error("Error creating Bayou customer:", error);
      throw error;
    }
    
    if (!data || !data.onboarding_link) {
      throw new Error("Invalid response from Bayou API");
    }
    
    return data;
  } catch (error) {
    console.error("Error creating Bayou customer:", error);
    throw error;
  }
}
