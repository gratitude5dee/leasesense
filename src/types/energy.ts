
export interface UtilityDataPoint {
  timestamp: string;
  kwh: number;
  cost?: number;
}

export interface CarbonIntensityData {
  timestamp: string;
  co2e_per_kwh: number;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  potential_savings: string;
  type: 'behavioral' | 'equipment';
}

export interface PaymentStatus {
  status: 'Good Standing' | 'Overdue' | 'Unknown' | 'Not Available';
}

export type VisualizationMode = 'usage' | 'cost' | 'emissions';
export type TimeRange = 'day' | 'week' | 'month';
