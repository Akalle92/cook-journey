
import { Recipe } from '@/components/RecipeCard';
import { mapToRecipe } from '@/utils/recipeMappers';
import { formatRecipeTitle, decodeHtmlEntities } from '@/utils/recipeDataUtils';

const RECIPE_API_URL = import.meta.env.VITE_RECIPE_API_URL || 'http://localhost:3001';

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
    
    // Additional cleanup of ingredients and instructions
    if (extractedRecipe.ingredients && Array.isArray(extractedRecipe.ingredients)) {
      extractedRecipe.ingredients = extractedRecipe.ingredients.map(ingredient => 
        typeof ingredient === 'string' ? decodeHtmlEntities(ingredient) : ingredient
      );
    }
    
    if (extractedRecipe.instructions && Array.isArray(extractedRecipe.instructions)) {
      extractedRecipe.instructions = extractedRecipe.instructions.map(instruction => 
        typeof instruction === 'string' ? decodeHtmlEntities(instruction) : instruction
      );
    }
  }
  
  return extractedRecipe;
};

export const enhanceRecipeWithFreeModel = async (url: string) => {
  const enhancedRecipe = await performEnhancement(url);
  
  if (enhancedRecipe && enhancedRecipe.title) {
    enhancedRecipe.title = formatRecipeTitle(enhancedRecipe.title);
    
    // Additional cleanup of ingredients and instructions
    if (enhancedRecipe.ingredients && Array.isArray(enhancedRecipe.ingredients)) {
      enhancedRecipe.ingredients = enhancedRecipe.ingredients.map(ingredient => 
        typeof ingredient === 'string' ? decodeHtmlEntities(ingredient) : ingredient
      );
    }
    
    if (enhancedRecipe.instructions && Array.isArray(enhancedRecipe.instructions)) {
      enhancedRecipe.instructions = enhancedRecipe.instructions.map(instruction => 
        typeof instruction === 'string' ? decodeHtmlEntities(instruction) : instruction
      );
    }
  }
  
  return enhancedRecipe;
};
