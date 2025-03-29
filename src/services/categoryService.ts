
import { supabase } from '@/integrations/supabase/client';
import { Category } from '@/components/RecipeCategories/CategorySelector';

// Fetch all categories
export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
    
    return data.map(item => ({
      id: item.id,
      name: item.name,
      color: item.color_code ? `bg-${item.color_code}` : undefined
    }));
  } catch (error) {
    console.error('Error in fetchCategories:', error);
    // Return default categories for demo purposes
    return [
      { id: 'breakfast', name: 'Breakfast', color: 'bg-amber-500' },
      { id: 'lunch', name: 'Lunch', color: 'bg-emerald-500' },
      { id: 'dinner', name: 'Dinner', color: 'bg-indigo-500' },
      { id: 'dessert', name: 'Dessert', color: 'bg-purple-500' },
      { id: 'snack', name: 'Snack', color: 'bg-rose-500' },
      { id: 'vegetarian', name: 'Vegetarian', color: 'bg-green-500' },
      { id: 'vegan', name: 'Vegan', color: 'bg-teal-500' },
      { id: 'keto', name: 'Keto', color: 'bg-cyan-500' },
      { id: 'italian', name: 'Italian', color: 'bg-red-500' },
      { id: 'mexican', name: 'Mexican', color: 'bg-orange-500' },
      { id: 'asian', name: 'Asian', color: 'bg-yellow-500' },
    ];
  }
};

// Create a new category
export const createCategory = async (categoryData: { name: string, color?: string }): Promise<Category> => {
  try {
    const { data, error } = await supabase
      .from('collections')
      .insert([
        { 
          name: categoryData.name,
          color_code: categoryData.color ? categoryData.color.replace('bg-', '') : null
        }
      ])
      .select('*')
      .single();
    
    if (error) {
      console.error('Error creating category:', error);
      throw error;
    }
    
    return {
      id: data.id,
      name: data.name,
      color: data.color_code ? `bg-${data.color_code}` : undefined
    };
  } catch (error) {
    console.error('Error in createCategory:', error);
    throw new Error('Failed to create category');
  }
};

// Add a recipe to a category
export const addRecipeToCategory = async (recipeId: string, categoryId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('recipe_collections')
      .insert([
        { 
          recipe_id: recipeId,
          collection_id: categoryId
        }
      ]);
    
    if (error) {
      console.error('Error adding recipe to category:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in addRecipeToCategory:', error);
    throw new Error('Failed to add recipe to category');
  }
};

// Get categories for a recipe
export const getCategoriesForRecipe = async (recipeId: string): Promise<Category[]> => {
  try {
    const { data, error } = await supabase
      .from('recipe_collections')
      .select('collection_id')
      .eq('recipe_id', recipeId);
    
    if (error) {
      console.error('Error fetching recipe categories:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    const categoryIds = data.map(item => item.collection_id);
    
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('collections')
      .select('*')
      .in('id', categoryIds);
    
    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
      throw categoriesError;
    }
    
    return categoriesData.map(item => ({
      id: item.id,
      name: item.name,
      color: item.color_code ? `bg-${item.color_code}` : undefined
    }));
  } catch (error) {
    console.error('Error in getCategoriesForRecipe:', error);
    return [];
  }
};
