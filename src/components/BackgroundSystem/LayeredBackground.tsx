
import React from 'react';
import { useBackground } from './BackgroundContext';
import { BackgroundCanvas } from './BackgroundCanvas';
import { TextureOverlay } from './TextureOverlay';
import { TimeIcon } from './TimeIcon';

interface LayeredBackgroundProps {
  className?: string;
}

export const LayeredBackground: React.FC<LayeredBackgroundProps> = ({ className }) => {
  const { timeOfDay, cuisineType, mood } = useBackground();
  
  return (
    <div 
      className={`fixed inset-0 z-[-1] overflow-hidden ${mood ? `mood-${mood}` : ''} ${className || ''}`}
    >
      {/* Canvas background with particles */}
      <BackgroundCanvas 
        timeOfDay={timeOfDay}
        cuisineType={cuisineType}
        mood={mood}
      />
      
      {/* Blur overlay */}
      <div className="absolute inset-0 backdrop-blur-[2px]" />
      
      {/* Time-based icon in the corner */}
      <div className="absolute top-4 right-4 opacity-20">
        <TimeIcon timeOfDay={timeOfDay} />
      </div>
      
      {/* Texture overlay based on time of day */}
      <TextureOverlay 
        type={timeOfDay === 'night' ? 'marble' : timeOfDay === 'morning' ? 'wood' : 'ceramic'} 
        opacity={0.08} 
        blend="soft-light"
      />
    </div>
  );
};
