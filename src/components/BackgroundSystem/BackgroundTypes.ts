
import { ParticleType } from './particles/ParticleTypes';
import { ThemeType } from './presets/BackgroundPresets';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';
export type CuisineType = 'italian' | 'japanese' | 'mexican' | 'nordic' | 'default';
export type CuisinePattern = 'terracotta' | 'paper' | 'geometric' | 'woodgrain' | 'default';
export type Mood = 'peaceful' | 'energetic' | 'cozy' | 'elegant' | 'default';

// Re-export ThemeType for public use
export { ThemeType };

export interface TimeGradient {
  colors: string[];
  angle: number;
}

export interface CuisineTexture {
  baseColor: string;
  accentColor: string;
  pattern: CuisinePattern;
}

export interface MoodSettings {
  name: Mood;
  particleDensity: number;
  particleSpeed: number;
  particleTypes: ParticleType[];
  interactionStrength: number;
}

// Time-based gradient configurations
export const timeGradients: Record<TimeOfDay, TimeGradient> = {
  morning: { colors: ['#FFF6E0', '#FFD59E'], angle: 135 },
  afternoon: { colors: ['#E0F7FF', '#91DEFF'], angle: 165 },
  evening: { colors: ['#FFE8D6', '#FFB088'], angle: 195 },
  night: { colors: ['#1F2033', '#111122'], angle: 135 },
};

// Cuisine-based texture configurations
export const cuisineTextures: Record<CuisineType, CuisineTexture> = {
  italian: { baseColor: '#FDF6E3', accentColor: '#7D916C', pattern: 'terracotta' },
  japanese: { baseColor: '#F8F9FA', accentColor: '#264653', pattern: 'paper' },
  mexican: { baseColor: '#FEF9EB', accentColor: '#E07A5F', pattern: 'geometric' },
  nordic: { baseColor: '#F9F9F9', accentColor: '#D6CFC7', pattern: 'woodgrain' },
  default: { baseColor: '#F9F9F9', accentColor: '#171717', pattern: 'default' },
};

// Mood-based configurations
export const moodSettings: Record<Mood, MoodSettings> = {
  peaceful: { 
    name: 'peaceful',
    particleDensity: 0.6,
    particleSpeed: 0.4,
    particleTypes: ['circle', 'dot'],
    interactionStrength: 0.3
  },
  energetic: { 
    name: 'energetic',
    particleDensity: 1.5,
    particleSpeed: 1.2,
    particleTypes: ['circle', 'square', 'triangle', 'star'],
    interactionStrength: 0.8
  },
  cozy: { 
    name: 'cozy',
    particleDensity: 0.8,
    particleSpeed: 0.5,
    particleTypes: ['circle', 'dot', 'star'],
    interactionStrength: 0.5
  },
  elegant: { 
    name: 'elegant',
    particleDensity: 0.9,
    particleSpeed: 0.7,
    particleTypes: ['circle', 'star'],
    interactionStrength: 0.6
  },
  default: { 
    name: 'default',
    particleDensity: 1.0, 
    particleSpeed: 0.8, 
    particleTypes: ['circle'],
    interactionStrength: 0.5
  }
};
