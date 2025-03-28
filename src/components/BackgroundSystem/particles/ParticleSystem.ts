
import { Particle } from './ParticleTypes';
import { MoodSettings } from '../BackgroundTypes';
import { EnhancedParticle } from './EnhancedParticle';

// Initialize particles
export const initParticles = (
  canvasWidth: number,
  canvasHeight: number,
  accentColor: string,
  particleTypes: string[],
  density: number,
  speedMultiplier: number
): Particle[] => {
  const particles: Particle[] = [];
  const particleCount = Math.floor((canvasWidth * canvasHeight) / 20000 * density);
  
  for (let i = 0; i < particleCount; i++) {
    const typeIndex = Math.floor(Math.random() * particleTypes.length);
    const type = particleTypes[typeIndex] as any;
    particles.push(new EnhancedParticle(canvasWidth, canvasHeight, accentColor, type, speedMultiplier));
  }
  
  return particles;
};

// Simplified particle update method without mouse interaction
export const updateParticlesWithMouse = (
  particles: Particle[],
  canvasWidth: number,
  canvasHeight: number
) => {
  particles.forEach(particle => {
    particle.update(canvasWidth, canvasHeight);
  });
  
  return particles;
};

// Render particles by type for better performance
export const renderParticlesByType = (ctx: CanvasRenderingContext2D, particles: Particle[]) => {
  // Group particles by type for batch rendering
  const particlesByType: Record<string, Particle[]> = {};
  
  particles.forEach(particle => {
    if (!particlesByType[particle.type]) {
      particlesByType[particle.type] = [];
    }
    particlesByType[particle.type].push(particle);
  });
  
  // Render each type in a batch
  Object.keys(particlesByType).forEach(type => {
    const typeParticles = particlesByType[type];
    
    // Set shared properties for this batch
    ctx.beginPath();
    
    // Draw all particles of this type
    typeParticles.forEach(particle => {
      particle.draw(ctx);
    });
  });
};

