
import React, { useEffect, useState } from 'react';
import { useBackground } from './BackgroundContext';
import { useBackgroundCanvas } from './hooks/useBackgroundCanvas';

interface LayeredBackgroundProps {
  className?: string;
}

export const LayeredBackground: React.FC<LayeredBackgroundProps> = ({ className }) => {
  const { timeOfDay, cuisineType, mood } = useBackground();
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
    <div className={`fixed inset-0 z-[-1] overflow-hidden ${mood ? `mood-${mood}` : ''} ${className || ''}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ 
          opacity: 0.8,
          visibility: isVisible ? 'visible' : 'hidden'
        }}
      />
      <div className="absolute inset-0 backdrop-blur-[2px]" />
    </div>
  );
};
