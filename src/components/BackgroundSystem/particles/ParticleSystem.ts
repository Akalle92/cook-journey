
import { ParticleType, Particle } from './ParticleTypes';
import { EnhancedParticle } from './EnhancedParticle';
import { MoodSettings } from '../BackgroundTypes';

// Initialize particle system with optimized count based on device performance
export const initParticles = (
  canvasWidth: number, 
  canvasHeight: number, 
  accentColor: string, 
  particleTypes: ParticleType[],
  particleDensity: number,
  particleSpeed: number
): Particle[] => {
  // Calculate particle count based on screen size, density and device performance
  const baseCount = Math.floor((canvasWidth * canvasHeight) / 20000);
  
  // Reduce particle count for smaller screens or low-end devices
  const performanceMultiplier = window.innerWidth < 768 ? 0.6 : 1;
  const particleCount = Math.floor(baseCount * particleDensity * performanceMultiplier);
  
  const particles: Particle[] = [];
  
  // Group particles by type for more efficient batch rendering
  const typeDistribution: Record<ParticleType, number> = {
    'circle': 0.5,   // 50% circles for better performance
    'dot': 0.3,      // 30% dots
    'square': 0.1,   // 10% squares
    'triangle': 0.05, // 5% triangles
    'star': 0.05,    // 5% stars
    'ring': 0.0,     // 0% rings by default
    'plus': 0.0,     // 0% plus by default
    'wave': 0.0      // 0% waves by default
  };
  
  // Create particles with distribution weighted by performance impact
  for (let i = 0; i < particleCount; i++) {
    // Select particle type based on weighted distribution
    let selectedType: ParticleType;
    
    // If particleTypes has specific allowed types, use those with weighting
    if (particleTypes.length === 1) {
      selectedType = particleTypes[0];
    } else {
      // Get random value to determine particle type
      const rand = Math.random();
      let cumulativeProbability = 0;
      
      // Filter type distribution to only include allowed types
      const allowedTypeDistribution: Partial<Record<ParticleType, number>> = {};
      let totalWeight = 0;
      
      particleTypes.forEach(type => {
        allowedTypeDistribution[type] = typeDistribution[type];
        totalWeight += typeDistribution[type];
      });
      
      // Normalize weights
      for (const type of particleTypes) {
        allowedTypeDistribution[type] = (allowedTypeDistribution[type] || 0) / totalWeight;
      }
      
      // Select type based on normalized weight
      selectedType = particleTypes[0]; // Default
      for (const type of particleTypes) {
        cumulativeProbability += (allowedTypeDistribution[type] || 0);
        if (rand <= cumulativeProbability) {
          selectedType = type;
          break;
        }
      }
    }
    
    particles.push(new EnhancedParticle(canvasWidth, canvasHeight, accentColor, selectedType, particleSpeed));
  }
  
  // Add a smaller number of accent particles
  const accentCount = Math.floor(particleCount * 0.1); // Reduced from 0.2 to 0.1
  for (let i = 0; i < accentCount; i++) {
    // Create accent particles (preferring simpler shapes)
    const accentType = particleTypes.includes('dot') ? 'dot' : particleTypes[0];
    const particle = new EnhancedParticle(canvasWidth, canvasHeight, '#FFFFFF', accentType, particleSpeed * 0.7);
    particle.opacity *= 0.5; // Make accent particles more subtle
    particles.push(particle);
  }
  
  return particles;
};

// Cached mouse position and throttle variables
let lastMouseUpdate = 0;
const MOUSE_UPDATE_THROTTLE = 100; // Increased from 50ms to 100ms for smoother interaction
let lastParticleUpdate = 0;

// Update particles with mouse interaction (optimized)
export const updateParticlesWithMouse = (
  particles: Particle[],
  canvasWidth: number,
  canvasHeight: number,
  mousePosition: { x: number, y: number } | null,
  isMouseMoving: boolean,
  currentMood: MoodSettings
) => {
  const now = Date.now();
  
  // Update all particles
  particles.forEach(particle => {
    particle.update(canvasWidth, canvasHeight);
  });
  
  // Apply mouse interactions less frequently (throttled)
  if (mousePosition && isMouseMoving && now - lastMouseUpdate > MOUSE_UPDATE_THROTTLE) {
    lastMouseUpdate = now;
    
    // Only update a subset of particles with mouse interaction each frame
    // This creates a more gentle, flowing effect
    const maxParticlesToUpdate = Math.min(particles.length, 200); // Limit the number of particles to update
    const indexStep = Math.ceil(particles.length / maxParticlesToUpdate);
    
    for (let i = 0; i < particles.length; i += indexStep) {
      const particle = particles[i];
      
      if (particle instanceof EnhancedParticle) {
        const dx = mousePosition.x - particle.x;
        const dy = mousePosition.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        const interactionRange = 200; // Increased from 150 to 200 for wider effect area
        
        // Apply interaction only for nearby particles with a smooth falloff
        if (distance < interactionRange) {
          // Softened interaction strength - reduced by 60%
          const interactionStrength = currentMood.interactionStrength * 0.4;
          
          // Apply gentle force with gradual falloff
          const falloff = Math.pow(1 - distance / interactionRange, 2); // Quadratic falloff for smoother transition
          const force = falloff * interactionStrength;
          
          // Apply force with reduced magnitude and introduce slight drift effect
          particle.speedX = particle.speedX * 0.95 - dx * force * 0.002; // Reduced from 0.005 to 0.002
          particle.speedY = particle.speedY * 0.95 - dy * force * 0.002; // Reduced from 0.005 to 0.002
          
          // Subtle opacity change to avoid flickering
          particle.opacity = Math.min(
            0.5, 
            particle.opacity + 0.01 * force
          );
        }
      }
    }
  }
  
  // Apply elegant/peaceful oscillations only to a subset of particles each frame
  if ((currentMood.name === 'elegant' || currentMood.name === 'peaceful') && now - lastParticleUpdate > 16) {
    lastParticleUpdate = now;
    
    // Apply oscillation to 15% of particles each frame (reduced from 25%)
    const oscillationSubset = Math.floor(particles.length * 0.15);
    const startIdx = Math.floor(Math.random() * (particles.length - oscillationSubset));
    
    for (let i = startIdx; i < startIdx + oscillationSubset; i++) {
      const particle = particles[i];
      if (particle instanceof EnhancedParticle) {
        const time = now * particle.oscillationSpeed;
        // Reduced oscillation magnitude by 50%
        const offsetX = Math.cos(time + particle.oscillationOffset) * particle.oscillationRadius * 0.05;
        const offsetY = Math.sin(time + particle.oscillationOffset) * particle.oscillationRadius * 0.05;
        
        particle.x += offsetX;
        particle.y += offsetY;
      }
    }
  }
  
  return particles;
};

// New method to efficiently render particles by type
export const renderParticlesByType = (
  ctx: CanvasRenderingContext2D,
  particles: Particle[]
) => {
  // Group particles by type for batch rendering
  const particlesByType: Record<ParticleType, Particle[]> = {
    'circle': [],
    'dot': [],
    'square': [],
    'triangle': [],
    'star': [],
    'ring': [],
    'plus': [],
    'wave': []
  };
  
  // Sort particles by type
  particles.forEach(particle => {
    particlesByType[particle.type].push(particle);
  });
  
  // Draw particles by type to reduce context switches
  for (const type in particlesByType) {
    const typeParticles = particlesByType[type as ParticleType];
    if (typeParticles.length === 0) continue;
    
    // Draw all particles of the same type
    typeParticles.forEach(particle => {
      particle.draw(ctx);
    });
  }
};
