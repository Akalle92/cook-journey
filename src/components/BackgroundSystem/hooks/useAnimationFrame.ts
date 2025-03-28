
import { useRef, useEffect } from 'react';

interface UseAnimationFrameProps {
  callback: (timestamp: number) => void;
  isEnabled: boolean;
  targetFPS?: number;
}

export const useAnimationFrame = ({
  callback,
  isEnabled,
  targetFPS = 60
}: UseAnimationFrameProps) => {
  const requestIdRef = useRef<number>();
  const lastFrameTimeRef = useRef<number>(0);
  const frameInterval = 1000 / targetFPS;
  
  useEffect(() => {
    if (!isEnabled) return;
    
    const animate = (timestamp: number) => {
      // Limit frame rate
      const elapsed = timestamp - lastFrameTimeRef.current;
      if (elapsed >= frameInterval || lastFrameTimeRef.current === 0) {
        lastFrameTimeRef.current = timestamp;
        callback(timestamp);
      }
      
      requestIdRef.current = requestAnimationFrame(animate);
    };
    
    requestIdRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (requestIdRef.current) {
        cancelAnimationFrame(requestIdRef.current);
      }
    };
  }, [callback, isEnabled, frameInterval]);
};
