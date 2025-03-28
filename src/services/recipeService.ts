
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

// Parse Instagram URL to extract post ID
const extractInstagramPostId = (url: string): string | null => {
  // Handle various Instagram URL formats
  const patterns = [
    /instagram.com\/p\/([^\/\?]+)/i,      // Regular post: instagram.com/p/ABC123
    /instagram.com\/reel\/([^\/\?]+)/i,   // Reels: instagram.com/reel/ABC123
    /instagram.com\/stories\/[^\/]+\/([^\/\?]+)/i  // Stories: instagram.com/stories/username/ABC123
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
};

// Generate a recipe title from the instagram post content
const generateRecipeTitle = (content: string): string => {
  // First try to extract a title from common patterns
  const titlePatterns = [
    /recipe for ([^\.]+)/i,
    /how to make ([^\.]+)/i,
    /homemade ([^\.]+)/i,
    /([^\.]{3,40}) recipe/i,
  ];
  
  for (const pattern of titlePatterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      // Capitalize first letter of each word
      return match[1].split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }
  }
  
  // If no title found, use the first 5-8 words
  const words = content.split(' ');
  const titleWords = words.slice(0, Math.min(words.length, 6));
  return titleWords.join(' ') + (titleWords.length < words.length ? '...' : '');
};

// Extract recipe from Instagram URL and save to Supabase
export const extractRecipeFromInstagram = async (url: string): Promise<Recipe> => {
  console.log(`Extracting recipe from URL: ${url}`);
  
  try {
    // Extract the Instagram post ID
    const postId = extractInstagramPostId(url);
    if (!postId) {
      throw new Error('Invalid Instagram URL. Please provide a valid Instagram post URL.');
    }
    
    // In a real app, we would call an API to fetch the Instagram post data
    // For now, we'll simulate that by generating a recipe based on the post ID
    const mockInstagramData = {
      caption: `Delicious Avocado Toast recipe for breakfast! Perfect for a quick, healthy start to your day.\n\nIngredients:\n- 2 ripe avocados\n- 4 slices sourdough bread\n- 2 eggs\n- Fresh lime juice\n- Red pepper flakes\n- Salt and pepper to taste\n- Olive oil\n\nInstructions:\n1. Toast the sourdough bread until golden and crispy.\n2. Mash the avocados in a bowl with lime juice, salt and pepper.\n3. Spread the avocado mixture on the toast.\n4. Heat olive oil in a pan and fry the eggs sunny side up for about 3 minutes.\n5. Place the fried eggs on top of the avocado toast.\n6. Sprinkle with red pepper flakes and serve immediately.\n\n#avocadotoast #breakfast #healthyfood #quickmeals`,
      image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=1000&auto=format&fit=crop'
    };
    
    // Parse ingredients and instructions from the caption
    const ingredients: string[] = [];
    const instructions: string[] = [];
    
    // Extract ingredients
    const ingredientsMatch = mockInstagramData.caption.match(/ingredients:(.+?)instructions:/is);
    if (ingredientsMatch && ingredientsMatch[1]) {
      const ingredientsText = ingredientsMatch[1].trim();
      ingredientsText.split('\n').forEach(line => {
        const ingredient = line.replace(/^-\s*/, '').trim();
        if (ingredient) ingredients.push(ingredient);
      });
    }
    
    // Extract instructions
    const instructionsMatch = mockInstagramData.caption.match(/instructions:(.+?)(?:#|$)/is);
    if (instructionsMatch && instructionsMatch[1]) {
      const instructionsText = instructionsMatch[1].trim();
      instructionsText.split('\n').forEach(line => {
        const instruction = line.replace(/^\d+\.\s*/, '').trim();
        if (instruction) instructions.push(instruction);
      });
    }
    
    // Generate a title from the caption
    const title = generateRecipeTitle(mockInstagramData.caption);
    
    // Determine a category
    let category = 'Other';
    const categoryKeywords = {
      'Breakfast': ['breakfast', 'morning', 'brunch', 'toast', 'eggs', 'pancake', 'waffle'],
      'Lunch': ['lunch', 'sandwich', 'salad', 'wrap'],
      'Dinner': ['dinner', 'supper', 'roast', 'steak', 'pasta'],
      'Dessert': ['dessert', 'cake', 'pie', 'cookie', 'sweet', 'chocolate', 'ice cream'],
      'Appetizer': ['appetizer', 'starter', 'snack', 'dip', 'finger food'],
      'Drink': ['drink', 'cocktail', 'smoothie', 'juice', 'beverage']
    };
    
    for (const [cat, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => mockInstagramData.caption.toLowerCase().includes(keyword))) {
        category = cat;
        break;
      }
    }
    
    // Estimate prep time (for demonstration purposes)
    const prepTime = Math.max(5, Math.min(30, instructions.length * 5));
    
    // Create a new recipe object
    const newRecipe = {
      title,
      description: mockInstagramData.caption.split('\n')[0],
      image_url: mockInstagramData.image,
      category,
      prep_time: prepTime,
      ingredients,
      instructions,
      source_url: url,
      tags: mockInstagramData.caption.match(/#\w+/g)?.map(tag => tag.slice(1)) || []
    };
    
    // Save the recipe to Supabase
    const { data, error } = await supabase
      .from('recipes')
      .insert(newRecipe)
      .select()
      .single();
    
    if (error) {
      console.error('Error saving recipe to Supabase:', error);
      throw error;
    }
    
    return mapToRecipe(data);
  } catch (error: any) {
    console.error('Error in extractRecipeFromInstagram:', error);
    throw new Error(error.message || 'Failed to extract recipe from Instagram. Please try again.');
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

