
import { ParticleType, Particle } from './ParticleTypes';
import { EnhancedParticle } from './EnhancedParticle';
import { MoodSettings } from '../BackgroundTypes';

// Initialize particle system
export const initParticles = (
  canvasWidth: number, 
  canvasHeight: number, 
  accentColor: string, 
  particleTypes: ParticleType[],
  particleDensity: number,
  particleSpeed: number
): Particle[] => {
  // Calculate particle count based on screen size and mood density
  const baseCount = Math.floor((canvasWidth * canvasHeight) / 20000);
  const particleCount = Math.floor(baseCount * particleDensity);
  
  const particles: Particle[] = [];
  
  // Create particles with different types based on mood
  for (let i = 0; i < particleCount; i++) {
    const randomType = particleTypes[Math.floor(Math.random() * particleTypes.length)];
    particles.push(new EnhancedParticle(canvasWidth, canvasHeight, accentColor, randomType, particleSpeed));
  }
  
  // Add additional accent particles for visual interest
  const accentCount = Math.floor(particleCount * 0.2);
  for (let i = 0; i < accentCount; i++) {
    // Create accent particles
    const accentType = particleTypes[0];
    const particle = new EnhancedParticle(canvasWidth, canvasHeight, '#FFFFFF', accentType, particleSpeed * 0.7);
    particle.opacity *= 0.5; // Make accent particles more subtle
    particles.push(particle);
  }
  
  return particles;
};

// Update particles with mouse interaction
export const updateParticlesWithMouse = (
  particles: Particle[],
  canvasWidth: number,
  canvasHeight: number,
  mousePosition: { x: number, y: number } | null,
  isMouseMoving: boolean,
  currentMood: MoodSettings
) => {
  particles.forEach(particle => {
    // Basic update
    particle.update(canvasWidth, canvasHeight);
    
    // React to mouse movement if available
    if (mousePosition && isMouseMoving && particle instanceof EnhancedParticle) {
      const dx = mousePosition.x - particle.x;
      const dy = mousePosition.y - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      const interactionRange = 150;
      const interactionStrength = currentMood.interactionStrength;
      
      if (distance < interactionRange) {
        const force = (1 - distance / interactionRange) * interactionStrength;
        particle.speedX -= dx * force * 0.01;
        particle.speedY -= dy * force * 0.01;
        
        // Increase opacity when interacting
        particle.opacity = Math.min(0.6, particle.opacity + 0.1 * force);
      }
    }
    
    // Add subtle oscillation for elegant/peaceful modes
    if ((currentMood.name === 'elegant' || currentMood.name === 'peaceful') && particle instanceof EnhancedParticle) {
      const time = Date.now() * particle.oscillationSpeed;
      const offsetX = Math.cos(time + particle.oscillationOffset) * particle.oscillationRadius * 0.1;
      const offsetY = Math.sin(time + particle.oscillationOffset) * particle.oscillationRadius * 0.1;
      
      particle.x += offsetX;
      particle.y += offsetY;
    }
  });
  
  return particles;
};
