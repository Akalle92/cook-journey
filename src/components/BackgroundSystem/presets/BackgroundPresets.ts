import { TimeOfDay, CuisineType, Mood, TimeGradient, CuisineTexture, MoodSettings, ThemeType } from '../BackgroundTypes';
import { ParticleType } from '../particles/ParticleTypes';

export interface BackgroundTheme {
  name: ThemeType;
  timeGradient: TimeGradient;
  cuisineTexture: CuisineTexture;
  moodSettings: MoodSettings;
  description: string;
}

// Theme presets with complete configurations
export const themePresets: Record<ThemeType, BackgroundTheme> = {
  mystical: {
    name: 'mystical',
    timeGradient: {
      colors: ['#0F0C29', '#302B63', '#24243E'],
      angle: 135
    },
    cuisineTexture: {
      baseColor: '#1F1F3F',
      accentColor: '#9D71E8',
      pattern: 'geometric'
    },
    moodSettings: { 
      name: 'peaceful',
      particleDensity: 1.2,
      particleSpeed: 0.5,
      particleTypes: ['star', 'ring', 'circle'],
      interactionStrength: 0.7
    },
    description: 'A dreamlike mystical atmosphere with deep purples and stars'
  },
  
  futuristic: {
    name: 'futuristic',
    timeGradient: {
      colors: ['#000428', '#004e92'],
      angle: 145
    },
    cuisineTexture: {
      baseColor: '#0A1929',
      accentColor: '#00F5D4',
      pattern: 'geometric'
    },
    moodSettings: { 
      name: 'energetic',
      particleDensity: 1.4,
      particleSpeed: 1.0,
      particleTypes: ['square', 'plus', 'dot'],
      interactionStrength: 0.9
    },
    description: 'A high-tech futuristic feel with neon accents and geometric patterns'
  },
  
  natural: {
    name: 'natural',
    timeGradient: {
      colors: ['#2E3A14', '#557C55'],
      angle: 180
    },
    cuisineTexture: {
      baseColor: '#F0EFE2',
      accentColor: '#7D9D9C',
      pattern: 'woodgrain'
    },
    moodSettings: { 
      name: 'peaceful',
      particleDensity: 0.8,
      particleSpeed: 0.4,
      particleTypes: ['circle', 'dot', 'wave'],
      interactionStrength: 0.4
    },
    description: 'A calm, natural atmosphere with earthy tones and organic textures'
  },
  
  elegant: {
    name: 'elegant',
    timeGradient: {
      colors: ['#1A1A25', '#2D2D3A'],
      angle: 165
    },
    cuisineTexture: {
      baseColor: '#1D1D26',
      accentColor: '#C9A959',
      pattern: 'paper'
    },
    moodSettings: { 
      name: 'elegant',
      particleDensity: 0.7,
      particleSpeed: 0.5,
      particleTypes: ['circle', 'dot', 'ring'],
      interactionStrength: 0.5
    },
    description: 'A sophisticated, refined atmosphere with dark tones and gold accents'
  },
  
  minimalist: {
    name: 'minimalist',
    timeGradient: {
      colors: ['#F5F5F5', '#EEEEEE'],
      angle: 180
    },
    cuisineTexture: {
      baseColor: '#FFFFFF',
      accentColor: '#333333',
      pattern: 'default'
    },
    moodSettings: { 
      name: 'default',
      particleDensity: 0.5,
      particleSpeed: 0.3,
      particleTypes: ['dot', 'circle'],
      interactionStrength: 0.3
    },
    description: 'A clean, minimal design with subtle animations and monochrome palette'
  },
  
  vibrant: {
    name: 'vibrant',
    timeGradient: {
      colors: ['#FF6B6B', '#6B66FF'],
      angle: 135
    },
    cuisineTexture: {
      baseColor: '#2D1B69',
      accentColor: '#FE53BB',
      pattern: 'geometric'
    },
    moodSettings: { 
      name: 'energetic',
      particleDensity: 1.6,
      particleSpeed: 1.2,
      particleTypes: ['star', 'triangle', 'square', 'plus'],
      interactionStrength: 1.0
    },
    description: 'A high-energy, vibrant design with bright colors and active elements'
  },
  
  cozy: {
    name: 'cozy',
    timeGradient: {
      colors: ['#FFE5B9', '#FFC38B'],
      angle: 160
    },
    cuisineTexture: {
      baseColor: '#FFF1DC',
      accentColor: '#A87C5F',
      pattern: 'terracotta'
    },
    moodSettings: { 
      name: 'cozy',
      particleDensity: 0.9,
      particleSpeed: 0.5,
      particleTypes: ['circle', 'dot', 'triangle'],
      interactionStrength: 0.6
    },
    description: 'A warm, inviting atmosphere with amber tones and soft animations'
  },
  
  default: {
    name: 'default',
    timeGradient: {
      colors: ['#202124', '#303134'],
      angle: 135
    },
    cuisineTexture: {
      baseColor: '#202124',
      accentColor: '#00F5D4',
      pattern: 'default'
    },
    moodSettings: { 
      name: 'default',
      particleDensity: 1.0,
      particleSpeed: 0.7,
      particleTypes: ['circle', 'dot'],
      interactionStrength: 0.5
    },
    description: 'The default theme with a balanced, neutral appearance'
  }
};

// Helper function to apply a theme
export const applyTheme = (
  theme: ThemeType, 
  timeOfDay: TimeOfDay = 'afternoon',
  customSettings?: Partial<BackgroundTheme>
): BackgroundTheme => {
  // Get the base theme
  const baseTheme = themePresets[theme];
  
  // Apply time of day variations
  let timeGradient = {...baseTheme.timeGradient};
  
  // Adjust colors based on time of day
  if (timeOfDay === 'night') {
    // Darken the gradient for night
    timeGradient.colors = timeGradient.colors.map(color => 
      darkenColor(color, 20)
    );
  } else if (timeOfDay === 'morning') {
    // Add warmth for morning
    timeGradient.colors = timeGradient.colors.map(color => 
      addColorTint(color, '#FFD59E', 0.2)
    );
  } else if (timeOfDay === 'evening') {
    // Add amber for evening
    timeGradient.colors = timeGradient.colors.map(color => 
      addColorTint(color, '#FFB088', 0.15)
    );
  }
  
  // Override with any custom settings
  return {
    ...baseTheme,
    timeGradient,
    ...customSettings
  };
};

// Utility function to darken a hex color
const darkenColor = (color: string, amount: number): string => {
  return color.replace(/^#/, '').replace(/../g, (colorSubstr) => {
    const value = Math.max(0, parseInt(colorSubstr, 16) - amount);
    return value.toString(16).padStart(2, '0');
  }).replace(/^/, '#');
};

// Utility function to add a tint to a color
const addColorTint = (color: string, tintColor: string, amount: number): string => {
  // Convert hex to RGB
  const hexToRgb = (hex: string): [number, number, number] => {
    const bigint = parseInt(hex.replace(/^#/, ''), 16);
    return [
      (bigint >> 16) & 255,
      (bigint >> 8) & 255,
      bigint & 255
    ];
  };
  
  // Convert RGB to hex
  const rgbToHex = (r: number, g: number, b: number): string => {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };
  
  const baseRgb = hexToRgb(color);
  const tintRgb = hexToRgb(tintColor);
  
  // Mix the colors
  const mixedRgb = baseRgb.map((channel, i) => {
    return Math.round(channel * (1 - amount) + tintRgb[i] * amount);
  });
  
  return rgbToHex(mixedRgb[0], mixedRgb[1], mixedRgb[2]);
};
