
import React, { useEffect, useRef, useState } from 'react';
import { useBackground } from './BackgroundContext';

interface LayeredBackgroundProps {
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  color: string;
  type: 'circle' | 'square' | 'triangle' | 'star' | 'dot';
  rotation: number;
  rotationSpeed: number;
  update: () => void;
  draw: (ctx: CanvasRenderingContext2D) => void;
}

export const LayeredBackground: React.FC<LayeredBackgroundProps> = ({ className }) => {
  const { timeOfDay, cuisineType, mood } = useBackground();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);
  const [isMouseMoving, setIsMouseMoving] = useState(false);
  const [isWindowFocused, setIsWindowFocused] = useState(true);
  const mouseMovingTimeoutRef = useRef<number | null>(null);
  
  // Time-based gradient configurations
  const timeGradients = {
    morning: { colors: ['#FFF6E0', '#FFD59E'], angle: 135 },
    afternoon: { colors: ['#E0F7FF', '#91DEFF'], angle: 165 },
    evening: { colors: ['#FFE8D6', '#FFB088'], angle: 195 },
    night: { colors: ['#1F2033', '#111122'], angle: 135 },
  };
  
  // Cuisine-based texture configurations
  const cuisineTextures = {
    italian: { baseColor: '#FDF6E3', accentColor: '#7D916C', pattern: 'terracotta' },
    japanese: { baseColor: '#F8F9FA', accentColor: '#264653', pattern: 'paper' },
    mexican: { baseColor: '#FEF9EB', accentColor: '#E07A5F', pattern: 'geometric' },
    nordic: { baseColor: '#F9F9F9', accentColor: '#D6CFC7', pattern: 'woodgrain' },
    default: { baseColor: '#F9F9F9', accentColor: '#171717', pattern: 'default' },
  };

  // Mood-based configurations
  const moodSettings = {
    peaceful: { 
      particleDensity: 0.6,
      particleSpeed: 0.4,
      particleTypes: ['circle', 'dot'],
      interactionStrength: 0.3
    },
    energetic: { 
      particleDensity: 1.5,
      particleSpeed: 1.2,
      particleTypes: ['circle', 'square', 'triangle', 'star'],
      interactionStrength: 0.8
    },
    cozy: { 
      particleDensity: 0.8,
      particleSpeed: 0.5,
      particleTypes: ['circle', 'dot', 'star'],
      interactionStrength: 0.5
    },
    elegant: { 
      particleDensity: 0.9,
      particleSpeed: 0.7,
      particleTypes: ['circle', 'star'],
      interactionStrength: 0.6
    },
    default: { 
      particleDensity: 1.0, 
      particleSpeed: 0.8, 
      particleTypes: ['circle'],
      interactionStrength: 0.5
    }
  };

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

  // Animation loop for background effects
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match window
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Create gradient based on time of day
    const createGradient = () => {
      const gradient = timeGradients[timeOfDay];
      const { width, height } = canvas;
      
      // Convert angle to radians
      const angleRad = (gradient.angle * Math.PI) / 180;
      
      // Calculate gradient start and end points
      const gradientLength = Math.sqrt(width * width + height * height);
      const xCenter = width / 2;
      const yCenter = height / 2;
      const xOffset = Math.cos(angleRad) * gradientLength / 2;
      const yOffset = Math.sin(angleRad) * gradientLength / 2;
      
      const linearGradient = ctx.createLinearGradient(
        xCenter - xOffset, yCenter - yOffset,
        xCenter + xOffset, yCenter + yOffset
      );
      
      gradient.colors.forEach((color, index) => {
        linearGradient.addColorStop(index / (gradient.colors.length - 1), color);
      });
      
      return linearGradient;
    };

    // Generate noise texture
    const generateNoise = (opacity: number) => {
      const { width, height } = canvas;
      const imageData = ctx.createImageData(width, height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        // Create noise value
        const value = Math.floor(Math.random() * 255);
        
        // Apply noise with specified opacity
        data[i] = data[i + 1] = data[i + 2] = value;
        data[i + 3] = opacity;
      }
      
      return imageData;
    };

    // Draw a star shape
    const drawStar = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, spikes: number, rotation: number) => {
      let rot = Math.PI / 2 * 3 + rotation;
      const step = Math.PI / spikes;
      
      ctx.beginPath();
      ctx.moveTo(x + radius * Math.cos(rot), y + radius * Math.sin(rot));
      
      for (let i = 0; i < spikes; i++) {
        rot += step;
        const outerX = x + radius * Math.cos(rot);
        const outerY = y + radius * Math.sin(rot);
        ctx.lineTo(outerX, outerY);
        
        rot += step;
        const innerX = x + (radius * 0.4) * Math.cos(rot);
        const innerY = y + (radius * 0.4) * Math.sin(rot);
        ctx.lineTo(innerX, innerY);
      }
      
      ctx.closePath();
    };

    // Draw a triangle shape
    const drawTriangle = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rotation: number) => {
      const height = size * Math.sqrt(3) / 2;
      
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      
      ctx.beginPath();
      ctx.moveTo(0, -height / 2);
      ctx.lineTo(-size / 2, height / 2);
      ctx.lineTo(size / 2, height / 2);
      ctx.closePath();
      
      ctx.restore();
    };

    // Animation loop
    let animationFrameId: number;
    let particleSystem: Particle[] = [];
    
    // Particle class with enhanced types and behaviors
    class EnhancedParticle implements Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      color: string;
      type: 'circle' | 'square' | 'triangle' | 'star' | 'dot';
      rotation: number;
      rotationSpeed: number;
      originalX: number;
      originalY: number;
      oscillationRadius: number;
      oscillationSpeed: number;
      oscillationOffset: number;
      
      constructor(canvas: HTMLCanvasElement, color: string, type: 'circle' | 'square' | 'triangle' | 'star' | 'dot', speedMultiplier: number) {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.originalX = this.x;
        this.originalY = this.y;
        this.size = type === 'dot' ? Math.random() * 2 + 0.5 : Math.random() * 3 + 1;
        if (type === 'star') this.size *= 1.5;
        
        this.speedX = (Math.random() * 0.5 - 0.25) * speedMultiplier;
        this.speedY = (Math.random() * 0.5 - 0.25) * speedMultiplier;
        this.opacity = Math.random() * 0.3;
        this.color = color;
        this.type = type;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() * 0.01 - 0.005) * speedMultiplier;
        
        // Oscillation properties
        this.oscillationRadius = Math.random() * 30 + 10;
        this.oscillationSpeed = (Math.random() * 0.002 + 0.001) * speedMultiplier;
        this.oscillationOffset = Math.random() * Math.PI * 2;
      }
      
      update() {
        // Basic movement
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Reset position if particle goes off screen
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
        
        // Rotation for non-circle particles
        if (this.type !== 'circle' && this.type !== 'dot') {
          this.rotation += this.rotationSpeed;
        }
        
        // Slowly change opacity
        this.opacity += Math.random() * 0.01 - 0.005;
        if (this.opacity < 0.05) this.opacity = 0.05;
        if (this.opacity > 0.3) this.opacity = 0.3;
        
        // React to mouse movement
        if (mousePosition && isMouseMoving) {
          const dx = mousePosition.x - this.x;
          const dy = mousePosition.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          const currentMood = moodSettings[mood] || moodSettings.default;
          const interactionRange = 150;
          const interactionStrength = currentMood.interactionStrength;
          
          if (distance < interactionRange) {
            const force = (1 - distance / interactionRange) * interactionStrength;
            this.speedX -= dx * force * 0.01;
            this.speedY -= dy * force * 0.01;
            
            // Increase opacity when interacting
            this.opacity = Math.min(0.6, this.opacity + 0.1 * force);
          }
        }
        
        // Apply friction to gradually slow down particles
        this.speedX *= 0.99;
        this.speedY *= 0.99;
        
        // Add subtle oscillation for elegant/peaceful modes
        if (mood === 'elegant' || mood === 'peaceful') {
          const time = Date.now() * this.oscillationSpeed;
          const offsetX = Math.cos(time + this.oscillationOffset) * this.oscillationRadius * 0.1;
          const offsetY = Math.sin(time + this.oscillationOffset) * this.oscillationRadius * 0.1;
          
          this.x += offsetX;
          this.y += offsetY;
        }
      }
      
      draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        
        // Set opacity and color
        const rgbColor = this.hexToRgb(this.color);
        ctx.fillStyle = `rgba(${rgbColor}, ${this.opacity})`;
        
        // Draw different shapes based on type
        switch (this.type) {
          case 'circle':
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            break;
            
          case 'dot':
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            break;
            
          case 'square':
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.fillRect(-this.size, -this.size, this.size * 2, this.size * 2);
            ctx.restore();
            break;
            
          case 'triangle':
            drawTriangle(ctx, this.x, this.y, this.size * 3, this.rotation);
            ctx.fill();
            break;
            
          case 'star':
            drawStar(ctx, this.x, this.y, this.size * 2, 5, this.rotation);
            ctx.fill();
            break;
        }
        
        ctx.restore();
      }
      
      // Helper function to convert hex to RGB
      hexToRgb(hex: string): string {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `${r}, ${g}, ${b}`;
      }
    }

    // Initialize particle system
    const initParticles = () => {
      const currentCuisine = cuisineType in cuisineTextures ? cuisineTextures[cuisineType] : cuisineTextures.default;
      const currentMood = mood in moodSettings ? moodSettings[mood] : moodSettings.default;
      
      // Calculate particle count based on screen size and mood density
      const baseCount = Math.floor((canvas.width * canvas.height) / 20000);
      const particleCount = Math.floor(baseCount * currentMood.particleDensity);
      
      // Convert hex to RGB
      const hexToRgb = (hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `${r}, ${g}, ${b}`;
      };
      
      const color = currentCuisine.accentColor;
      
      particleSystem = [];
      
      // Create particles with different types based on mood
      for (let i = 0; i < particleCount; i++) {
        const availableTypes = currentMood.particleTypes as ('circle' | 'square' | 'triangle' | 'star' | 'dot')[];
        const randomType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
        particleSystem.push(new EnhancedParticle(canvas, color, randomType, currentMood.particleSpeed));
      }
      
      // Add additional accent particles for visual interest
      const accentCount = Math.floor(particleCount * 0.2);
      for (let i = 0; i < accentCount; i++) {
        // Create accent particles
        const accentType = (currentMood.particleTypes as ('circle' | 'square' | 'triangle' | 'star' | 'dot')[])[0];
        const particle = new EnhancedParticle(canvas, '#FFFFFF', accentType, currentMood.particleSpeed * 0.7);
        particle.opacity *= 0.5; // Make accent particles more subtle
        particleSystem.push(particle);
      }
    };
    
    // Initialize particles on first render
    initParticles();
    
    // Re-initialize particles when window size, cuisine or mood changes
    useEffect(() => {
      if (canvas && ctx) {
        initParticles();
      }
    }, [cuisineType, mood, canvas?.width, canvas?.height]);

    // Render animation frame
    const render = () => {
      // Skip rendering when window is not focused to save resources
      if (!isWindowFocused) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw base gradient
      ctx.fillStyle = createGradient();
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Apply noise texture with low opacity
      const noiseOpacity = timeOfDay === 'night' ? 5 : 10;
      ctx.putImageData(generateNoise(noiseOpacity), 0, 0);
      
      // Update and draw particles
      particleSystem.forEach(particle => {
        particle.update();
        particle.draw(ctx);
      });
      
      // Add cuisine-specific pattern overlay
      const currentCuisine = cuisineTextures[cuisineType];
      ctx.fillStyle = `rgba(${parseInt(currentCuisine.accentColor.slice(1, 3), 16)}, ${parseInt(currentCuisine.accentColor.slice(3, 5), 16)}, ${parseInt(currentCuisine.accentColor.slice(5, 7), 16)}, 0.04)`;
      
      // Draw pattern based on cuisine type
      switch (currentCuisine.pattern) {
        case 'terracotta':
          drawTerracottaPattern(ctx, canvas.width, canvas.height);
          break;
        case 'paper':
          drawPaperPattern(ctx, canvas.width, canvas.height);
          break;
        case 'geometric':
          drawGeometricPattern(ctx, canvas.width, canvas.height);
          break;
        case 'woodgrain':
          drawWoodgrainPattern(ctx, canvas.width, canvas.height);
          break;
        default:
          drawDefaultPattern(ctx, canvas.width, canvas.height);
          break;
      }
      
      // Add interactive highlight if mouse is moving
      if (mousePosition && isMouseMoving) {
        const gradientRadius = 150;
        const radialGradient = ctx.createRadialGradient(
          mousePosition.x, mousePosition.y, 0,
          mousePosition.x, mousePosition.y, gradientRadius
        );
        
        radialGradient.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
        radialGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = radialGradient;
        ctx.beginPath();
        ctx.arc(mousePosition.x, mousePosition.y, gradientRadius, 0, Math.PI * 2);
        ctx.fill();
      }
      
      animationFrameId = requestAnimationFrame(render);
    };
    
    // Pattern drawing functions
    const drawTerracottaPattern = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      const size = 60;
      const spacing = 80;
      
      for (let x = 0; x < width; x += spacing) {
        for (let y = 0; y < height; y += spacing) {
          ctx.beginPath();
          ctx.ellipse(x, y, size / 2, size / 3, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };
    
    const drawPaperPattern = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      // Draw horizontal lines
      for (let y = 0; y < height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
      
      // Draw occasional vertical lines
      for (let x = 0; x < width; x += 100) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.lineWidth = 0.2;
        ctx.stroke();
      }
    };
    
    const drawGeometricPattern = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      const size = 40;
      
      for (let x = 0; x < width; x += size * 2) {
        for (let y = 0; y < height; y += size * 2) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + size, y);
          ctx.lineTo(x + size, y + size);
          ctx.closePath();
          ctx.fill();
          
          ctx.beginPath();
          ctx.moveTo(x + size, y + size);
          ctx.lineTo(x + size * 2, y + size);
          ctx.lineTo(x + size, y + size * 2);
          ctx.closePath();
          ctx.fill();
        }
      }
    };
    
    const drawWoodgrainPattern = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      // Draw flowing lines for wood grain
      for (let y = 0; y < height; y += 15) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        
        // Create wavy pattern
        for (let x = 0; x < width; x += 20) {
          const offset = Math.sin(x / 100) * 5;
          ctx.lineTo(x, y + offset);
        }
        
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    };
    
    const drawDefaultPattern = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      const size = 80;
      
      for (let x = 0; x < width; x += size) {
        for (let y = 0; y < height; y += size) {
          if ((x + y) % (size * 2) === 0) {
            ctx.fillRect(x, y, size / 2, size / 2);
          }
        }
      }
    };
    
    // Start animation
    render();
    
    // Clean up
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [timeOfDay, cuisineType, mood, mousePosition, isMouseMoving, isWindowFocused]);
  
  return (
    <div className={`fixed inset-0 z-[-1] overflow-hidden ${mood ? `mood-${mood}` : ''} ${className || ''}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0.8 }}
      />
      <div className="absolute inset-0 backdrop-blur-[2px]" />
    </div>
  );
};
