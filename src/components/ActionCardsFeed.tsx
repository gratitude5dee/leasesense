
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { generateRecommendations } from '@/lib/supabase-functions';
import { UtilityDataPoint, CarbonIntensityData, PaymentStatus } from '@/types/energy';
import ActionCard from '@/components/ActionCard';
import { Constants } from '@/integrations/supabase/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

type UserType = typeof Constants.public.Enums.user_type[number];

export default function ActionCardsFeed({
  utilityData,
  carbonData,
  userType,
  sqFt,
  paymentStatus
}: {
  utilityData: UtilityDataPoint[];
  carbonData?: CarbonIntensityData;
  userType: UserType;
  sqFt?: number | null;
  paymentStatus?: PaymentStatus;
}) {
  const { toast } = useToast();
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  // Check if certain recommendations should be disabled based on payment status
  const shouldDisableExpensiveRecommendations = paymentStatus?.status === 'Overdue';
  
  // Fetch recommendations
  const { data: recommendations, isLoading, isError } = useQuery({
    queryKey: ['recommendations', userType, utilityData.length, sqFt],
    queryFn: () => generateRecommendations(utilityData, userType, sqFt || undefined),
    meta: {
      onError: (error: any) => {
        toast({
          title: 'Error loading recommendations',
          description: error.message,
          variant: 'destructive',
        });
      }
    },
    // Only fetch if we have utility data
    enabled: utilityData.length > 0,
  });

  const handleDismiss = (id: string) => {
    setDismissedIds([...dismissedIds, id]);
    toast({
      title: "Recommendation Dismissed",
      description: "This recommendation will not show up again.",
    });
  };

  const handleLearnMore = (id: string) => {
    toast({
      title: "Feature Coming Soon",
      description: "Detailed information will be available in a future update.",
    });
  };

  // Filter out dismissed recommendations
  const filteredRecommendations = recommendations?.filter(rec => !dismissedIds.includes(rec.id)) || [];

  return (
    <div className="space-y-6">
      {shouldDisableExpensiveRecommendations && (
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Payment Status: Overdue</AlertTitle>
          <AlertDescription>
            Some recommendations requiring upfront costs have been disabled until your account is current.
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <p className="text-center py-4">Loading recommendations...</p>
      ) : isError ? (
        <p className="text-center text-red-500 py-4">
          There was an error loading recommendations. Please try again later.
        </p>
      ) : filteredRecommendations.length === 0 ? (
        <p className="text-center py-4">No recommendations available at this time.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecommendations.map(recommendation => (
            <ActionCard
              key={recommendation.id}
              recommendation={recommendation}
              onDismiss={() => handleDismiss(recommendation.id)}
              onLearnMore={() => handleLearnMore(recommendation.id)}
              disabled={
                // Disable equipment recommendations (which typically cost money) for overdue accounts
                shouldDisableExpensiveRecommendations && recommendation.type === 'equipment'
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
