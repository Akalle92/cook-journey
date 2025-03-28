
import { useRef } from 'react';
import { TimeOfDay, CuisineType, Mood, timeGradients, cuisineTextures, moodSettings } from '../BackgroundTypes';
import { updateParticlesWithMouse, renderParticlesByType } from '../particles/ParticleSystem';
import { createGradient } from '../utils/CanvasUtils';
import { drawPatternByCuisine } from '../patterns/BackgroundPatterns';
import { useCanvasSize } from './useCanvasSize';
import { useWindowFocus } from './useWindowFocus';
import { useReducedMotion } from './useReducedMotion';
import { useParticleSystem } from './useParticleSystem';
import { useNoiseTexture } from './useNoiseTexture';
import { useAnimationFrame } from './useAnimationFrame';

interface UseBackgroundCanvasProps {
  timeOfDay: TimeOfDay;
  cuisineType: CuisineType;
  mood: Mood;
}

export const useBackgroundCanvas = ({ 
  timeOfDay, 
  cuisineType, 
  mood 
}: UseBackgroundCanvasProps) => {
  const { canvasRef, updateCanvasSize } = useCanvasSize();
  const isWindowFocused = useWindowFocus();
  const isReducedMotion = useReducedMotion();
  const { noiseImageDataRef, generateNoiseTexture } = useNoiseTexture();
  const frameCountRef = useRef<number>(0);
  
  // Initialize canvas and get dimensions
  const getCanvasContext = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return null;
    
    return { canvas, ctx, width: canvas.width, height: canvas.height };
  };
  
  // Update canvas size and initialize particles
  const setupCanvas = () => {
    const canvasData = updateCanvasSize();
    if (!canvasData) return { width: 0, height: 0 };
    
    const { ctx, width, height } = canvasData;
    generateNoiseTexture(ctx, width, height, timeOfDay);
    
    return { width, height };
  };
  
  // Get canvas dimensions for particle system
  const dimensions = setupCanvas();
  
  // Initialize particle system
  const particleSystemRef = useParticleSystem({
    canvasWidth: dimensions.width,
    canvasHeight: dimensions.height,
    cuisineType,
    mood,
    isReducedMotion
  });
  
  // Render animation frame
  const renderFrame = (timestamp: number) => {
    const canvasData = getCanvasContext();
    if (!canvasData) return;
    
    const { ctx, width, height } = canvasData;
    frameCountRef.current++;
    
    const currentGradient = timeGradients[timeOfDay];
    const currentCuisine = cuisineTextures[cuisineType];
    const currentMood = moodSettings[mood];
    
    // Clear canvas - use fillRect instead of clearRect for better performance
    ctx.fillStyle = createGradient(
      ctx, 
      width, 
      height, 
      currentGradient.colors, 
      currentGradient.angle
    );
    ctx.fillRect(0, 0, width, height);
    
    // Apply pre-generated noise texture with low opacity
    if (noiseImageDataRef.current) {
      ctx.putImageData(noiseImageDataRef.current, 0, 0);
    }
    
    // Update particles without mouse interaction
    particleSystemRef.current.forEach(particle => {
      particle.update(width, height);
    });
    
    // Render particles grouped by type for better performance
    renderParticlesByType(ctx, particleSystemRef.current);
    
    // Add cuisine-specific pattern overlay (only on some frames)
    if (frameCountRef.current % 2 === 0) { // Only render pattern every other frame
      ctx.fillStyle = `rgba(${parseInt(currentCuisine.accentColor.slice(1, 3), 16)}, ${parseInt(currentCuisine.accentColor.slice(3, 5), 16)}, ${parseInt(currentCuisine.accentColor.slice(5, 7), 16)}, 0.04)`;
      
      // Draw pattern based on cuisine type
      drawPatternByCuisine(ctx, width, height, currentCuisine.pattern);
    }
  };
  
  // Animation loop
  useAnimationFrame({
    callback: renderFrame,
    isEnabled: isWindowFocused,
    targetFPS: isReducedMotion ? 30 : 60
  });
  
  return canvasRef;
};

