
import React from 'react';

interface NoiseTextureProps {
  className?: string;
  opacity?: number;
}

export const NoiseTexture = ({ className, opacity = 0.03 }: NoiseTextureProps) => {
  return (
    <div 
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} 
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        opacity: opacity,
        mixBlendMode: 'overlay'
      }}
    />
  );
};

export default NoiseTexture;
