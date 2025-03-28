
import { useEffect, useRef, useState } from 'react';

export const useMouseTracking = () => {
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);
  const [isMouseMoving, setIsMouseMoving] = useState(false);
  const mouseMovingTimeoutRef = useRef<number | null>(null);
  
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
  
  return { mousePosition, isMouseMoving };
};
