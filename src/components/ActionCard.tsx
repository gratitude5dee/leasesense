
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Recommendation } from '@/types/energy';

export default function ActionCard({ 
  recommendation,
  onDismiss,
  onLearnMore,
  disabled = false
}: { 
  recommendation: Recommendation;
  onDismiss: () => void;
  onLearnMore: () => void;
  disabled?: boolean;
}) {
  return (
    <Card className={disabled ? 'opacity-70' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{recommendation.title}</CardTitle>
          <div className="rounded-full px-2 py-1 text-xs font-semibold bg-green-100 text-green-800">
            {recommendation.type === 'behavioral' ? 'Habit Change' : 'Equipment'}
          </div>
        </div>
        <CardDescription>Potential Savings: {recommendation.potential_savings}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>{recommendation.description}</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" onClick={onDismiss} disabled={disabled}>
          Dismiss
        </Button>
        <Button size="sm" onClick={onLearnMore} disabled={disabled}>
          Learn More
        </Button>
      </CardFooter>
    </Card>
  );
}
