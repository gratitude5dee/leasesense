
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UtilityDataPoint, CarbonIntensityData } from '@/types/energy';

export default function NeighborhoodMapPlaceholder({
  utilityData,
  carbonData,
}: {
  utilityData: UtilityDataPoint[];
  carbonData?: CarbonIntensityData;
}) {
  const [open, setOpen] = useState(false);

  // Calculate approximate CO2e emissions
  const totalKwh = utilityData.reduce((sum, point) => sum + point.kwh, 0);
  const totalEmissions = carbonData ? totalKwh * carbonData.co2e_per_kwh : totalKwh * 0.4; // Use 0.4 kg/kWh as fallback
  
  // Calculate fake savings (this would be more sophisticated in a real app)
  const estimatedSavings = Math.round(totalEmissions * 0.15); // Assume 15% savings

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Neighborhood Impact</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center justify-center py-6 bg-green-50 rounded-lg">
          <div className="text-center mb-4">
            <p className="text-sm text-muted-foreground">Your household emitted approximately</p>
            <p className="text-3xl font-bold text-green-700">{totalEmissions.toFixed(1)} kg CO₂e</p>
            <p className="text-sm text-muted-foreground">this month</p>
          </div>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Generate Impact Proof</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Your Environmental Impact</DialogTitle>
                <DialogDescription>
                  Share your energy savings achievements
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="rounded-lg bg-green-50 p-4">
                  <h3 className="font-semibold">Total Emissions Saved</h3>
                  <p className="text-2xl font-bold text-green-700">{estimatedSavings} kg CO₂e</p>
                  <p className="text-sm text-muted-foreground">
                    That's equivalent to planting {Math.round(estimatedSavings / 10)} trees!
                  </p>
                </div>
                
                <div className="rounded-lg bg-blue-50 p-4">
                  <h3 className="font-semibold">Your Performance</h3>
                  <p className="text-md">
                    You're using <span className="font-bold">17% less</span> energy than similar households in your area.
                  </p>
                </div>
                
                <div className="mt-4 text-center">
                  <Button onClick={() => setOpen(false)}>
                    Share Impact (Coming Soon)
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <p className="text-xs text-center text-muted-foreground mt-4 max-w-xs">
            Detailed neighborhood comparison map coming soon. Track your impact against others in your area.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
