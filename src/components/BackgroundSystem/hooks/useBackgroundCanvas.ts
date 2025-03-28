
import { useEffect, useRef, useState } from 'react';
import { Particle } from '../particles/ParticleTypes';
import { initParticles, updateParticlesWithMouse } from '../particles/ParticleSystem';
import { TimeOfDay, CuisineType, Mood, timeGradients, cuisineTextures, moodSettings } from '../BackgroundTypes';
import { createGradient, generateNoise, createMouseHighlight } from '../utils/CanvasUtils';
import { drawPatternByCuisine } from '../patterns/BackgroundPatterns';

interface UseBackgroundCanvasProps {
  timeOfDay: TimeOfDay;
  cuisineType: CuisineType;
  mood: Mood;
}

export const useBackgroundCanvas = ({ timeOfDay, cuisineType, mood }: UseBackgroundCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);
  const [isMouseMoving, setIsMouseMoving] = useState(false);
  const [isWindowFocused, setIsWindowFocused] = useState(true);
  const mouseMovingTimeoutRef = useRef<number | null>(null);
  const particleSystemRef = useRef<Particle[]>([]);

  // Track window focus
  useEffect(() => {
    const handleFocus = () => setIsWindowFocused(true);
    const handleBlur = () => setIsWindowFocused(false);
    
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Track mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      setIsMouseMoving(true);
      
      // Reset mouse moving state after some time of inactivity
      if (mouseMovingTimeoutRef.current) {
        clearTimeout(mouseMovingTimeoutRef.current);
      }
      
      mouseMovingTimeoutRef.current = window.setTimeout(() => {
        setIsMouseMoving(false);
      }, 2000);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (mouseMovingTimeoutRef.current) {
        clearTimeout(mouseMovingTimeoutRef.current);
      }
    };
  }, []);

  // Initialize particles when canvas, cuisine or mood changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Update canvas size
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    updateCanvasSize();
    
    // Get current settings
    const currentCuisine = cuisineTextures[cuisineType];
    const currentMood = moodSettings[mood];
    
    // Initialize particles
    particleSystemRef.current = initParticles(
      canvas.width, 
      canvas.height, 
      currentCuisine.accentColor,
      currentMood.particleTypes,
      currentMood.particleDensity,
      currentMood.particleSpeed
    );
    
    // Handle window resize
    const handleResize = () => {
      updateCanvasSize();
      particleSystemRef.current = initParticles(
        canvas.width, 
        canvas.height, 
        currentCuisine.accentColor,
        currentMood.particleTypes,
        currentMood.particleDensity,
        currentMood.particleSpeed
      );
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [cuisineType, mood]);

  // Animation loop for background effects
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    
    // Render animation frame
    const render = () => {
      // Skip rendering when window is not focused to save resources
      if (!isWindowFocused) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }
      
      const currentGradient = timeGradients[timeOfDay];
      const currentCuisine = cuisineTextures[cuisineType];
      const currentMood = moodSettings[mood];
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw base gradient
      ctx.fillStyle = createGradient(
        ctx, 
        canvas.width, 
        canvas.height, 
        currentGradient.colors, 
        currentGradient.angle
      );
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Apply noise texture with low opacity
      const noiseOpacity = timeOfDay === 'night' ? 5 : 10;
      ctx.putImageData(
        generateNoise(ctx, canvas.width, canvas.height, noiseOpacity), 
        0, 
        0
      );
      
      // Update and draw particles
      particleSystemRef.current = updateParticlesWithMouse(
        particleSystemRef.current,
        canvas.width,
        canvas.height,
        mousePosition,
        isMouseMoving,
        currentMood
      );
      
      particleSystemRef.current.forEach(particle => {
        particle.draw(ctx);
      });
      
      // Add cuisine-specific pattern overlay
      ctx.fillStyle = `rgba(${parseInt(currentCuisine.accentColor.slice(1, 3), 16)}, ${parseInt(currentCuisine.accentColor.slice(3, 5), 16)}, ${parseInt(currentCuisine.accentColor.slice(5, 7), 16)}, 0.04)`;
      
      // Draw pattern based on cuisine type
      drawPatternByCuisine(ctx, canvas.width, canvas.height, currentCuisine.pattern);
      
      // Add interactive highlight if mouse is moving
      if (mousePosition && isMouseMoving) {
        const gradientRadius = 150;
        ctx.fillStyle = createMouseHighlight(ctx, mousePosition.x, mousePosition.y, gradientRadius);
        ctx.beginPath();
        ctx.arc(mousePosition.x, mousePosition.y, gradientRadius, 0, Math.PI * 2);
        ctx.fill();
      }
      
      animationFrameId = requestAnimationFrame(render);
    };
    
    // Start animation
    render();
    
    // Clean up
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [timeOfDay, cuisineType, mood, mousePosition, isMouseMoving, isWindowFocused]);

  return canvasRef;
};
