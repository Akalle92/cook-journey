import { Recipe } from '@/types/recipe';

interface ParsedRecipe {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime: string;
  cookTime: string;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  cuisine: string;
  dietaryRestrictions: string[];
  calories: number;
  imageUrls: string[];
  tags: string[];
  category: string;
  confidence: number;
  method: string;
  extractionResults: any;
  debugInfo: any;
  data: any;
}

export const parseRecipe = (data: any): ParsedRecipe => {
  // Extract all images from the data
  const imageUrls: string[] = [];
  if (data.images) {
    if (Array.isArray(data.images)) {
      imageUrls.push(...data.images);
    } else if (typeof data.images === 'string') {
      imageUrls.push(data.images);
    }
  }
  if (data.image) {
    if (Array.isArray(data.image)) {
      imageUrls.push(...data.image);
    } else if (typeof data.image === 'string') {
      imageUrls.push(data.image);
    }
  }

  // Extract ingredients, ensuring they're properly formatted
  const ingredients = Array.isArray(data.ingredients)
    ? data.ingredients.map((ing: string) => {
        // Clean up ingredient strings
        return ing
          .replace(/\s+/g, ' ')
          .replace(/^[•\-\*]\s*/, '')
          .trim();
      })
    : [];

  // Extract instructions, ensuring they're properly formatted
  const instructions = Array.isArray(data.instructions)
    ? data.instructions.map((inst: string) => {
        // Clean up instruction strings
        return inst
          .replace(/\s+/g, ' ')
          .replace(/^[•\-\*]\s*/, '')
          .trim();
      })
    : [];

  // Extract dietary restrictions
  const dietaryRestrictions: string[] = [];
  if (data.dietaryRestrictions) {
    if (Array.isArray(data.dietaryRestrictions)) {
      dietaryRestrictions.push(...data.dietaryRestrictions);
    } else if (typeof data.dietaryRestrictions === 'string') {
      dietaryRestrictions.push(data.dietaryRestrictions);
    }
  }

  // Extract tags
  const tags: string[] = [];
  if (data.tags) {
    if (Array.isArray(data.tags)) {
      tags.push(...data.tags);
    } else if (typeof data.tags === 'string') {
      tags.push(data.tags);
    }
  }

  // Determine difficulty based on various factors
  let difficulty: 'easy' | 'medium' | 'hard' = 'medium';
  if (data.difficulty) {
    const diff = data.difficulty.toLowerCase();
    if (['easy', 'simple', 'beginner'].includes(diff)) difficulty = 'easy';
    else if (['hard', 'complex', 'expert'].includes(diff)) difficulty = 'hard';
  } else {
    // Calculate difficulty based on number of ingredients and steps
    const ingredientCount = ingredients.length;
    const stepCount = instructions.length;
    if (ingredientCount <= 5 && stepCount <= 5) difficulty = 'easy';
    else if (ingredientCount > 10 || stepCount > 10) difficulty = 'hard';
  }

  // Parse times
  const prepTime = data.prepTime || data.prep_time || '0';
  const cookTime = data.cookTime || data.cook_time || '0';

  // Parse servings
  const servings = parseInt(data.servings || data.serving_size || '4', 10) || 4;

  // Parse calories
  const calories = parseInt(data.calories || data.calorie_count || '0', 10) || 0;

  return {
    title: data.title || data.name || 'Untitled Recipe',
    description: data.description || data.desc || '',
    ingredients,
    instructions,
    prepTime,
    cookTime,
    servings,
    difficulty,
    cuisine: data.cuisine || data.cuisine_type || 'Other',
    dietaryRestrictions,
    calories,
    imageUrls,
    tags,
    category: data.category || data.type || 'Other',
    confidence: data.confidence || 1,
    method: data.method || 'manual',
    extractionResults: data.extraction_results || {},
    debugInfo: data.debug_info || {},
    data: data
  };
};

export const createRecipe = (parsedData: ParsedRecipe): Recipe => {
  return {
    id: crypto.randomUUID(),
    title: parsedData.title,
    description: parsedData.description,
    ingredients: parsedData.ingredients,
    instructions: parsedData.instructions,
    prepTime: parsedData.prepTime,
    cookTime: parsedData.cookTime,
    servings: parsedData.servings,
    difficulty: parsedData.difficulty,
    cuisine: parsedData.cuisine,
    dietaryRestrictions: parsedData.dietaryRestrictions,
    calories: parsedData.calories,
    imageUrl: parsedData.imageUrls[0] || '', // Use first image as primary
    imageUrls: parsedData.imageUrls, // Store all images
    tags: parsedData.tags,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: parsedData.category,
    confidence: parsedData.confidence,
    method: parsedData.method,
    extractionResults: parsedData.extractionResults,
    debugInfo: parsedData.debugInfo,
    data: parsedData.data
  };
}; 