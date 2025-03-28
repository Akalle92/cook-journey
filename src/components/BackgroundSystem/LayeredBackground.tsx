
import React, { useEffect, useRef } from 'react';
import { useBackground } from './BackgroundContext';

interface LayeredBackgroundProps {
  className?: string;
}

export const LayeredBackground: React.FC<LayeredBackgroundProps> = ({ className }) => {
  const { timeOfDay, cuisineType } = useBackground();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
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

    // Animation loop
    let animationFrameId: number;
    let particleSystem: Particle[] = [];
    
    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      color: string;
      
      constructor(canvas: HTMLCanvasElement, color: string) {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.opacity = Math.random() * 0.3;
        this.color = color;
      }
      
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Reset position if particle goes off screen
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
        
        // Slowly change opacity
        this.opacity += Math.random() * 0.01 - 0.005;
        if (this.opacity < 0.05) this.opacity = 0.05;
        if (this.opacity > 0.3) this.opacity = 0.3;
      }
      
      draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
        ctx.fill();
      }
    }

    // Initialize particle system
    const initParticles = () => {
      const particleCount = Math.floor((canvas.width * canvas.height) / 20000);
      const currentCuisine = cuisineTextures[cuisineType];
      
      // Convert hex to RGB
      const hexToRgb = (hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `${r}, ${g}, ${b}`;
      };
      
      const color = hexToRgb(currentCuisine.accentColor);
      
      particleSystem = Array.from({ length: particleCount }, () => new Particle(canvas, color));
    };
    
    initParticles();

    // Render animation frame
    const render = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw base gradient
      ctx.fillStyle = createGradient();
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Apply noise texture with low opacity
      if (timeOfDay !== 'night') {
        const noiseOpacity = timeOfDay === 'night' ? 5 : 10;
        ctx.putImageData(generateNoise(noiseOpacity), 0, 0);
      }
      
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
  }, [timeOfDay, cuisineType]);
  
  return (
    <div className={`fixed inset-0 z-[-1] overflow-hidden ${className || ''}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0.8 }}
      />
      <div className="absolute inset-0 backdrop-blur-[2px]" />
    </div>
  );
};
