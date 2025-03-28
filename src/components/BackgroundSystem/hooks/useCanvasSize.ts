
import { useEffect, useRef } from 'react';

export const useCanvasSize = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const updateCanvasSize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;
    
    // Update canvas size with device pixel ratio for sharper rendering
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
    
    return { canvas, ctx, width: canvas.width, height: canvas.height };
  };
  
  // Handle window resize with debouncing
  useEffect(() => {
    let resizeTimeout: number | null = null;
    
    const handleResize = () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      
      resizeTimeout = window.setTimeout(() => {
        updateCanvasSize();
      }, 200);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
    };
  }, []);
  
  return { canvasRef, updateCanvasSize };
};
