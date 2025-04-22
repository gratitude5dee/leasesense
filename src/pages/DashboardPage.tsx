
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { fetchUtilityData, fetchCarbonIntensity, checkPaymentHistory } from '@/lib/supabase-functions';
import EnergyVisualization from '@/components/EnergyVisualization';
import ComparisonWidgets from '@/components/ComparisonWidgets';
import ActionCardsFeed from '@/components/ActionCardsFeed';
import { useUserData } from '@/hooks/useUserData';
import { VisualizationMode, TimeRange } from '@/types/energy';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePersona } from '@/contexts/PersonaContext';

export default function DashboardPage() {
  const { toast } = useToast();
  const { persona } = usePersona();
  const [timeRange, setTimeRange] = useState<TimeRange>('day');
  const [visualizationMode, setVisualizationMode] = useState<VisualizationMode>('usage');

  // Get user profile data
  const { data: userData, isLoading: isLoadingUserData } = useUserData();

  // Fetch utility data
  const { data: utilityData, isLoading: isLoadingUtilityData } = useQuery({
    queryKey: ['utilityData', timeRange],
    queryFn: () => fetchUtilityData(timeRange),
    meta: {
      onError: (error: any) => {
        toast({
          title: 'Error loading utility data',
          description: error.message,
          variant: 'destructive',
        });
      }
    }
  });

  // Fetch carbon intensity data (using hardcoded values until we have real addresses)
  const { data: carbonData, isLoading: isLoadingCarbonData } = useQuery({
    queryKey: ['carbonIntensity'],
    queryFn: () => fetchCarbonIntensity(37.7749, -122.4194), // San Francisco coordinates as example
    meta: {
      onError: (error: any) => {
        toast({
          title: 'Error loading carbon intensity data',
          description: error.message,
          variant: 'destructive',
        });
      }
    }
  });

  // Check payment history
  const { data: paymentStatus, isLoading: isLoadingPaymentStatus } = useQuery({
    queryKey: ['paymentStatus'],
    queryFn: checkPaymentHistory,
    meta: {
      onError: (error: any) => {
        console.error('Error checking payment history:', error);
        // Not showing a toast since this is not critical for the user experience
      }
    }
  });

  const isLoading = isLoadingUtilityData || isLoadingCarbonData || isLoadingUserData;

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Energy Dashboard</h1>
            <p className="text-gray-600 mt-1">
              {persona === 'renter' ? 'Home Energy Usage' : 'Shop Energy Usage'}
            </p>
          </div>

          <div className="flex gap-2 mt-4 md:mt-0">
            <Tabs value={visualizationMode} onValueChange={(v) => setVisualizationMode(v as VisualizationMode)}>
              <TabsList>
                <TabsTrigger value="usage">Usage</TabsTrigger>
                <TabsTrigger value="cost">Cost</TabsTrigger>
                <TabsTrigger value="emissions">Emissions</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="flex mb-4 space-x-2">
          <Button
            variant={timeRange === 'day' ? 'default' : 'outline'}
            onClick={() => setTimeRange('day')}
            size="sm"
          >
            Day
          </Button>
          <Button
            variant={timeRange === 'week' ? 'default' : 'outline'}
            onClick={() => setTimeRange('week')}
            size="sm"
          >
            Week
          </Button>
          <Button
            variant={timeRange === 'month' ? 'default' : 'outline'}
            onClick={() => setTimeRange('month')}
            size="sm"
          >
            Month
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="h-[400px] flex items-center justify-center">
                  <p>Loading energy data...</p>
                </div>
              ) : (
                <EnergyVisualization
                  utilityData={utilityData || []}
                  carbonData={carbonData}
                  visualizationMode={visualizationMode}
                  timeRange={timeRange}
                />
              )}
            </CardContent>
          </Card>
          
          <div className="space-y-6">
            <ComparisonWidgets 
              utilityData={utilityData || []}
              userType={persona}
              sqFt={userData?.sq_ft}
            />
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Recommended Actions</h2>
          <ActionCardsFeed 
            utilityData={utilityData || []} 
            carbonData={carbonData} 
            userType={persona} 
            sqFt={userData?.sq_ft}
            paymentStatus={paymentStatus}
          />
        </div>
      </div>
    </div>
  );
}
