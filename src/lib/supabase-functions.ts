
import { supabase } from "@/integrations/supabase/client";
import { CarbonIntensityData, PaymentStatus, Recommendation, UtilityDataPoint } from "@/types/energy";

export async function fetchUtilityData(period: string): Promise<UtilityDataPoint[]> {
  const { data, error } = await supabase.functions.invoke('fetchUtilityData', {
    body: { period },
  });

  if (error) throw error;
  return data;
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
  const { data, error } = await supabase.functions.invoke('checkPaymentHistory', {
    body: {},
  });

  if (error) throw error;
  return data;
}

export async function createBayouCustomer(utilityName: string): Promise<{ onboarding_link: string }> {
  const { data, error } = await supabase.functions.invoke('createBayouCustomer', {
    body: { utility_name: utilityName }
  });
  
  if (error) {
    console.error("Error creating Bayou customer:", error);
    throw error;
  }
  
  return data;
}
