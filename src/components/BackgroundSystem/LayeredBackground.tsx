
import React, { useEffect, useState } from 'react';
import { useBackground } from './BackgroundContext';
import { useBackgroundCanvas } from './hooks/useBackgroundCanvas';
import { TextureOverlay } from './TextureOverlay';
import { Moon, Sun, Cloud, CloudRain } from 'lucide-react';

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
  
  // Select time-appropriate icon
  const TimeIcon = {
    morning: Sun,
    afternoon: Cloud,
    evening: CloudRain,
    night: Moon
  }[timeOfDay];
  
  return (
    <div 
      className={`fixed inset-0 z-[-1] overflow-hidden ${mood ? `mood-${mood}` : ''} ${className || ''}`}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ 
          opacity: 0.8,
          visibility: isVisible ? 'visible' : 'hidden',
          transition: 'opacity 0.5s ease-in-out'
        }}
      />
      <div className="absolute inset-0 backdrop-blur-[2px]" />
      
      {/* Add time-appropriate animated icon */}
      <div className="absolute top-4 right-4 opacity-20 animate-pulse">
        <TimeIcon size={64} strokeWidth={1} className="text-white/20" />
      </div>
      
      {/* Enhanced texture overlay with more variety */}
      <TextureOverlay 
        type={timeOfDay === 'night' ? 'marble' : timeOfDay === 'morning' ? 'wood' : 'ceramic'} 
        opacity={0.08} 
        blend="soft-light"
      />
    </div>
  );
};

