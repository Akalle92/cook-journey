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

// Fetch favorite recipes
export const fetchFavoriteRecipes = async (): Promise<Recipe[]> => {
  try {
    // In a real app, this would fetch from your database
    // For now, we'll just simulate it with some mock data
    const { data, error } = await supabase
      .from('favorites')
      .select('recipe_id')
      .eq('user_id', supabase.auth.getUser().then(res => res.data.user?.id))

    if (error) {
      console.error('Error fetching favorites:', error);
      throw new Error(error.message);
    }
    
    // For demo purposes, return an empty array or some mock recipes
    // In a real implementation, you would fetch the full recipe data for each favorite
    return data?.length ? data.map(fav => fav.recipe_id) : [];
  } catch (error) {
    console.error('Error in fetchFavoriteRecipes:', error);
    return [];
  }
}
