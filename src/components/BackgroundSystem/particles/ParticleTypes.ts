
// Defines the types and interfaces for the particle system

export type ParticleType = 'circle' | 'square' | 'triangle' | 'star' | 'dot';

export interface Particle {
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
  lastUpdate?: number; // Track last update time for delta calculations
  update: (canvasWidth: number, canvasHeight: number) => void;
  draw: (ctx: CanvasRenderingContext2D) => void;
}
