
import { Recipe } from '@/components/RecipeCard';
import { extractFirstImageUrl } from './imageUtils';
import { 
  extractFirstValue, 
  determineDifficulty, 
  parseTimeValue,
  normalizeIngredient,
  normalizeInstruction,
  decodeHtmlEntities
} from './recipeDataUtils';

// Convert Supabase recipe data to our Recipe type with enhanced mapping
export const mapToRecipe = (item: any): Recipe => {
  console.log('Mapping raw recipe data:', JSON.stringify(item));
  
  // Process ingredients with improved parsing and normalization
  let ingredients = [];
  try {
    if (Array.isArray(item.ingredients)) {
      ingredients = item.ingredients
        .map(normalizeIngredient)
        .filter(Boolean); 
    } else if (typeof item.ingredients === 'string') {
      try {
        const parsed = JSON.parse(item.ingredients);
        ingredients = Array.isArray(parsed) 
          ? parsed.map(normalizeIngredient).filter(Boolean)
          : [normalizeIngredient(item.ingredients)].filter(Boolean);
      } catch {
        // If not valid JSON, try splitting by common separators
        const splitIngredients = item.ingredients
          .split(/\n|•|\*|\d+\.|,/)
          .filter((ing: string) => ing && ing.trim().length > 0);
          
        ingredients = splitIngredients.length > 0
          ? splitIngredients.map(normalizeIngredient).filter(Boolean)
          : [normalizeIngredient(item.ingredients)].filter(Boolean);
      }
    } else if (typeof item.ingredients === 'object' && item.ingredients !== null) {
      // Try to extract from structured object
      const keys = Object.keys(item.ingredients);
      ingredients = keys.length > 0
        ? keys.map(key => normalizeIngredient(item.ingredients[key])).filter(Boolean)
        : [];
    }
  } catch (error) {
    console.error('Error processing ingredients:', error);
    ingredients = [];
  }

  // Log the processed ingredients
  console.log('Processed ingredients:', ingredients);

  // Process instructions with improved parsing and normalization
  let instructions = [];
  try {
    if (Array.isArray(item.instructions)) {
      instructions = item.instructions
        .map(normalizeInstruction)
        .filter(Boolean);
    } else if (typeof item.instructions === 'string') {
      try {
        const parsed = JSON.parse(item.instructions);
        instructions = Array.isArray(parsed) 
          ? parsed.map(normalizeInstruction).filter(Boolean) 
          : [normalizeInstruction(item.instructions)].filter(Boolean);
      } catch {
        // If not valid JSON, try splitting by common separators
        const splitInstructions = item.instructions
          .split(/\n|(?:\d+\.)|(?:Step \d+:)/)
          .filter((instr: string) => instr && instr.trim().length > 0);
          
        instructions = splitInstructions.length > 0
          ? splitInstructions.map(normalizeInstruction).filter(Boolean)
          : [normalizeInstruction(item.instructions)].filter(Boolean);
      }
    } else if (typeof item.instructions === 'object' && item.instructions !== null) {
      // Try to extract from structured object
      const keys = Object.keys(item.instructions);
      instructions = keys.length > 0
        ? keys.map(key => normalizeInstruction(item.instructions[key])).filter(Boolean)
        : [];
    }
  } catch (error) {
    console.error('Error processing instructions:', error);
    instructions = [];
  }

  // Log the processed instructions
  console.log('Processed instructions:', instructions);

  // Format the category with proper capitalization and validation
  let category = extractFirstValue(item.category) || extractFirstValue(item.cuisine) || 'Uncategorized';
  if (category) {
    category = decodeHtmlEntities(category);
    category = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
  }

  // Format prep time with improved parsing
  let prepTime = parseTimeValue(item.prep_time || item.prepTime || item.cookTime || item.cook_time);
  
  // Determine difficulty with our enhanced algorithm
  const difficulty = determineDifficulty(
    item.prep_time || item.prepTime,
    ingredients,
    instructions,
    item.difficulty || item.difficulty_level
  );

  // Extract confidence score if available
  let confidence = null;
  if (item.confidence) {
    confidence = parseFloat(item.confidence);
  } else if (item.extractionResults && Array.isArray(item.extractionResults)) {
    const successfulMethod = item.extractionResults.find(method => method.success && method.confidence);
    if (successfulMethod) {
      confidence = successfulMethod.confidence;
    }
  }

  let title = item.title || 'Untitled Recipe';
  title = decodeHtmlEntities(title);

  // Construct final recipe object
  const finalRecipe: Recipe = {
    id: item.id,
    title: title,
    image: extractFirstImageUrl(item.image_url || item.image) || 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?q=80&w=1000&auto=format&fit=crop',
    category: category,
    prepTime: prepTime,
    difficulty: difficulty as 'Easy' | 'Medium' | 'Hard',
    ingredients: ingredients,
    instructions: instructions,
    confidence: confidence,
    method: item.method || (item.extractionResults && item.extractionResults[0]?.method),
    extractionResults: item.extractionResults || undefined,
    debugInfo: item.debugInfo || undefined,
    data: item.data || undefined
  };

  // Log the final recipe object
  console.log('Final mapped recipe:', finalRecipe);
  
  return finalRecipe;
};
