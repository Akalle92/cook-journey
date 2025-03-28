
import React from 'react';
import { useBackground } from './BackgroundContext';

interface TextureOverlayProps {
  type?: 'fine' | 'medium' | 'coarse' | 'paper' | 'fabric' | 'brushstroke' | 'food';
  blend?: 'overlay' | 'soft-light' | 'multiply' | 'screen';
  opacity?: number;
  className?: string;
}

export const TextureOverlay: React.FC<TextureOverlayProps> = ({
  type = 'fine',
  blend = 'soft-light',
  opacity = 0.1,
  className,
}) => {
  const { timeOfDay } = useBackground();
  
  // Adjust opacity based on time of day
  const timeBasedOpacity = {
    morning: opacity,
    afternoon: opacity * 0.8,
    evening: opacity * 1.2,
    night: opacity * 1.5,
  };
  
  // Define SVG patterns for different texture types
  const texturePatterns = {
    fine: (
      <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 40 40">
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0.5 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" />
      </svg>
    ),
    medium: (
      <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 40 40">
        <filter id="noise-medium">
          <feTurbulence type="fractalNoise" baseFrequency="0.35" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0.7 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise-medium)" />
      </svg>
    ),
    coarse: (
      <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 40 40">
        <filter id="noise-coarse">
          <feTurbulence type="fractalNoise" baseFrequency="0.15" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0.9 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise-coarse)" />
      </svg>
    ),
    paper: (
      <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100">
        <filter id="paper-texture">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0.3 0" />
          <feComponentTransfer>
            <feFuncR type="table" tableValues="0 0.02 0.03 0.03 0.09 0.1 0.12 0.13 0.16 1" />
            <feFuncG type="table" tableValues="0 0.02 0.03 0.03 0.09 0.1 0.12 0.13 0.16 1" />
            <feFuncB type="table" tableValues="0 0.02 0.03 0.03 0.09 0.1 0.12 0.13 0.16 1" />
          </feComponentTransfer>
        </filter>
        <rect width="100%" height="100%" filter="url(#paper-texture)" />
      </svg>
    ),
    fabric: (
      <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 80 80">
        <pattern id="fabric" patternUnits="userSpaceOnUse" width="10" height="10">
          <path d="M0 0h10v10H0z" fill="none" stroke="#000" strokeWidth="0.5" strokeOpacity="0.1" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#fabric)" />
        <filter id="fabric-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.2" numOctaves="2" />
          <feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0.3 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#fabric-noise)" style={{ mixBlendMode: 'overlay' }} />
      </svg>
    ),
    brushstroke: (
      <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100">
        <filter id="brushstroke">
          <feTurbulence type="turbulence" baseFrequency="0.005 0.3" numOctaves="3" seed="5" />
          <feDisplacementMap in="SourceGraphic" scale="20" />
        </filter>
        <rect width="100%" height="100%" filter="url(#brushstroke)" />
      </svg>
    ),
    food: (
      <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100">
        <defs>
          <pattern id="dots" patternUnits="userSpaceOnUse" width="20" height="20">
            <circle cx="10" cy="10" r="1.5" fill="#000" fillOpacity="0.1" />
          </pattern>
          <pattern id="lines" patternUnits="userSpaceOnUse" width="20" height="20">
            <path d="M0,10 L20,10" stroke="#000" strokeWidth="0.5" strokeOpacity="0.05" />
            <path d="M10,0 L10,20" stroke="#000" strokeWidth="0.5" strokeOpacity="0.05" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
        <rect width="100%" height="100%" fill="url(#lines)" />
      </svg>
    ),
  };
  
  // Map blend mode to CSS class
  const blendModeClass = {
    'overlay': 'mix-blend-overlay',
    'soft-light': 'mix-blend-soft-light',
    'multiply': 'mix-blend-multiply',
    'screen': 'mix-blend-screen',
  };
  
  return (
    <div
      className={`absolute inset-0 pointer-events-none ${blendModeClass[blend]} ${className || ''}`}
      style={{ opacity: timeBasedOpacity[timeOfDay] }}
    >
      {texturePatterns[type]}
    </div>
  );
};
