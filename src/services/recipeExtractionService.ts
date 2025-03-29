import { Recipe } from '@/components/RecipeCard';
import { mapToRecipe } from '@/utils/recipeMappers';
import { formatRecipeTitle, decodeHtmlEntities } from '@/utils/recipeDataUtils';

// Use window.location origin as fallback if environment variable is not available
const RECIPE_API_URL = import.meta.env.VITE_RECIPE_API_URL || window.location.origin;

// Function to perform the actual extraction from the URL
const performExtraction = async (url: string): Promise<Recipe | null> => {
  try {
    console.log('Attempting recipe extraction from URL:', url);
    console.log('Using API endpoint:', `${RECIPE_API_URL}/extract`);
    
    const response = await fetch(`${RECIPE_API_URL}/extract`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `HTTP error: ${response.status}` }));
      console.error('Extraction failed:', errorData);
      throw new Error(errorData.message || `Extraction failed with status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Extraction result:', result);

    if (result && result.data) {
      // Ensure ingredients are properly parsed before mapping
      if (result.data.ingredients) {
        // Handle different ingredient formats
        if (typeof result.data.ingredients === 'string') {
          try {
            // Try parsing as JSON
            const parsed = JSON.parse(result.data.ingredients);
            result.data.ingredients = Array.isArray(parsed) ? parsed : [result.data.ingredients];
          } catch (e) {
            // If parsing fails, split by common separators
            result.data.ingredients = result.data.ingredients
              .split(/\n|•|\*|\d+\.|,/)
              .filter((item: string) => item.trim().length > 0)
              .map((item: string) => item.trim());
          }
        } else if (!Array.isArray(result.data.ingredients)) {
          result.data.ingredients = [String(result.data.ingredients)];
        }
      }

      // Ensure instructions are properly parsed before mapping
      if (result.data.instructions) {
        // Handle different instruction formats
        if (typeof result.data.instructions === 'string') {
          try {
            // Try parsing as JSON
            const parsed = JSON.parse(result.data.instructions);
            result.data.instructions = Array.isArray(parsed) ? parsed : [result.data.instructions];
          } catch (e) {
            // If parsing fails, split by common separators
            result.data.instructions = result.data.instructions
              .split(/\n|(?:\d+\.)|(?:Step \d+:)/)
              .filter((item: string) => item.trim().length > 0)
              .map((item: string) => item.trim());
          }
        } else if (!Array.isArray(result.data.instructions)) {
          result.data.instructions = [String(result.data.instructions)];
        }
      }

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
    console.log('Attempting recipe enhancement with free model for URL:', url);
    console.log('Using API endpoint:', `${RECIPE_API_URL}/free-model-recipe-generator`);
    
    const userId = 'free-model-user'; // Replace with actual user ID if available
    const response = await fetch(`${RECIPE_API_URL}/free-model-recipe-generator`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url, userId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `HTTP error: ${response.status}` }));
      console.error('Enhancement failed:', errorData);
      throw new Error(errorData.message || `Enhancement failed with status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Enhancement result:', result);

    if (result && result.data) {
      // Ensure ingredients are properly parsed before mapping
      if (result.data.ingredients) {
        // Handle different ingredient formats
        if (typeof result.data.ingredients === 'string') {
          try {
            // Try parsing as JSON
            const parsed = JSON.parse(result.data.ingredients);
            result.data.ingredients = Array.isArray(parsed) ? parsed : [result.data.ingredients];
          } catch (e) {
            // If parsing fails, split by common separators
            result.data.ingredients = result.data.ingredients
              .split(/\n|•|\*|\d+\.|,/)
              .filter((item: string) => item.trim().length > 0)
              .map((item: string) => item.trim());
          }
        } else if (!Array.isArray(result.data.ingredients)) {
          result.data.ingredients = [String(result.data.ingredients)];
        }
      }

      // Ensure instructions are properly parsed before mapping
      if (result.data.instructions) {
        // Handle different instruction formats
        if (typeof result.data.instructions === 'string') {
          try {
            // Try parsing as JSON
            const parsed = JSON.parse(result.data.instructions);
            result.data.instructions = Array.isArray(parsed) ? parsed : [result.data.instructions];
          } catch (e) {
            // If parsing fails, split by common separators
            result.data.instructions = result.data.instructions
              .split(/\n|(?:\d+\.)|(?:Step \d+:)/)
              .filter((item: string) => item.trim().length > 0)
              .map((item: string) => item.trim());
          }
        } else if (!Array.isArray(result.data.instructions)) {
          result.data.instructions = [String(result.data.instructions)];
        }
      }
      
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
  try {
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
  } catch (error) {
    console.error('Error in extractRecipeFromUrl:', error);
    throw error;
  }
};

export const enhanceRecipeWithFreeModel = async (url: string) => {
  try {
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
  } catch (error) {
    console.error('Error in enhanceRecipeWithFreeModel:', error);
    throw error;
  }
};
