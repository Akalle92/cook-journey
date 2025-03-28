
import { Recipe } from '@/components/RecipeCard';
import { supabase } from '@/integrations/supabase/client';

// Convert Supabase recipe data to our Recipe type
const mapToRecipe = (item: any): Recipe => {
  return {
    id: item.id,
    title: item.title,
    image: item.image_url || 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?q=80&w=1000&auto=format&fit=crop',
    category: item.category || 'Uncategorized',
    prepTime: item.prep_time ? `${item.prep_time} min` : 'N/A',
    difficulty: determineDifficulty(item.prep_time, item.cook_time),
    ingredients: item.ingredients || [],
    instructions: item.instructions || []
  };
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
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching recipes:', error);
      throw error;
    }
    
    // If no data yet, return mock recipes (for demo purposes)
    if (!data || data.length === 0) {
      return mockRecipes;
    }
    
    return data.map(mapToRecipe);
  } catch (error) {
    console.error('Error in fetchRecipes:', error);
    return mockRecipes;
  }
};

// Extract recipe from Instagram URL and save to Supabase
export const extractRecipeFromInstagram = async (url: string): Promise<Recipe> => {
  console.log(`Extracting recipe from URL: ${url}`);
  
  // This is still a mock function - in a real app, this would call an API
  // We'll simulate parsing Instagram content and saving to Supabase
  try {
    // Generate a mock recipe based on the URL
    const newRecipe = generateMockRecipe(url);
    
    // Save the recipe to Supabase
    const { data, error } = await supabase
      .from('recipes')
      .insert({
        title: newRecipe.title,
        description: 'Extracted from Instagram',
        image_url: newRecipe.image,
        category: newRecipe.category,
        prep_time: parseInt(newRecipe.prepTime),
        ingredients: newRecipe.ingredients,
        instructions: newRecipe.instructions,
        source_url: url,
        tags: ['instagram', 'extracted']
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error saving recipe to Supabase:', error);
      throw error;
    }
    
    return mapToRecipe(data);
  } catch (error) {
    console.error('Error in extractRecipeFromInstagram:', error);
    // Fall back to returning a mock recipe if there's an error
    return generateMockRecipe(url);
  }
};

// Helper function to generate a mock recipe for demonstration
const generateMockRecipe = (url: string): Recipe => {
  return {
    id: `ig-${Date.now()}`,
    title: 'Instagram Extracted Recipe',
    image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=1000&auto=format&fit=crop',
    category: 'Breakfast',
    prepTime: '25 min',
    difficulty: 'Easy',
    ingredients: [
      '2 ripe avocados',
      '4 slices sourdough bread',
      '2 eggs',
      'Fresh lime juice',
      'Red pepper flakes',
      'Salt and pepper to taste',
      'Olive oil'
    ],
    instructions: [
      'Toast the sourdough bread until golden and crispy.',
      'Mash the avocados in a bowl with lime juice, salt and pepper.',
      'Spread the avocado mixture on the toast.',
      'Heat olive oil in a pan and fry the eggs sunny side up for about 3 minutes.',
      'Place the fried eggs on top of the avocado toast.',
      'Sprinkle with red pepper flakes and serve immediately.'
    ]
  };
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
