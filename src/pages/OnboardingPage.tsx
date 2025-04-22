
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [utilityProvider, setUtilityProvider] = useState<string>('');
  
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
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      });
      
      navigate('/dashboard');
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
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome to LeaseSense</CardTitle>
          <CardDescription>
            Tell us a bit about yourself to get started
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
              <Label htmlFor="utility">Utility Provider (optional)</Label>
              <Input
                id="utility"
                placeholder="Enter your utility provider"
                value={utilityProvider}
                onChange={(e) => setUtilityProvider(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Continue to Dashboard'}
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      <div className="mt-8 text-center max-w-md">
        <h3 className="text-lg font-medium mb-2">Coming Soon: Bayou Integration</h3>
        <p className="text-sm text-gray-600">
          Connect your utility account via Bayou to get real-time data and more accurate recommendations.
        </p>
      </div>
    </div>
  );
}
