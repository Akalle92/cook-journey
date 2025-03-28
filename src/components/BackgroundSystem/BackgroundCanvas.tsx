
import React, { useEffect, useState } from 'react';
import { useBackgroundCanvas } from './hooks/useBackgroundCanvas';
import { TimeOfDay, CuisineType, Mood } from './BackgroundTypes';

interface BackgroundCanvasProps {
  timeOfDay: TimeOfDay;
  cuisineType: CuisineType;
  mood: Mood;
  className?: string;
}

export const BackgroundCanvas: React.FC<BackgroundCanvasProps> = ({
  timeOfDay,
  cuisineType,
  mood,
  className
}) => {
  const canvasRef = useBackgroundCanvas({ timeOfDay, cuisineType, mood });
  const [isVisible, setIsVisible] = useState(true);
  
  // Use intersection observer to only animate when visible
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          setIsVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.1 }
    );
    
    observer.observe(canvasRef.current);
    
    return () => {
      if (canvasRef.current) {
        observer.unobserve(canvasRef.current);
      }
      observer.disconnect();
    };
  }, [canvasRef]);
  
  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className || ''}`}
      style={{ 
        opacity: 0.8,
        visibility: isVisible ? 'visible' : 'hidden',
        transition: 'opacity 0.5s ease-in-out'
      }}
    />
  );
};
