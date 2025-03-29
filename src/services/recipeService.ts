
import { fetchRecipes, deleteRecipe } from './recipeApiService';
import { extractRecipeFromUrl, enhanceRecipeWithFreeModel } from './recipeExtractionService';
import { mapToRecipe } from '@/utils/recipeMappers';
import { mockRecipes } from '@/data/mockRecipes';

// Re-export all recipe-related functionality
export {
  fetchRecipes,
  deleteRecipe,
  extractRecipeFromUrl,
  enhanceRecipeWithFreeModel,
  mapToRecipe,
  mockRecipes
};
