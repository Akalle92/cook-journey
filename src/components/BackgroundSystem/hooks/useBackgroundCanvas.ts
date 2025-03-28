
import { useEffect, useRef, useState } from 'react';
import { Particle } from '../particles/ParticleTypes';
import { initParticles, updateParticlesWithMouse, renderParticlesByType } from '../particles/ParticleSystem';
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
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const mouseMovingTimeoutRef = useRef<number | null>(null);
  const particleSystemRef = useRef<Particle[]>([]);
  const lastFrameTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const noiseImageDataRef = useRef<ImageData | null>(null);

  // Detect prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Track window focus for performance
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

  // Track mouse movement with throttling
  useEffect(() => {
    let lastMouseMoveTime = 0;
    const THROTTLE_TIME = 16; // ~60fps
    
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      
      if (now - lastMouseMoveTime > THROTTLE_TIME) {
        lastMouseMoveTime = now;
        setMousePosition({ x: e.clientX, y: e.clientY });
        setIsMouseMoving(true);
        
        // Reset mouse moving state after some time of inactivity
        if (mouseMovingTimeoutRef.current) {
          clearTimeout(mouseMovingTimeoutRef.current);
        }
        
        mouseMovingTimeoutRef.current = window.setTimeout(() => {
          setIsMouseMoving(false);
        }, 2000);
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    
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

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Update canvas size with device pixel ratio for sharper rendering
    const updateCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      
      // Set display size
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      // Scale context
      ctx.scale(dpr, dpr);
      
      // Set CSS size
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      
      // Pre-generate noise texture
      noiseImageDataRef.current = generateNoise(
        ctx, 
        canvas.width, 
        canvas.height, 
        timeOfDay === 'night' ? 5 : 10
      );
    };
    
    updateCanvasSize();
    
    // Get current settings
    const currentCuisine = cuisineTextures[cuisineType];
    const currentMood = moodSettings[mood];
    
    // Initialize particles with fewer if reduced motion is enabled
    const motionMultiplier = isReducedMotion ? 0.3 : 1;
    
    particleSystemRef.current = initParticles(
      canvas.width, 
      canvas.height, 
      currentCuisine.accentColor,
      currentMood.particleTypes,
      currentMood.particleDensity * motionMultiplier,
      currentMood.particleSpeed * motionMultiplier
    );
    
    // Handle window resize with debouncing
    let resizeTimeout: number | null = null;
    
    const handleResize = () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      
      resizeTimeout = window.setTimeout(() => {
        updateCanvasSize();
        particleSystemRef.current = initParticles(
          canvas.width, 
          canvas.height, 
          currentCuisine.accentColor,
          currentMood.particleTypes,
          currentMood.particleDensity * motionMultiplier,
          currentMood.particleSpeed * motionMultiplier
        );
      }, 200);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
    };
  }, [cuisineType, mood, isReducedMotion, timeOfDay]);

  // Animation loop with performance optimizations
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    const targetFPS = isReducedMotion ? 30 : 60;
    const frameInterval = 1000 / targetFPS;
    
    // Render animation frame with time-based throttling
    const render = (timestamp: number) => {
      // Skip rendering when window is not focused to save resources
      if (!isWindowFocused) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }
      
      // Limit frame rate
      const elapsed = timestamp - lastFrameTimeRef.current;
      if (elapsed < frameInterval && lastFrameTimeRef.current !== 0) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }
      
      lastFrameTimeRef.current = timestamp;
      frameCountRef.current++;
      
      const currentGradient = timeGradients[timeOfDay];
      const currentCuisine = cuisineTextures[cuisineType];
      const currentMood = moodSettings[mood];
      
      // Clear canvas - use fillRect instead of clearRect for better performance
      ctx.fillStyle = createGradient(
        ctx, 
        canvas.width, 
        canvas.height, 
        currentGradient.colors, 
        currentGradient.angle
      );
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Apply pre-generated noise texture with low opacity
      if (noiseImageDataRef.current) {
        ctx.putImageData(noiseImageDataRef.current, 0, 0);
      }
      
      // Update and draw particles in batches
      particleSystemRef.current = updateParticlesWithMouse(
        particleSystemRef.current,
        canvas.width,
        canvas.height,
        mousePosition,
        isMouseMoving,
        currentMood
      );
      
      // Render particles grouped by type for better performance
      renderParticlesByType(ctx, particleSystemRef.current);
      
      // Add cuisine-specific pattern overlay (only on some frames)
      if (frameCountRef.current % 2 === 0) { // Only render pattern every other frame
        ctx.fillStyle = `rgba(${parseInt(currentCuisine.accentColor.slice(1, 3), 16)}, ${parseInt(currentCuisine.accentColor.slice(3, 5), 16)}, ${parseInt(currentCuisine.accentColor.slice(5, 7), 16)}, 0.04)`;
        
        // Draw pattern based on cuisine type
        drawPatternByCuisine(ctx, canvas.width, canvas.height, currentCuisine.pattern);
      }
      
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
    animationFrameId = requestAnimationFrame(render);
    
    // Clean up
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [timeOfDay, cuisineType, mood, mousePosition, isMouseMoving, isWindowFocused, isReducedMotion]);

  return canvasRef;
};
