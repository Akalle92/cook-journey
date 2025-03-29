
import { Recipe } from '@/components/RecipeCard';
import { supabase } from '@/integrations/supabase/client';
import { mapToRecipe } from '@/utils/recipeMappers';
import { mockRecipes } from '@/data/mockRecipes';

// Fetch recipes from Supabase
export const fetchRecipes = async (): Promise<Recipe[]> => {
  try {
    console.log('Fetching recipes from Supabase...');
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching recipes:', error);
      throw error;
    }
    
    console.log('Raw recipe data from Supabase:', data);
    
    // If no data yet, return mock recipes (for demo purposes)
    if (!data || data.length === 0) {
      console.log('No recipes found in database, returning mock data');
      return mockRecipes;
    }
    
    const mappedRecipes = data.map(mapToRecipe);
    console.log('Mapped recipes:', mappedRecipes);
    return mappedRecipes;
  } catch (error) {
    console.error('Error in fetchRecipes:', error);
    return mockRecipes;
  }
};

// Delete a recipe from Supabase
export const deleteRecipe = async (recipeId: string): Promise<void> => {
  try {
    // Get the current user to validate ownership
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('You must be logged in to delete recipes');
    }
    
    // Delete the recipe
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', recipeId)
      .eq('user_id', user.id); // Ensure the user can only delete their own recipes
    
    if (error) {
      console.error('Error deleting recipe:', error);
      throw new Error(error.message || 'Failed to delete recipe');
    }
  } catch (error: any) {
    console.error('Error in deleteRecipe:', error);
    throw new Error(error.message || 'Failed to delete recipe. Please try again.');
  }
};
