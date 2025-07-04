
import { useState, useRef } from 'react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCcw } from 'lucide-react';
import { NoiseTexture } from '@/components/ui/NoiseTexture';
import { useMouseInteraction } from '@/hooks/useMouseInteraction';

export default function DashboardPage() {
  const { toast } = useToast();
  const { persona } = usePersona();
  const [timeRange, setTimeRange] = useState<TimeRange>('day');
  const [visualizationMode, setVisualizationMode] = useState<VisualizationMode>('usage');
  
  // Refs for interactive elements
  const refreshBtnRef = useRef<HTMLButtonElement>(null);
  
  // Magnetic button effect
  const { magneticStyle: refreshBtnStyle } = useMouseInteraction(refreshBtnRef, {
    magnetic: true,
    magneticStrength: 0.3
  });

  // Get user profile data
  const { data: userData, isLoading: isLoadingUserData } = useUserData();

  // Fetch utility data
  const { 
    data: utilityData, 
    isLoading: isLoadingUtilityData, 
    error: utilityError,
    refetch: refetchUtilityData,
    isError: isUtilityError,
    isRefetching: isRefetchingUtility
  } = useQuery({
    queryKey: ['utilityData', timeRange],
    queryFn: () => fetchUtilityData(timeRange),
    refetchInterval: 30000, // Poll every 30 seconds if data is empty (likely still processing)
    refetchIntervalInBackground: true,
    refetchOnMount: true,
    retry: 3,
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
  const hasUtilityData = utilityData && utilityData.length > 0;
  
  // Check if data is still being fetched from Bayou (empty array but loading)
  const isWaitingForBayou = !hasUtilityData && !isUtilityError;

  return (
    <div className="min-h-screen pb-8 relative">
      <NoiseTexture opacity={0.015} className="fixed inset-0 z-0" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Energy Dashboard</h1>
            <p className="text-gray-600 mt-1">
              {persona === 'renter' ? 'Home Energy Usage' : 'Shop Energy Usage'}
            </p>
          </div>

          <div className="flex gap-2 mt-4 md:mt-0">
            <Tabs value={visualizationMode} onValueChange={(v) => setVisualizationMode(v as VisualizationMode)} className="glassmorphic p-0.5">
              <TabsList>
                <TabsTrigger value="usage" className="glow-effect">Usage</TabsTrigger>
                <TabsTrigger value="cost" className="glow-effect">Cost</TabsTrigger>
                <TabsTrigger value="emissions" className="glow-effect">Emissions</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {isWaitingForBayou && (
          <Alert className="mb-6 glassmorphic bg-blue-50/90 backdrop-blur-sm border-blue-200 overflow-hidden">
            <NoiseTexture opacity={0.01} />
            <AlertDescription className="flex items-center justify-between">
              <span>
                Your utility data is being processed. This may take a few minutes after completing the authentication.
              </span>
              <Button 
                ref={refreshBtnRef}
                variant="outline" 
                size="sm"
                onClick={() => refetchUtilityData()}
                disabled={isRefetchingUtility}
                className="ml-2 magnetic-button"
                style={refreshBtnStyle}
              >
                <RefreshCcw className={`h-4 w-4 mr-1 ${isRefetchingUtility ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex mb-4 space-x-2">
          <Button
            variant={timeRange === 'day' ? 'default' : 'outline'}
            onClick={() => setTimeRange('day')}
            size="sm"
            className="glow-effect"
          >
            Day
          </Button>
          <Button
            variant={timeRange === 'week' ? 'default' : 'outline'}
            onClick={() => setTimeRange('week')}
            size="sm"
            className="glow-effect"
          >
            Week
          </Button>
          <Button
            variant={timeRange === 'month' ? 'default' : 'outline'}
            onClick={() => setTimeRange('month')}
            size="sm"
            className="glow-effect"
          >
            Month
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 glassmorphic overflow-hidden">
            <NoiseTexture opacity={0.02} />
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="h-[400px] flex items-center justify-center">
                  <p>Loading energy data...</p>
                </div>
              ) : isWaitingForBayou ? (
                <div className="h-[400px] flex flex-col items-center justify-center text-center">
                  <div className="animate-pulse mb-4">
                    <div className="h-8 w-8 rounded-full bg-blue-200 mx-auto"></div>
                  </div>
                  <p>Waiting for your utility data to be ready...</p>
                  <p className="text-sm text-muted-foreground mt-2">This may take a few minutes after completing the authentication</p>
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
          <h2 className="text-2xl font-bold mb-4 text-foreground">Recommended Actions</h2>
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
