
import { useRef } from 'react';
import { generateNoise } from '../utils/CanvasUtils';
import { TimeOfDay } from '../BackgroundTypes';

export const useNoiseTexture = () => {
  const noiseImageDataRef = useRef<ImageData | null>(null);
  
  const generateNoiseTexture = (
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number, 
    timeOfDay: TimeOfDay
  ) => {
    noiseImageDataRef.current = generateNoise(
      ctx, 
      width, 
      height, 
      timeOfDay === 'night' ? 5 : 10
    );
    
    return noiseImageDataRef;
  };
  
  return { noiseImageDataRef, generateNoiseTexture };
};
