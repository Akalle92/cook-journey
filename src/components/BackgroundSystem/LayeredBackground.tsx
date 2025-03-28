
import React from 'react';
import { useBackground } from './BackgroundContext';
import { useBackgroundCanvas } from './hooks/useBackgroundCanvas';

interface LayeredBackgroundProps {
  className?: string;
}

export const LayeredBackground: React.FC<LayeredBackgroundProps> = ({ className }) => {
  const { timeOfDay, cuisineType, mood } = useBackground();
  const canvasRef = useBackgroundCanvas({ timeOfDay, cuisineType, mood });
  
  return (
    <div className={`fixed inset-0 z-[-1] overflow-hidden ${mood ? `mood-${mood}` : ''} ${className || ''}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0.8 }}
      />
      <div className="absolute inset-0 backdrop-blur-[2px]" />
    </div>
  );
};
