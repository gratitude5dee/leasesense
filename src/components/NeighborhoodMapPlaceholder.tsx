
import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UtilityDataPoint, CarbonIntensityData } from '@/types/energy';
import { NoiseTexture } from '@/components/ui/NoiseTexture';
import { useMouseInteraction } from '@/hooks/useMouseInteraction';

export default function NeighborhoodMapPlaceholder({
  utilityData,
  carbonData,
}: {
  utilityData: UtilityDataPoint[];
  carbonData?: CarbonIntensityData;
}) {
  const [open, setOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Interactive card effect
  const { style: cardStyle } = useMouseInteraction(cardRef, {
    rotation: 5,
    scale: 1.015,
    perspective: 1200
  });
  
  // Magnetic button effect
  const { magneticStyle: buttonStyle } = useMouseInteraction(buttonRef, {
    magnetic: true,
    magneticStrength: 0.4
  });

  // Calculate approximate CO2e emissions
  const totalKwh = utilityData.reduce((sum, point) => sum + point.kwh, 0);
  const totalEmissions = carbonData ? totalKwh * carbonData.co2e_per_kwh : totalKwh * 0.4; // Use 0.4 kg/kWh as fallback
  
  // Calculate fake savings (this would be more sophisticated in a real app)
  const estimatedSavings = Math.round(totalEmissions * 0.15); // Assume 15% savings

  return (
    <Card 
      ref={cardRef}
      className="enhanced-card"
      style={cardStyle}
    >
      <NoiseTexture opacity={0.02} />
      <div className="card-content-3d">
        <CardHeader>
          <CardTitle className="text-xl">Neighborhood Impact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center justify-center py-6 bg-green-50/80 backdrop-blur-sm rounded-lg overflow-hidden relative">
            <NoiseTexture opacity={0.01} className="mix-blend-overlay" />
            
            <div className="text-center mb-4 z-10">
              <p className="text-sm text-muted-foreground">Your household emitted approximately</p>
              <p className="text-3xl font-bold text-green-700 animate-pulse-subtle">{totalEmissions.toFixed(1)} kg CO₂e</p>
              <p className="text-sm text-muted-foreground">this month</p>
            </div>
            
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button 
                  ref={buttonRef}
                  className="relative magnetic-button glow-effect z-10"
                  style={buttonStyle}
                >
                  Generate Impact Proof
                </Button>
              </DialogTrigger>
              <DialogContent className="glassmorphic sm:max-w-md">
                <NoiseTexture opacity={0.02} />
                <DialogHeader>
                  <DialogTitle>Your Environmental Impact</DialogTitle>
                  <DialogDescription>
                    Share your energy savings achievements
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="rounded-lg bg-green-50/80 backdrop-blur-sm p-4 relative overflow-hidden">
                    <NoiseTexture opacity={0.01} />
                    <h3 className="font-semibold">Total Emissions Saved</h3>
                    <p className="text-2xl font-bold text-green-700 animate-pulse-subtle">{estimatedSavings} kg CO₂e</p>
                    <p className="text-sm text-muted-foreground">
                      That's equivalent to planting {Math.round(estimatedSavings / 10)} trees!
                    </p>
                  </div>
                  
                  <div className="rounded-lg bg-blue-50/80 backdrop-blur-sm p-4 relative overflow-hidden">
                    <NoiseTexture opacity={0.01} />
                    <h3 className="font-semibold">Your Performance</h3>
                    <p className="text-md">
                      You're using <span className="font-bold">17% less</span> energy than similar households in your area.
                    </p>
                  </div>
                  
                  <div className="mt-4 text-center">
                    <Button 
                      onClick={() => setOpen(false)}
                      className="magnetic-button glow-effect"
                    >
                      Share Impact (Coming Soon)
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <p className="text-xs text-center text-muted-foreground mt-4 max-w-xs z-10">
              Detailed neighborhood comparison map coming soon. Track your impact against others in your area.
            </p>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
