
// Canvas utility functions for the background system

// Create gradient based on time of day
export const createGradient = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  colors: string[],
  angle: number
): CanvasGradient => {
  // Convert angle to radians
  const angleRad = (angle * Math.PI) / 180;
  
  // Calculate gradient start and end points
  const gradientLength = Math.sqrt(width * width + height * height);
  const xCenter = width / 2;
  const yCenter = height / 2;
  const xOffset = Math.cos(angleRad) * gradientLength / 2;
  const yOffset = Math.sin(angleRad) * gradientLength / 2;
  
  const linearGradient = ctx.createLinearGradient(
    xCenter - xOffset, yCenter - yOffset,
    xCenter + xOffset, yCenter + yOffset
  );
  
  colors.forEach((color, index) => {
    linearGradient.addColorStop(index / (colors.length - 1), color);
  });
  
  return linearGradient;
};

// Generate noise texture
export const generateNoise = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  opacity: number
): ImageData => {
  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    // Create noise value
    const value = Math.floor(Math.random() * 255);
    
    // Apply noise with specified opacity
    data[i] = data[i + 1] = data[i + 2] = value;
    data[i + 3] = opacity;
  }
  
  return imageData;
};

// Create a radial gradient for mouse highlight
export const createMouseHighlight = (
  ctx: CanvasRenderingContext2D,
  mouseX: number,
  mouseY: number,
  radius: number
): CanvasGradient => {
  const radialGradient = ctx.createRadialGradient(
    mouseX, mouseY, 0,
    mouseX, mouseY, radius
  );
  
  radialGradient.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
  radialGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  
  return radialGradient;
};
