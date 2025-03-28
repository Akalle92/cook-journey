
import { Particle, ParticleType } from './ParticleTypes';
import { drawStar, drawTriangle } from './ParticleShapes';

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
  
  constructor(canvasWidth: number, canvasHeight: number, color: string, type: ParticleType, speedMultiplier: number) {
    this.x = Math.random() * canvasWidth;
    this.y = Math.random() * canvasHeight;
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
  
  update(canvasWidth: number, canvasHeight: number) {
    // Basic movement
    this.x += this.speedX;
    this.y += this.speedY;
    
    // Reset position if particle goes off screen
    if (this.x < 0) this.x = canvasWidth;
    if (this.x > canvasWidth) this.x = 0;
    if (this.y < 0) this.y = canvasHeight;
    if (this.y > canvasHeight) this.y = 0;
    
    // Rotation for non-circle particles
    if (this.type !== 'circle' && this.type !== 'dot') {
      this.rotation += this.rotationSpeed;
    }
    
    // Slowly change opacity
    this.opacity += Math.random() * 0.01 - 0.005;
    if (this.opacity < 0.05) this.opacity = 0.05;
    if (this.opacity > 0.3) this.opacity = 0.3;
    
    // Apply friction to gradually slow down particles
    this.speedX *= 0.99;
    this.speedY *= 0.99;
  }
  
  // Helper function to convert hex to RGB
  hexToRgb(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
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
}
