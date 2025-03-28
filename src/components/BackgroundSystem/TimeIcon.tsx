
import React from 'react';
import { Moon, Sun, Cloud, CloudRain } from 'lucide-react';
import { TimeOfDay } from './BackgroundTypes';

interface TimeIconProps {
  timeOfDay: TimeOfDay;
  className?: string;
  size?: number;
}

export const TimeIcon: React.FC<TimeIconProps> = ({ 
  timeOfDay, 
  className = "text-white/20", 
  size = 64 
}) => {
  // Select time-appropriate icon
  const IconComponent = {
    morning: Sun,
    afternoon: Cloud,
    evening: CloudRain,
    night: Moon
  }[timeOfDay];

  return (
    <div className={`animate-pulse ${className}`}>
      <IconComponent size={size} strokeWidth={1} />
    </div>
  );
};
