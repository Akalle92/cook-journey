import { Recipe } from '@/components/RecipeCard';
import { mapToRecipe } from '@/utils/recipeMappers';
import { formatRecipeTitle } from '@/utils/recipeDataUtils';

const RECIPE_API_URL = process.env.NEXT_PUBLIC_RECIPE_API_URL || 'http://localhost:3001';

// Function to perform the actual extraction from the URL
const performExtraction = async (url: string): Promise<Recipe | null> => {
  try {
    const response = await fetch(`${RECIPE_API_URL}/extract`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Extraction failed:', errorData);
      throw new Error(errorData.message || 'Extraction failed');
    }

    const result = await response.json();
    console.log('Extraction result:', result);

    if (result && result.data) {
      return mapToRecipe(result.data);
    } else {
      console.warn('No data returned from extraction:', result);
      return null;
    }
  } catch (error: any) {
    console.error('Error during extraction:', error);
    throw new Error(error.message || 'Extraction failed');
  }
};

// Function to perform recipe enhancement using a free model
const performEnhancement = async (url: string): Promise<Recipe | null> => {
  try {
    const userId = 'free-model-user'; // Replace with actual user ID if available
    const response = await fetch(`${RECIPE_API_URL}/free-model-recipe-generator`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url, userId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Enhancement failed:', errorData);
      throw new Error(errorData.message || 'Enhancement failed');
    }

    const result = await response.json();
    console.log('Enhancement result:', result);

    if (result && result.data) {
      return mapToRecipe(result.data);
    } else {
      console.warn('No data returned from enhancement:', result);
      return null;
    }
  } catch (error: any) {
    console.error('Error during enhancement:', error);
    throw new Error(error.message || 'Enhancement failed');
  }
};

export const extractRecipeFromUrl = async (url: string) => {
  const extractedRecipe = await performExtraction(url);
  
  if (extractedRecipe && extractedRecipe.title) {
    extractedRecipe.title = formatRecipeTitle(extractedRecipe.title);
  }
  
  return extractedRecipe;
};

export const enhanceRecipeWithFreeModel = async (url: string) => {
  const enhancedRecipe = await performEnhancement(url);
  
  if (enhancedRecipe && enhancedRecipe.title) {
    enhancedRecipe.title = formatRecipeTitle(enhancedRecipe.title);
  }
  
  return enhancedRecipe;
};
