
import { Particle, ParticleType } from './ParticleTypes';
import { drawStar, drawTriangle, drawRing, drawPlus, drawWave } from './ParticleShapes';

export class EnhancedParticle implements Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  color: string;
  type: ParticleType;
  rotation: number;
  rotationSpeed: number;
  originalX: number;
  originalY: number;
  oscillationRadius: number;
  oscillationSpeed: number;
  oscillationOffset: number;
  lastUpdate: number;
  
  constructor(canvasWidth: number, canvasHeight: number, color: string, type: ParticleType, speedMultiplier: number) {
    this.x = Math.random() * canvasWidth;
    this.y = Math.random() * canvasHeight;
    this.originalX = this.x;
    this.originalY = this.y;
    
    // Adjust size based on particle type
    switch(type) {
      case 'dot':
        this.size = Math.random() * 2 + 0.5;
        break;
      case 'star':
        this.size = Math.random() * 4 + 2;
        break;
      case 'ring':
        this.size = Math.random() * 5 + 3;
        break;
      case 'wave':
        this.size = Math.random() * 6 + 4;
        break;
      case 'plus':
        this.size = Math.random() * 3 + 2;
        break;
      default:
        this.size = Math.random() * 3 + 1;
    }
    
    this.speedX = (Math.random() * 0.5 - 0.25) * speedMultiplier;
    this.speedY = (Math.random() * 0.5 - 0.25) * speedMultiplier;
    this.opacity = Math.random() * 0.3;
    this.color = color;
    this.type = type;
    this.rotation = Math.random() * Math.PI * 2;
    
    // Rotation speed varies by type
    this.rotationSpeed = (Math.random() * 0.01 - 0.005) * speedMultiplier;
    if (type === 'star' || type === 'triangle') {
      this.rotationSpeed *= 1.5; // Stars and triangles rotate faster
    }
    
    // Oscillation properties
    this.oscillationRadius = Math.random() * 30 + 10;
    this.oscillationSpeed = (Math.random() * 0.002 + 0.001) * speedMultiplier;
    this.oscillationOffset = Math.random() * Math.PI * 2;
    
    // Performance tracking
    this.lastUpdate = Date.now();
  }
  
  update(canvasWidth: number, canvasHeight: number) {
    // Calculate time since last update for smoother animation
    const now = Date.now();
    const delta = Math.min((now - this.lastUpdate) / 16, 5); // Cap at 5x normal speed to prevent huge jumps
    this.lastUpdate = now;
    
    // Apply delta time to make movement frame-rate independent
    this.x += this.speedX * delta;
    this.y += this.speedY * delta;
    
    // Reset position if particle goes off screen
    if (this.x < 0) this.x = canvasWidth;
    if (this.x > canvasWidth) this.x = 0;
    if (this.y < 0) this.y = canvasHeight;
    if (this.y > canvasHeight) this.y = 0;
    
    // Rotation for non-circle particles
    if (this.type !== 'circle' && this.type !== 'dot') {
      this.rotation += this.rotationSpeed * delta;
    }
    
    // Slowly change opacity (reduced frequency)
    if (Math.random() < 0.05) { // Only change opacity occasionally
      this.opacity += (Math.random() * 0.01 - 0.005) * delta;
      if (this.opacity < 0.05) this.opacity = 0.05;
      if (this.opacity > 0.3) this.opacity = 0.3;
    }
    
    // Apply friction to gradually slow down particles
    this.speedX *= 0.99;
    this.speedY *= 0.99;
  }
  
  // Helper function to convert hex to RGB with caching
  private static colorCache: Record<string, string> = {};
  
  hexToRgb(hex: string): string {
    // Use cached result if available
    if (EnhancedParticle.colorCache[hex]) {
      return EnhancedParticle.colorCache[hex];
    }
    
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const result = `${r}, ${g}, ${b}`;
    
    // Cache result
    EnhancedParticle.colorCache[hex] = result;
    return result;
  }
  
  draw(ctx: CanvasRenderingContext2D) {
    // Skip drawing particles with very low opacity
    if (this.opacity < 0.02) return;
    
    ctx.save();
    
    // Set opacity and color
    const rgbColor = this.hexToRgb(this.color);
    ctx.fillStyle = `rgba(${rgbColor}, ${this.opacity})`;
    
    // Use switch for drawing based on shape type
    switch (this.type) {
      case 'circle':
      case 'dot':
        // Fast path for circles and dots (most common)
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
        
      case 'ring':
        drawRing(ctx, this.x, this.y, this.size);
        ctx.fill();
        break;
        
      case 'plus':
        drawPlus(ctx, this.x, this.y, this.size * 2, this.rotation);
        ctx.fill();
        break;
        
      case 'wave':
        drawWave(ctx, this.x, this.y, this.size * 2, this.rotation);
        ctx.stroke();
        break;
    }
    
    ctx.restore();
  }
}
