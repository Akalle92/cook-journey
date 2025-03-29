
import { Recipe } from '@/components/RecipeCard';
import { extractFirstImageUrl } from './imageUtils';
import { extractFirstValue, determineDifficulty } from './recipeDataUtils';

// Convert Supabase recipe data to our Recipe type
export const mapToRecipe = (item: any): Recipe => {
  // Handle ingredients that might be stored as a JSON string
  let ingredients = [];
  try {
    if (Array.isArray(item.ingredients)) {
      ingredients = item.ingredients; 
    } else if (typeof item.ingredients === 'string') {
      ingredients = JSON.parse(item.ingredients);
    } else if (typeof item.ingredients === 'object' && item.ingredients !== null) {
      // Handle JSON object format
      ingredients = Array.isArray(item.ingredients) ? item.ingredients : [];
    }
  } catch (error) {
    console.error('Error parsing ingredients:', error);
    ingredients = [];
  }

  // Handle instructions that might be stored as a JSON string
  let instructions = [];
  try {
    if (Array.isArray(item.instructions)) {
      instructions = item.instructions;
    } else if (typeof item.instructions === 'string') {
      instructions = JSON.parse(item.instructions);
    } else if (typeof item.instructions === 'object' && item.instructions !== null) {
      // Handle JSON object format
      instructions = Array.isArray(item.instructions) ? item.instructions : [];
    }
  } catch (error) {
    console.error('Error parsing instructions:', error);
    instructions = [];
  }

  // Format the category nicely with proper capitalization
  let category = extractFirstValue(item.category) || 'Uncategorized';
  if (category) {
    category = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
  }

  // Format prep time to be more user-friendly
  let prepTime = item.prep_time ? `${item.prep_time} min` : 'N/A';
  
  // Format difficulty level with proper capitalization
  let difficulty = determineDifficulty(item.prep_time, item.cook_time);
  if (difficulty) {
    difficulty = difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase();
  }

  return {
    id: item.id,
    title: item.title || 'Untitled Recipe',
    image: extractFirstImageUrl(item.image_url) || 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?q=80&w=1000&auto=format&fit=crop',
    category: category,
    prepTime: prepTime,
    difficulty: difficulty,
    ingredients: ingredients,
    instructions: instructions
  };
};
