
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

// Helper function to determine difficulty based on prep and cook time
export const determineDifficulty = (prepTime?: number, cookTime?: number): 'Easy' | 'Medium' | 'Hard' => {
  const totalTime = (prepTime || 0) + (cookTime || 0);
  
  if (totalTime < 30) return 'Easy';
  if (totalTime < 60) return 'Medium';
  return 'Hard';
};
