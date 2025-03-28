
import { useEffect, useRef, useState } from 'react';

export const useMouseTracking = () => {
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);
  const [isMouseMoving, setIsMouseMoving] = useState(false);
  const mouseMovingTimeoutRef = useRef<number | null>(null);
  
  // Track mouse movement with throttling
  useEffect(() => {
    let lastMouseMoveTime = 0;
    const THROTTLE_TIME = 32; // Increase throttle time for smoother movement (32ms ≈ 30fps)
    
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      
      if (now - lastMouseMoveTime > THROTTLE_TIME) {
        lastMouseMoveTime = now;
        
        // Smooth the mouse position by interpolating between current and new position
        setMousePosition(prevPos => {
          if (!prevPos) return { x: e.clientX, y: e.clientY };
          
          // Apply easing to create smoother transitions (lerp)
          return {
            x: prevPos.x + (e.clientX - prevPos.x) * 0.3,
            y: prevPos.y + (e.clientY - prevPos.y) * 0.3
          };
        });
        
        setIsMouseMoving(true);
        
        // Reset mouse moving state after some time of inactivity
        if (mouseMovingTimeoutRef.current) {
          clearTimeout(mouseMovingTimeoutRef.current);
        }
        
        mouseMovingTimeoutRef.current = window.setTimeout(() => {
          setIsMouseMoving(false);
        }, 1000); // Reduced from 2000ms to 1000ms for quicker return to static state
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
