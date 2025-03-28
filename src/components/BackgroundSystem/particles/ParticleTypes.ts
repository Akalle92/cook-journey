
// Defines the types and interfaces for the particle system

export type ParticleType = 'circle' | 'square' | 'triangle' | 'star' | 'dot' | 'ring' | 'plus' | 'wave';

export interface ParticleConfig {
  minSize: number;
  maxSize: number;
  minOpacity: number;
  maxOpacity: number;
  minSpeed: number;
  maxSpeed: number;
  color: string;
  rotationEnabled: boolean;
}

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

// Default particle configurations for different types
export const defaultParticleConfigs: Record<ParticleType, ParticleConfig> = {
  circle: {
    minSize: 2,
    maxSize: 8,
    minOpacity: 0.1,
    maxOpacity: 0.4,
    minSpeed: 0.2,
    maxSpeed: 0.6,
    color: '#FFFFFF',
    rotationEnabled: false
  },
  square: {
    minSize: 3,
    maxSize: 7,
    minOpacity: 0.1,
    maxOpacity: 0.4,
    minSpeed: 0.1,
    maxSpeed: 0.5,
    color: '#FFFFFF',
    rotationEnabled: true
  },
  triangle: {
    minSize: 4,
    maxSize: 8,
    minOpacity: 0.1,
    maxOpacity: 0.4,
    minSpeed: 0.1,
    maxSpeed: 0.4,
    color: '#FFFFFF',
    rotationEnabled: true
  },
  star: {
    minSize: 4,
    maxSize: 10,
    minOpacity: 0.1,
    maxOpacity: 0.5,
    minSpeed: 0.1,
    maxSpeed: 0.3,
    color: '#FFFFFF',
    rotationEnabled: true
  },
  dot: {
    minSize: 1,
    maxSize: 3,
    minOpacity: 0.1,
    maxOpacity: 0.3,
    minSpeed: 0.1,
    maxSpeed: 0.8,
    color: '#FFFFFF',
    rotationEnabled: false
  },
  ring: {
    minSize: 5,
    maxSize: 12,
    minOpacity: 0.05,
    maxOpacity: 0.3,
    minSpeed: 0.05,
    maxSpeed: 0.3,
    color: '#FFFFFF',
    rotationEnabled: false
  },
  plus: {
    minSize: 4,
    maxSize: 8,
    minOpacity: 0.1,
    maxOpacity: 0.4,
    minSpeed: 0.1,
    maxSpeed: 0.4,
    color: '#FFFFFF',
    rotationEnabled: true
  },
  wave: {
    minSize: 6,
    maxSize: 14,
    minOpacity: 0.05,
    maxOpacity: 0.2,
    minSpeed: 0.05,
    maxSpeed: 0.2,
    color: '#FFFFFF',
    rotationEnabled: false
  }
};
