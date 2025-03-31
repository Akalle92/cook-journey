import { Recipe } from '@/types/recipe';

interface ScaledRecipe extends Omit<Recipe, 'ingredients' | 'prepTime' | 'cookTime' | 'servings'> {
  ingredients: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
}

export const scaleRecipe = (recipe: Recipe, targetServings: number): ScaledRecipe => {
  const scaleFactor = targetServings / recipe.servings;

  // Scale ingredients
  const scaledIngredients = recipe.ingredients.map(ingredient => {
    // Match numbers and units in the ingredient string
    const matches = ingredient.match(/(\d+(?:\.\d+)?)\s*([a-zA-Z]+)?/);
    if (!matches) return ingredient;

    const [_, amount, unit] = matches;
    let scaledAmount = (parseFloat(amount) * scaleFactor).toFixed(2);

    // Handle common unit conversions
    let scaledUnit = unit;
    if (unit) {
      const unitLower = unit.toLowerCase();
      if (unitLower === 'tbsp' && parseFloat(scaledAmount) >= 16) {
        scaledUnit = 'cup';
      } else if (unitLower === 'tsp' && parseFloat(scaledAmount) >= 3) {
        scaledUnit = 'tbsp';
      } else if (unitLower === 'cup' && parseFloat(scaledAmount) >= 4) {
        scaledAmount = (parseFloat(scaledAmount) / 4).toFixed(2);
        scaledUnit = 'quart';
      }
    }

    return ingredient.replace(/(\d+(?:\.\d+)?)\s*([a-zA-Z]+)?/, `${scaledAmount} ${scaledUnit || ''}`);
  });

  // Scale times (prep and cook time)
  const scaleTime = (time: string): number => {
    const minutes = parseTimeToMinutes(time);
    return Math.round(minutes * scaleFactor);
  };

  return {
    ...recipe,
    ingredients: scaledIngredients,
    prepTime: scaleTime(String(recipe.prepTime)),
    cookTime: scaleTime(String(recipe.cookTime)),
    servings: targetServings,
  };
};

// Helper function to convert time string to minutes
const parseTimeToMinutes = (time: string): number => {
  const hours = time.match(/(\d+)\s*h/);
  const minutes = time.match(/(\d+)\s*m/);

  let totalMinutes = 0;
  if (hours) totalMinutes += parseInt(hours[1]) * 60;
  if (minutes) totalMinutes += parseInt(minutes[1]);

  return totalMinutes || 30; // Default to 30 minutes if no time specified
};

// Helper function to format minutes back to time string
export const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}; 