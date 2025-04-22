
import { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UtilityDataPoint } from '@/types/energy';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';
import { Constants } from '@/integrations/supabase/types';
import { NoiseTexture } from '@/components/ui/NoiseTexture';
import { useMouseInteraction } from '@/hooks/useMouseInteraction';

type UserType = typeof Constants.public.Enums.user_type[number];

export default function ComparisonWidgets({
  utilityData,
  userType,
  sqFt
}: {
  utilityData: UtilityDataPoint[];
  userType: UserType;
  sqFt?: number | null;
}) {
  // Refs for 3D interaction
  const peerCardRef = useRef<HTMLDivElement>(null);
  const sqftCardRef = useRef<HTMLDivElement>(null);
  
  // Mouse interaction for peer comparison card
  const { style: peerCardStyle } = useMouseInteraction(peerCardRef, {
    rotation: 5, 
    scale: 1.02,
    perspective: 1200
  });
  
  // Mouse interaction for sqft card
  const { style: sqftCardStyle } = useMouseInteraction(sqftCardRef, {
    rotation: 5, 
    scale: 1.02,
    perspective: 1200
  });

  // Fetch benchmark data from Supabase
  const { data: benchmarkData, isLoading } = useQuery({
    queryKey: ['benchmarks', userType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('benchmarks')
        .select('*')
        .eq('benchmark_type', userType);
      
      if (error) throw error;
      return data;
    }
  });

  // Calculate total energy usage
  const totalKwh = utilityData.reduce((sum, point) => sum + point.kwh, 0);
  
  // Calculate usage per square foot (if sqFt is available)
  const kwhPerSqFt = sqFt && sqFt > 0 ? totalKwh / sqFt : undefined;
  
  // Get benchmark values
  const avgKwhBenchmark = benchmarkData?.find(b => b.metric === 'avg_monthly_kwh')?.value;
  const avgKwhPerSqFtBenchmark = benchmarkData?.find(b => b.metric === 'kwh_per_sqft')?.value;
  
  // Calculate comparison percentages
  const usageComparisonPct = avgKwhBenchmark ? (totalKwh / avgKwhBenchmark) * 100 : undefined;
  const relativeUsage = usageComparisonPct ? (usageComparisonPct > 100 ? 'more' : 'less') : undefined;
  const usageDiffPct = usageComparisonPct ? Math.abs(100 - usageComparisonPct) : undefined;
  
  return (
    <div className="space-y-6">
      <Card 
        ref={peerCardRef} 
        className="enhanced-card"
        style={peerCardStyle}
      >
        <NoiseTexture opacity={0.02} />
        <div className="card-content-3d">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Peer Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading comparison data...</p>
            ) : avgKwhBenchmark ? (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Your Usage</span>
                    <span className="font-medium">{totalKwh.toFixed(2)} kWh</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Average {userType === 'renter' ? 'Household' : 'Shop'}</span>
                    <span className="font-medium">{avgKwhBenchmark.toFixed(2)} kWh</span>
                  </div>
                  {usageDiffPct && relativeUsage && (
                    <>
                      <Progress 
                        value={usageComparisonPct} 
                        max={200}
                        className="h-2 overflow-hidden"
                      />
                      <p className="text-sm mt-2">
                        You use <span className="font-semibold">{usageDiffPct.toFixed(0)}%</span> {relativeUsage} energy 
                        than similar {userType === 'renter' ? 'households' : 'businesses'}.
                      </p>
                    </>
                  )}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No benchmark data available.</p>
            )}
          </CardContent>
        </div>
      </Card>

      {sqFt && sqFt > 0 && (
        <Card 
          ref={sqftCardRef}
          className="enhanced-card"
          style={sqftCardStyle}
        >
          <NoiseTexture opacity={0.02} />
          <div className="card-content-3d">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Usage per Square Foot</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading data...</p>
              ) : kwhPerSqFt && avgKwhPerSqFtBenchmark ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Your Usage</span>
                    <span className="font-medium">{kwhPerSqFt.toFixed(2)} kWh/sqft</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Average</span>
                    <span className="font-medium">{avgKwhPerSqFtBenchmark.toFixed(2)} kWh/sqft</span>
                  </div>
                  <Progress 
                    value={(kwhPerSqFt / avgKwhPerSqFtBenchmark) * 100}
                    max={200} 
                    className="h-2 overflow-hidden"
                  />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {sqFt ? 'No benchmark data available.' : 'Please enter your square footage in your profile.'}
                </p>
              )}
            </CardContent>
          </div>
        </Card>
      )}
    </div>
  );
}
