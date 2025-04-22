
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Recommendation } from '@/types/energy';
import { NoiseTexture } from '@/components/ui/NoiseTexture';
import { useMouseInteraction } from '@/hooks/useMouseInteraction';

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
  const cardRef = useRef<HTMLDivElement>(null);
  const dismissBtnRef = useRef<HTMLButtonElement>(null);
  const learnMoreBtnRef = useRef<HTMLButtonElement>(null);
  
  // 3D card tilt effect
  const { style: cardStyle } = useMouseInteraction(cardRef, {
    rotation: 7.5, // Subtle rotation
    scale: 1.02, // Subtle scale
    perspective: 1200
  });
  
  // Magnetic effect for buttons
  const { magneticStyle: dismissStyle } = useMouseInteraction(dismissBtnRef, { 
    magnetic: true,
    magneticStrength: 0.3
  });
  
  const { magneticStyle: learnMoreStyle } = useMouseInteraction(learnMoreBtnRef, { 
    magnetic: true,
    magneticStrength: 0.3
  });

  return (
    <Card 
      ref={cardRef} 
      className={`enhanced-card shimmer-effect ${disabled ? 'opacity-70' : ''}`}
      style={cardStyle}
    >
      {/* Add noise texture */}
      <NoiseTexture opacity={0.02} />
      
      <div className="card-content-3d">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{recommendation.title}</CardTitle>
            <div className="rounded-full px-2 py-1 text-xs font-semibold bg-green-100/80 backdrop-blur-sm text-green-800">
              {recommendation.type === 'behavioral' ? 'Habit Change' : 'Equipment'}
            </div>
          </div>
          <CardDescription>Potential Savings: {recommendation.potential_savings}</CardDescription>
        </CardHeader>
        <CardContent>
          <p>{recommendation.description}</p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            ref={dismissBtnRef}
            variant="outline" 
            size="sm" 
            onClick={onDismiss} 
            disabled={disabled}
            className="magnetic-button glow-effect"
            style={dismissStyle}
          >
            Dismiss
          </Button>
          <Button 
            ref={learnMoreBtnRef}
            size="sm" 
            onClick={onLearnMore} 
            disabled={disabled}
            className="magnetic-button glow-effect"
            style={learnMoreStyle}
          >
            Learn More
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
}
