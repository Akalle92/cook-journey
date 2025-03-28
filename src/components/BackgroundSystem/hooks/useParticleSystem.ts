
import { useEffect, useRef } from 'react';
import { Particle } from '../particles/ParticleTypes';
import { initParticles } from '../particles/ParticleSystem';
import { CuisineType, Mood, cuisineTextures, moodSettings } from '../BackgroundTypes';

interface UseParticleSystemProps {
  canvasWidth: number;
  canvasHeight: number;
  cuisineType: CuisineType;
  mood: Mood;
  isReducedMotion: boolean;
}

export const useParticleSystem = ({
  canvasWidth,
  canvasHeight,
  cuisineType,
  mood,
  isReducedMotion
}: UseParticleSystemProps) => {
  const particleSystemRef = useRef<Particle[]>([]);
  
  // Initialize particles when canvas, cuisine or mood changes
  useEffect(() => {
    if (!canvasWidth || !canvasHeight) return;
    
    // Get current settings
    const currentCuisine = cuisineTextures[cuisineType];
    const currentMood = moodSettings[mood];
    
    // Initialize particles with fewer if reduced motion is enabled
    const motionMultiplier = isReducedMotion ? 0.3 : 1;
    
    particleSystemRef.current = initParticles(
      canvasWidth, 
      canvasHeight, 
      currentCuisine.accentColor,
      currentMood.particleTypes,
      currentMood.particleDensity * motionMultiplier,
      currentMood.particleSpeed * motionMultiplier
    );
    
  }, [canvasWidth, canvasHeight, cuisineType, mood, isReducedMotion]);
  
  return particleSystemRef;
};
