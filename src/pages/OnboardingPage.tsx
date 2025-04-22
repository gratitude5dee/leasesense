
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Constants } from '@/integrations/supabase/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePersona } from '@/contexts/PersonaContext';

type UserType = typeof Constants.public.Enums.user_type[number];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { setPersona } = usePersona();
  const [loading, setLoading] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<UserType>('renter');
  const [sqFt, setSqFt] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [utilityProvider, setUtilityProvider] = useState<string>('speculoos_power');
  const [onboardingLink, setOnboardingLink] = useState<string | null>(null);
  
  // Mutation for creating Bayou customer
  const createBayouCustomerMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase.functions.invoke('createBayouCustomer', {
        body: { utility_name: utilityProvider }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setOnboardingLink(data.onboarding_link);
      toast({
        title: 'Utility Connection',
        description: 'Please complete the utility account authentication in the provided link.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          user_type: selectedPersona,
          sq_ft: sqFt ? parseInt(sqFt, 10) : null,
          address: address || null,
          utility_provider: utilityProvider || null,
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      setPersona(selectedPersona);
      
      // Trigger Bayou customer creation
      createBayouCustomerMutation.mutate();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleContinueToDashboard = () => {
    navigate('/dashboard');
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome to LeaseSense</CardTitle>
          <CardDescription>
            Tell us a bit about yourself and connect your utility account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">I am a:</h3>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={selectedPersona === 'renter' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setSelectedPersona('renter')}
                >
                  Home Renter
                </Button>
                <Button
                  type="button"
                  variant={selectedPersona === 'shop' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setSelectedPersona('shop')}
                >
                  Shop Owner
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address (optional)</Label>
              <Input
                id="address"
                placeholder="123 Main St, City, State"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sqFt">Square Footage (optional)</Label>
              <Input
                id="sqFt"
                type="number"
                placeholder="Enter square footage"
                value={sqFt}
                onChange={(e) => setSqFt(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="utility">Utility Provider</Label>
              <Input
                id="utility"
                placeholder="Enter your utility provider"
                value={utilityProvider}
                onChange={(e) => setUtilityProvider(e.target.value)}
              />
            </div>

            {onboardingLink && (
              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md">
                <p className="text-yellow-800 text-sm">
                  Please open this link in a new tab to authenticate your utility account:
                </p>
                <a 
                  href={onboardingLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  {onboardingLink}
                </a>
                <p className="text-xs text-yellow-700 mt-2">
                  Use Email: iamvalid@bayou.energy and Password: validpassword for testing.
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            {!onboardingLink ? (
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Connecting...' : 'Connect Utility'}
              </Button>
            ) : (
              <Button
                type="button"
                className="w-full"
                onClick={handleContinueToDashboard}
              >
                Continue to Dashboard
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
