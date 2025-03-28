
import { Recipe } from '@/components/RecipeCard';
import { supabase } from '@/integrations/supabase/client';

// Convert Supabase recipe data to our Recipe type
const mapToRecipe = (item: any): Recipe => {
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

  // Log the parsed instructions to debug
  console.log('Parsed instructions for recipe:', item.title, instructions);

  return {
    id: item.id,
    title: item.title || 'Untitled Recipe',
    image: extractFirstImageUrl(item.image_url) || 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?q=80&w=1000&auto=format&fit=crop',
    category: extractFirstValue(item.category) || 'Uncategorized',
    prepTime: item.prep_time ? `${item.prep_time} min` : 'N/A',
    difficulty: determineDifficulty(item.prep_time, item.cook_time),
    ingredients: ingredients,
    instructions: instructions
  };
};

// Helper function to extract the first image URL from a possible JSON array
const extractFirstImageUrl = (imageUrl: any): string | undefined => {
  if (!imageUrl) return undefined;
  
  try {
    // If it's already a string, return it
    if (typeof imageUrl === 'string') return imageUrl;
    
    // If it's a JSON string, parse it
    if (typeof imageUrl === 'string' && (imageUrl.startsWith('[') || imageUrl.startsWith('{'))) {
      const parsed = JSON.parse(imageUrl);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed[0];
      }
      return parsed.url || parsed.src || undefined;
    }
    
    // If it's already an array, return the first item
    if (Array.isArray(imageUrl) && imageUrl.length > 0) {
      return imageUrl[0];
    }
  } catch (error) {
    console.error('Error parsing image URL:', error);
  }
  
  return undefined;
};

// Helper function to extract the first value from a possible JSON array or string
const extractFirstValue = (value: any): string | undefined => {
  if (!value) return undefined;
  
  try {
    // If it's already a string, return it
    if (typeof value === 'string') {
      if (value.startsWith('[') || value.startsWith('{')) {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed[0];
        }
        return parsed.toString();
      }
      return value;
    }
    
    // If it's already an array, return the first item
    if (Array.isArray(value) && value.length > 0) {
      return value[0];
    }
  } catch (error) {
    console.error('Error parsing value:', error);
  }
  
  return String(value);
};

// Helper function to determine difficulty based on prep and cook time
const determineDifficulty = (prepTime?: number, cookTime?: number): 'Easy' | 'Medium' | 'Hard' => {
  const totalTime = (prepTime || 0) + (cookTime || 0);
  
  if (totalTime < 30) return 'Easy';
  if (totalTime < 60) return 'Medium';
  return 'Hard';
};

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

// Extract recipe from URL using our universal recipe extractor edge function
export const extractRecipeFromUrl = async (url: string): Promise<Recipe> => {
  console.log(`Extracting recipe from URL: ${url}`);
  
  try {
    // Get the current user's ID to associate with the recipe
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('You must be logged in to extract recipes');
    }
    
    // Clean the URL before sending
    let cleanUrl = url.trim();
    
    // Call our Supabase Edge Function to extract the recipe
    const { data, error } = await supabase.functions.invoke('instagram-recipe-extractor', {
      body: {
        url: cleanUrl,
        userId: user.id
      }
    });
    
    if (error) {
      console.error('Error calling recipe extractor:', error);
      throw new Error(error.message || 'Failed to extract recipe');
    }
    
    if (!data || data.status === 'error') {
      console.error('Extraction failed:', data);
      throw new Error(data?.message || 'Failed to extract recipe from URL');
    }
    
    console.log('Extraction successful - extracted data:', data);
    
    // Return the extracted recipe
    return mapToRecipe(data.data);
  } catch (error: any) {
    console.error('Error in extractRecipeFromUrl:', error);
    throw new Error(error.message || 'Failed to extract recipe. Please try again.');
  }
};

// Mock data for recipes (fallback if database is empty)
const mockRecipes: Recipe[] = [
  {
    id: '1',
    title: 'Chocolate Raspberry Cheesecake',
    image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=1000&auto=format&fit=crop',
    category: 'Dessert',
    prepTime: '45 min',
    difficulty: 'Medium',
    ingredients: [
      '250g digestive biscuits, crushed',
      '100g unsalted butter, melted',
      '500g cream cheese',
      '150g sugar',
      '3 large eggs',
      '100g dark chocolate, melted',
      '150g fresh raspberries',
      '1 tsp vanilla extract'
    ],
    instructions: [
      'Preheat oven to 160°C (320°F).',
      'Mix crushed biscuits with melted butter and press into the base of a springform pan.',
      'Beat cream cheese and sugar until smooth, about 2 minutes.',
      'Add eggs one at a time, beating well after each addition.',
      'Stir in vanilla extract.',
      'Pour half the mixture over the biscuit base, then drop spoonfuls of melted chocolate and swirl with a knife.',
      'Add the remaining mixture and place raspberries on top, pressing them slightly into the batter.',
      'Bake for 45-50 minutes until set but still slightly wobbly in the center.',
      'Allow to cool completely before refrigerating for at least 4 hours or overnight.'
    ]
  },
  {
    id: '2',
    title: 'Spicy Thai Basil Chicken (Pad Krapow Gai)',
    image: 'https://images.unsplash.com/photo-1569058242272-4b1a699ca3aa?q=80&w=1000&auto=format&fit=crop',
    category: 'Main Course',
    prepTime: '20 min',
    difficulty: 'Easy',
    ingredients: [
      '500g chicken mince',
      '4 cloves garlic, minced',
      '4-6 Thai chilies, minced',
      '2 tbsp vegetable oil',
      '2 tbsp oyster sauce',
      '1 tbsp fish sauce',
      '1 tbsp soy sauce',
      '1 tsp sugar',
      '1 cup Thai basil leaves',
      '2 eggs (optional, for topping)',
      'Steamed jasmine rice for serving'
    ],
    instructions: [
      'Heat oil in a wok or large frying pan over high heat.',
      'Add garlic and chilies and stir-fry for 30 seconds until fragrant.',
      'Add chicken mince and stir-fry for 3-4 minutes, breaking up any lumps.',
      'Add oyster sauce, fish sauce, soy sauce, and sugar. Stir well to combine.',
      'Cook for another 2 minutes until chicken is cooked through.',
      'Turn off the heat and stir in the Thai basil leaves until wilted.',
      'If using eggs, fry separately in a non-stick pan until edges are crispy but yolk is still runny.',
      'Serve the chicken over steamed rice, topped with a fried egg if desired.'
    ]
  },
  {
    id: '3',
    title: 'Creamy Mushroom Risotto',
    image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?q=80&w=1000&auto=format&fit=crop',
    category: 'Main Course',
    prepTime: '35 min',
    difficulty: 'Medium',
    ingredients: [
      '1.5L vegetable stock',
      '2 tbsp olive oil',
      '1 onion, finely chopped',
      '3 garlic cloves, minced',
      '400g mixed mushrooms, sliced',
      '320g arborio rice',
      '100ml dry white wine',
      '50g butter',
      '50g parmesan cheese, grated',
      'Fresh thyme leaves',
      'Salt and pepper to taste'
    ],
    instructions: [
      'Heat the stock in a saucepan and keep at a gentle simmer.',
      'In a large, heavy-based pan, heat olive oil and sauté onion until translucent, about 4 minutes.',
      'Add garlic and cook for 1 minute, then add mushrooms and cook for 5 minutes until they release their moisture.',
      'Add rice and stir for 2 minutes until it becomes translucent around the edges.',
      'Pour in the wine and stir until completely absorbed.',
      'Add a ladleful of hot stock and stir until absorbed. Continue adding stock one ladleful at a time, stirring constantly.',
      'After about a total of 20-25 minutes, when the rice is creamy but still has a slight bite, remove from heat.',
      'Stir in butter and parmesan cheese. Season with salt and pepper.',
      'Garnish with fresh thyme leaves and serve immediately.'
    ]
  }
];
