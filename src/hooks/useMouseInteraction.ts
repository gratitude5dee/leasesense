
import { useState, useEffect, useCallback, RefObject } from 'react';

interface UseMouseInteractionOptions {
  perspective?: number;
  scale?: number;
  rotation?: number;
  distance?: number;
  enter?: (e: MouseEvent) => void;
  leave?: (e: MouseEvent) => void;
  magnetic?: boolean;
  magneticStrength?: number;
}

interface MousePosition {
  x: number;
  y: number;
}

export function useMouseInteraction<T extends HTMLElement>(
  ref: RefObject<T>,
  options: UseMouseInteractionOptions = {}
) {
  const {
    perspective = 1000,
    scale = 1.05,
    rotation = 20,
    distance = 0,
    enter,
    leave,
    magnetic = false,
    magneticStrength = 0.3
  } = options;

  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });
  const [magneticPosition, setMagneticPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!ref.current) return;

    const element = ref.current;
    const rect = element.getBoundingClientRect();
    
    const width = rect.width;
    const height = rect.height;
    
    // Calculate mouse position relative to card center
    const centerX = rect.left + width / 2;
    const centerY = rect.top + height / 2;
    
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    // Calculate rotation values (invert for natural tilt)
    const rotateY = (mouseX / (width / 2)) * -rotation;
    const rotateX = (mouseY / (height / 2)) * rotation;
    
    // Set mouse position for component to use
    setMousePosition({
      x: rotateY,
      y: rotateX
    });
    
    // Calculate magnetic effect if enabled
    if (magnetic) {
      const maxDistance = Math.max(width, height) * 0.5;
      const mouseDistance = Math.sqrt(mouseX * mouseX + mouseY * mouseY);
      const magneticPull = Math.max(0, 1 - (mouseDistance / maxDistance));
      
      // Magnetic pull increases as mouse gets closer
      const moveX = (mouseX / width) * magneticStrength * 30 * magneticPull;
      const moveY = (mouseY / height) * magneticStrength * 30 * magneticPull;
      
      setMagneticPosition({
        x: moveX,
        y: moveY
      });
    }
  }, [ref, rotation, magnetic, magneticStrength]);

  const handleMouseEnter = useCallback((e: MouseEvent) => {
    setIsHovered(true);
    if (enter) enter(e);
  }, [enter]);

  const handleMouseLeave = useCallback((e: MouseEvent) => {
    setIsHovered(false);
    setMousePosition({ x: 0, y: 0 });
    setMagneticPosition({ x: 0, y: 0 });
    if (leave) leave(e);
  }, [leave]);
  
  // Apply event listeners
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [ref, handleMouseMove, handleMouseEnter, handleMouseLeave]);

  // Calculate the style object for 3D transforms
  const style = {
    transform: isHovered 
      ? `
        perspective(${perspective}px)
        rotateX(${mousePosition.y}deg)
        rotateY(${mousePosition.x}deg)
        scale3d(${scale}, ${scale}, ${scale})
        translateZ(${distance}px)
      ` 
      : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1) translateZ(0px)',
    transition: isHovered ? 'none' : 'transform 0.5s ease-out',
  };
  
  // Calculate magnetic button styles
  const magneticStyle = {
    transform: `translate(${magneticPosition.x}px, ${magneticPosition.y}px)`,
    transition: isHovered ? 'none' : 'transform 0.5s ease-out',
  };

  return { 
    style, 
    magneticStyle,
    isHovered, 
    mousePosition 
  };
}
