
import { useState, useEffect } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle } from 'lucide-react';
import { createBayouCustomer } from '@/lib/supabase-functions';

type UserType = typeof Constants.public.Enums.user_type[number];

// Map of display names to Bayou utility codes
const UTILITY_OPTIONS = [
  { label: "Speculoos Power (Test)", value: "Speculoos Power (Test)" },
  { label: "PG&E", value: "PG&E" },
  { label: "Southern California Edison", value: "Southern California Edison" },
  { label: "San Diego Gas & Electric", value: "San Diego Gas & Electric" },
  { label: "Austin Energy", value: "Austin Energy" },
  { label: "CPS Energy", value: "CPS Energy" },
  { label: "Duke Energy", value: "Duke Energy" }
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { setPersona } = usePersona();
  const [loading, setLoading] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<UserType>('renter');
  const [sqFt, setSqFt] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [utilityProvider, setUtilityProvider] = useState<string>("Speculoos Power (Test)");
  const [onboardingLink, setOnboardingLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);
  
  // Effect for auto-redirecting after countdown
  useEffect(() => {
    if (redirectCountdown === null) return;
    
    if (redirectCountdown <= 0) {
      navigate('/dashboard');
      return;
    }
    
    const timer = setTimeout(() => {
      setRedirectCountdown(redirectCountdown - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [redirectCountdown, navigate]);
  
  // Mutation for creating Bayou customer
  const createBayouCustomerMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      setError(null);
      
      try {
        return await createBayouCustomer(utilityProvider);
      } catch (error: any) {
        console.error("Error creating Bayou customer:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      setOnboardingLink(data.onboarding_link);
      toast({
        title: 'Utility Connection',
        description: 'Please complete the utility account authentication in the provided link.',
      });
      
      // Start countdown for auto-redirect
      setRedirectCountdown(30);
    },
    onError: (error: any) => {
      console.error("Bayou customer creation error:", error);
      let errorMessage = "Failed to connect to utility provider";
      
      // Extract more specific error message if available
      if (error.message && typeof error.message === 'string') {
        errorMessage = error.message;
      } else if (error.details) {
        errorMessage = JSON.stringify(error.details);
      }
      
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
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
      setError(error.message || "Failed to update profile");
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

  const handleCancelRedirect = () => {
    setRedirectCountdown(null);
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm shadow-xl">
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
              <Select 
                value={utilityProvider} 
                onValueChange={(value) => setUtilityProvider(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a utility provider" />
                </SelectTrigger>
                <SelectContent>
                  {UTILITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Use "Speculoos Power (Test)" for testing purposes
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 p-3 rounded-md flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-800 text-sm font-medium">Error connecting utility</p>
                  <p className="text-red-700 text-xs">{error}</p>
                </div>
              </div>
            )}

            {onboardingLink && (
              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md">
                <p className="text-yellow-800 text-sm font-medium">
                  Action Required: Please authenticate your utility account
                </p>
                <p className="text-yellow-700 text-sm mb-2">
                  Open the link below in a new browser tab to connect your account:
                </p>
                <a 
                  href={onboardingLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all text-sm"
                >
                  {onboardingLink}
                </a>
                <div className="mt-3 bg-blue-50 border border-blue-100 p-2 rounded">
                  <p className="text-xs text-blue-700 font-medium">Testing Credentials:</p>
                  <p className="text-xs text-blue-700">Email: iamvalid@bayou.energy</p>
                  <p className="text-xs text-blue-700">Password: validpassword</p>
                </div>
                
                {redirectCountdown !== null && (
                  <div className="mt-3 bg-green-50 border border-green-100 p-2 rounded flex justify-between items-center">
                    <div>
                      <p className="text-xs text-green-700 font-medium">
                        Auto-redirecting to dashboard in {redirectCountdown} seconds...
                      </p>
                      <p className="text-xs text-green-700">
                        Your data will be processed in the background
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleCancelRedirect}
                      className="text-xs h-7"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter>
            {!onboardingLink ? (
              <Button
                type="submit"
                className="w-full"
                disabled={loading || createBayouCustomerMutation.isPending}
              >
                {loading || createBayouCustomerMutation.isPending ? 'Connecting...' : 'Connect Utility'}
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
