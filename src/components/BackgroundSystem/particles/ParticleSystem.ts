
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
const MOUSE_UPDATE_THROTTLE = 50; // ms
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
    // Closer particles are updated more frequently
    particles.forEach(particle => {
      if (particle instanceof EnhancedParticle) {
        const dx = mousePosition.x - particle.x;
        const dy = mousePosition.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        const interactionRange = 150;
        
        // Apply interaction only for nearby particles
        if (distance < interactionRange) {
          const interactionStrength = currentMood.interactionStrength;
          const force = (1 - distance / interactionRange) * interactionStrength;
          
          // Apply force with reduced magnitude
          particle.speedX -= dx * force * 0.005; // Reduced from 0.01
          particle.speedY -= dy * force * 0.005; // Reduced from 0.01
          
          // Increase opacity when interacting
          particle.opacity = Math.min(0.6, particle.opacity + 0.05 * force);
        }
      }
    });
  }
  
  // Apply elegant/peaceful oscillations only to a subset of particles each frame
  if ((currentMood.name === 'elegant' || currentMood.name === 'peaceful') && now - lastParticleUpdate > 16) {
    lastParticleUpdate = now;
    
    // Apply oscillation to 25% of particles each frame
    const oscillationSubset = Math.floor(particles.length * 0.25);
    const startIdx = Math.floor(Math.random() * (particles.length - oscillationSubset));
    
    for (let i = startIdx; i < startIdx + oscillationSubset; i++) {
      const particle = particles[i];
      if (particle instanceof EnhancedParticle) {
        const time = now * particle.oscillationSpeed;
        const offsetX = Math.cos(time + particle.oscillationOffset) * particle.oscillationRadius * 0.1;
        const offsetY = Math.sin(time + particle.oscillationOffset) * particle.oscillationRadius * 0.1;
        
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
