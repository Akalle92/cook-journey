
import { CuisinePattern } from '../BackgroundTypes';

// Pattern drawing functions
export const drawTerracottaPattern = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  const size = 60;
  const spacing = 80;
  
  for (let x = 0; x < width; x += spacing) {
    for (let y = 0; y < height; y += spacing) {
      ctx.beginPath();
      ctx.ellipse(x, y, size / 2, size / 3, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
};

export const drawPaperPattern = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  // Draw horizontal lines
  for (let y = 0; y < height; y += 30) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }
  
  // Draw occasional vertical lines
  for (let x = 0; x < width; x += 100) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.lineWidth = 0.2;
    ctx.stroke();
  }
};

export const drawGeometricPattern = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  const size = 40;
  
  for (let x = 0; x < width; x += size * 2) {
    for (let y = 0; y < height; y += size * 2) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + size, y);
      ctx.lineTo(x + size, y + size);
      ctx.closePath();
      ctx.fill();
      
      ctx.beginPath();
      ctx.moveTo(x + size, y + size);
      ctx.lineTo(x + size * 2, y + size);
      ctx.lineTo(x + size, y + size * 2);
      ctx.closePath();
      ctx.fill();
    }
  }
};

export const drawWoodgrainPattern = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  // Draw flowing lines for wood grain
  for (let y = 0; y < height; y += 15) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    
    // Create wavy pattern
    for (let x = 0; x < width; x += 20) {
      const offset = Math.sin(x / 100) * 5;
      ctx.lineTo(x, y + offset);
    }
    
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }
};

export const drawDefaultPattern = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  const size = 80;
  
  for (let x = 0; x < width; x += size) {
    for (let y = 0; y < height; y += size) {
      if ((x + y) % (size * 2) === 0) {
        ctx.fillRect(x, y, size / 2, size / 2);
      }
    }
  }
};

// Draw pattern based on cuisine type
export const drawPatternByCuisine = (
  ctx: CanvasRenderingContext2D, 
  width: number, 
  height: number, 
  pattern: CuisinePattern
) => {
  switch (pattern) {
    case 'terracotta':
      drawTerracottaPattern(ctx, width, height);
      break;
    case 'paper':
      drawPaperPattern(ctx, width, height);
      break;
    case 'geometric':
      drawGeometricPattern(ctx, width, height);
      break;
    case 'woodgrain':
      drawWoodgrainPattern(ctx, width, height);
      break;
    default:
      drawDefaultPattern(ctx, width, height);
      break;
  }
};
