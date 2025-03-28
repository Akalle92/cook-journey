
// Drawing functions for complex particle shapes

// Draw a star shape
export const drawStar = (
  ctx: CanvasRenderingContext2D, 
  x: number, 
  y: number, 
  radius: number, 
  spikes: number, 
  rotation: number
) => {
  let rot = Math.PI / 2 * 3 + rotation;
  const step = Math.PI / spikes;
  
  ctx.beginPath();
  ctx.moveTo(x + radius * Math.cos(rot), y + radius * Math.sin(rot));
  
  for (let i = 0; i < spikes; i++) {
    rot += step;
    const outerX = x + radius * Math.cos(rot);
    const outerY = y + radius * Math.sin(rot);
    ctx.lineTo(outerX, outerY);
    
    rot += step;
    const innerX = x + (radius * 0.4) * Math.cos(rot);
    const innerY = y + (radius * 0.4) * Math.sin(rot);
    ctx.lineTo(innerX, innerY);
  }
  
  ctx.closePath();
};

// Draw a triangle shape
export const drawTriangle = (
  ctx: CanvasRenderingContext2D, 
  x: number, 
  y: number, 
  size: number, 
  rotation: number
) => {
  const height = size * Math.sqrt(3) / 2;
  
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  
  ctx.beginPath();
  ctx.moveTo(0, -height / 2);
  ctx.lineTo(-size / 2, height / 2);
  ctx.lineTo(size / 2, height / 2);
  ctx.closePath();
  
  ctx.restore();
};

// Draw a ring shape
export const drawRing = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number
) => {
  const innerRadius = radius * 0.6;
  
  ctx.beginPath();
  // Outer circle
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  // Inner circle (counterclockwise to create hole)
  ctx.arc(x, y, innerRadius, 0, Math.PI * 2, true);
  ctx.closePath();
};

// Draw a plus shape
export const drawPlus = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  rotation: number
) => {
  const armWidth = size * 0.3;
  
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  
  ctx.beginPath();
  // Horizontal arm
  ctx.rect(-size/2, -armWidth/2, size, armWidth);
  // Vertical arm
  ctx.rect(-armWidth/2, -size/2, armWidth, size);
  
  ctx.restore();
};

// Draw a wave shape
export const drawWave = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  rotation: number
) => {
  const amplitude = size * 0.3;
  const frequency = 1 / size * Math.PI * 2;
  const points = 20;
  
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  
  ctx.beginPath();
  ctx.moveTo(-size/2, 0);
  
  for (let i = 0; i <= points; i++) {
    const xPos = -size/2 + (i / points) * size;
    const yPos = Math.sin(xPos * frequency) * amplitude;
    ctx.lineTo(xPos, yPos);
  }
  
  ctx.restore();
};
