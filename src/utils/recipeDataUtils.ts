
/**
 * Utility functions for processing recipe data
 */

// Helper function to extract the first value from a possible JSON array or string
export const extractFirstValue = (value: any): string | undefined => {
  if (!value) return undefined;
  
  try {
    // If it's already a string, return it
    if (typeof value === 'string') {
      if (value.startsWith('[') || value.startsWith('{')) {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed[0];
        }
        return parsed.toString();
      }
      return value;
    }
    
    // If it's already an array, return the first item
    if (Array.isArray(value) && value.length > 0) {
      return value[0];
    }
  } catch (error) {
    console.error('Error parsing value:', error);
  }
  
  return String(value);
};

// Determine difficulty based on multiple factors with enhanced algorithm
export const determineDifficulty = (
  prepTime?: number | string, 
  ingredients?: string[], 
  instructions?: string[],
  authorDifficulty?: string
): 'Easy' | 'Medium' | 'Hard' => {
  // If author provided a difficulty level, use that as primary source
  if (authorDifficulty) {
    const normalizedDifficulty = authorDifficulty.toLowerCase().trim();
    if (normalizedDifficulty.includes('easy')) return 'Easy';
    if (normalizedDifficulty.includes('medium') || normalizedDifficulty.includes('moderate')) return 'Medium';
    if (normalizedDifficulty.includes('hard') || normalizedDifficulty.includes('difficult')) return 'Hard';
  }
  
  // Calculate a difficulty score based on multiple factors
  let difficultyScore = 0;
  
  // Factor 1: Prep time
  let totalMinutes = 0;
  if (typeof prepTime === 'number') {
    totalMinutes = prepTime;
  } else if (typeof prepTime === 'string') {
    // Extract numeric values from time strings
    const hourMatch = prepTime.match(/(\d+)\s*(?:hr|hour|h)/i);
    const minuteMatch = prepTime.match(/(\d+)\s*(?:min|minute|m)/i);
    
    if (hourMatch) totalMinutes += parseInt(hourMatch[1], 10) * 60;
    if (minuteMatch) totalMinutes += parseInt(minuteMatch[1], 10);
    
    // If no specific pattern matched, try to extract any number
    if (totalMinutes === 0) {
      const numberMatch = prepTime.match(/\d+/);
      if (numberMatch) totalMinutes = parseInt(numberMatch[0], 10);
    }
  }
  
  // Score based on time
  if (totalMinutes > 60) difficultyScore += 2;
  else if (totalMinutes > 30) difficultyScore += 1;
  
  // Factor 2: Number of ingredients
  const ingredientCount = ingredients?.filter(i => i && i.trim().length > 0).length || 0;
  if (ingredientCount > 12) difficultyScore += 2;
  else if (ingredientCount > 7) difficultyScore += 1;
  
  // Factor 3: Number of instructions/steps
  const instructionCount = instructions?.filter(i => i && i.trim().length > 0).length || 0;
  if (instructionCount > 10) difficultyScore += 2;
  else if (instructionCount > 5) difficultyScore += 1;
  
  // Factor 4: Check for complex techniques in instructions
  const complexityTerms = [
    'knead', 'proof', 'ferment', 'fold', 'whip', 'caramelize', 'reduce', 'deglaze',
    'blanch', 'braise', 'sous vide', 'temper', 'emulsify', 'julienne', 'butterfly'
  ];
  
  let complexityMatches = 0;
  instructions?.forEach(instruction => {
    if (instruction) {
      complexityTerms.forEach(term => {
        if (instruction.toLowerCase().includes(term)) {
          complexityMatches++;
        }
      });
    }
  });
  
  if (complexityMatches >= 3) difficultyScore += 2;
  else if (complexityMatches >= 1) difficultyScore += 1;
  
  // Map final score to difficulty level
  if (difficultyScore >= 4) return 'Hard';
  if (difficultyScore >= 2) return 'Medium';
  return 'Easy';
};

// Parse time values to standardized format
export const parseTimeValue = (timeValue: string | number | undefined): string => {
  if (!timeValue) return '30 min';
  
  // Handle numeric values
  if (typeof timeValue === 'number') {
    if (timeValue >= 60) {
      const hours = Math.floor(timeValue / 60);
      const minutes = timeValue % 60;
      return minutes > 0 ? `${hours} hr ${minutes} min` : `${hours} hr`;
    }
    return `${timeValue} min`;
  }
  
  // Handle string values
  if (typeof timeValue === 'string') {
    // Already formatted with units?
    if (timeValue.toLowerCase().includes('min') || 
        timeValue.toLowerCase().includes('hour') ||
        timeValue.toLowerCase().includes('hr')) {
      return timeValue;
    }
    
    // Parse ISO 8601 duration format (e.g., PT1H30M)
    const isoDurationMatch = timeValue.match(/PT(?:(\d+)H)?(?:(\d+)M)?/i);
    if (isoDurationMatch) {
      const hours = isoDurationMatch[1] ? parseInt(isoDurationMatch[1], 10) : 0;
      const minutes = isoDurationMatch[2] ? parseInt(isoDurationMatch[2], 10) : 0;
      
      if (hours > 0 && minutes > 0) return `${hours} hr ${minutes} min`;
      if (hours > 0) return `${hours} hr`;
      if (minutes > 0) return `${minutes} min`;
    }
    
    // Extract numeric values from string
    const hourMatch = timeValue.match(/(\d+)\s*(?:hr|hour|h)/i);
    const minuteMatch = timeValue.match(/(\d+)\s*(?:min|minute|m)/i);
    
    if (hourMatch || minuteMatch) {
      const hours = hourMatch ? parseInt(hourMatch[1], 10) : 0;
      const minutes = minuteMatch ? parseInt(minuteMatch[1], 10) : 0;
      
      if (hours > 0 && minutes > 0) return `${hours} hr ${minutes} min`;
      if (hours > 0) return `${hours} hr`;
      if (minutes > 0) return `${minutes} min`;
    }
    
    // Just extract any number as minutes
    const numberMatch = timeValue.match(/\d+/);
    if (numberMatch) {
      const minutes = parseInt(numberMatch[0], 10);
      if (minutes >= 60) {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return remainingMinutes > 0 ? `${hours} hr ${remainingMinutes} min` : `${hours} hr`;
      }
      return `${minutes} min`;
    }
  }
  
  // Default
  return '30 min';
};

// Clean and normalize ingredient text
export const normalizeIngredient = (ingredient: string): string => {
  if (!ingredient || typeof ingredient !== 'string') return '';
  
  // Trim and normalize whitespace
  let normalized = ingredient.trim().replace(/\s+/g, ' ');
  
  // Capitalize first letter
  if (normalized.length > 0) {
    normalized = normalized.charAt(0).toUpperCase() + normalized.slice(1);
  }
  
  // Remove any trailing colons or semicolons
  normalized = normalized.replace(/[;:]+$/, '');
  
  return normalized;
};

// Clean and normalize instruction text
export const normalizeInstruction = (instruction: string): string => {
  if (!instruction || typeof instruction !== 'string') return '';
  
  // Trim and normalize whitespace
  let normalized = instruction.trim().replace(/\s+/g, ' ');
  
  // Capitalize first letter
  if (normalized.length > 0) {
    normalized = normalized.charAt(0).toUpperCase() + normalized.slice(1);
  }
  
  // Ensure proper ending punctuation
  if (normalized.length > 0 && 
      !normalized.endsWith('.') && 
      !normalized.endsWith('!') && 
      !normalized.endsWith('?')) {
    normalized += '.';
  }
  
  return normalized;
};
