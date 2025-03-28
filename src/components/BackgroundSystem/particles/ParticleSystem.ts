
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
    
    // Dramatically reduce the number of particles affected
    const maxParticlesToUpdate = Math.min(particles.length, 50); // Reduced from 200
    const indexStep = Math.ceil(particles.length / maxParticlesToUpdate);
    
    for (let i = 0; i < particles.length; i += indexStep) {
      const particle = particles[i];
      
      if (particle instanceof EnhancedParticle) {
        const dx = mousePosition.x - particle.x;
        const dy = mousePosition.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        const interactionRange = 150; // Reduced from 200
        
        // Apply interaction only for nearby particles with a soft falloff
        if (distance < interactionRange) {
          // Further reduced interaction strength
          const interactionStrength = currentMood.interactionStrength * 0.2; // Reduced from 0.4
          
          // Use an exponential falloff for smoother, more natural movement
          const falloff = Math.exp(-distance / (interactionRange / 2));
          
          const force = falloff * interactionStrength;
          
          // Apply very gentle force with minimal drift
          particle.speedX = particle.speedX * 0.98 - dx * force * 0.001; // Reduced magnitude
          particle.speedY = particle.speedY * 0.98 - dy * force * 0.001; // Reduced magnitude
          
          // More subtle opacity change
          particle.opacity = Math.min(
            0.3, // Lower max opacity
            particle.opacity + 0.005 * force // Slower opacity change
          );
        }
      }
    }
  }
  
  return particles;
};

