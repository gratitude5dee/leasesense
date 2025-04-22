
import { useState, useEffect } from 'react';
import AuthForm from "@/components/auth/AuthForm";
import { NoiseTexture } from "@/components/ui/NoiseTexture";

export default function AuthPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Track mouse position for subtle parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate mouse position relative to window center
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePosition({ x, y });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <NoiseTexture opacity={0.02} />
      
      <div 
        className="w-full max-w-md"
        style={{
          transform: `translate(${mousePosition.x * -5}px, ${mousePosition.y * -5}px)`,
          transition: 'transform 0.3s ease-out'
        }}
      >
        <h1 className="text-3xl font-bold text-center mb-8 text-foreground animate-float">
          Welcome to LeaseSense
        </h1>
        <div className="glassmorphic p-6 rounded-lg shadow-lg overflow-hidden transition-all duration-300">
          <NoiseTexture opacity={0.02} />
          <div className="shimmer-effect">
            <AuthForm />
          </div>
        </div>
      </div>
    </div>
  );
}
