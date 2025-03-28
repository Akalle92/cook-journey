
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const instagramAccessToken = Deno.env.get('INSTAGRAM_ACCESS_TOKEN');
    
    if (!instagramAccessToken) {
      throw new Error('Instagram access token not configured');
    }

    // Create authenticated Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Parse request body
    const { url, userId } = await req.json();
    
    if (!url) {
      throw new Error('No URL provided');
    }

    if (!userId) {
      throw new Error('User ID is required');
    }

    console.log(`Processing URL: ${url}`);

    // Determine URL type and call appropriate extraction method
    const urlType = determineUrlType(url);
    console.log(`Detected URL type: ${urlType}`);

    let recipeData;
    
    if (urlType === 'instagram') {
      // Extract Instagram post ID and fetch data
      const postId = extractInstagramPostId(url);
      if (!postId) {
        throw new Error('Invalid Instagram URL. Could not extract post ID.');
      }
      console.log(`Extracting recipe from Instagram post ID: ${postId}`);
      const mediaData = await fetchInstagramMedia(postId, instagramAccessToken);
      recipeData = parseRecipeFromCaption(mediaData);
    } else if (urlType === 'recipe-website') {
      // For recipe websites, use structured data extraction
      recipeData = await extractRecipeWebsiteData(url);
    } else {
      // For general websites, use generic content extraction
      recipeData = await extractGeneralWebsiteData(url);
    }
    
    // Store the recipe in Supabase
    const { data: savedRecipe, error } = await supabase
      .from('recipes')
      .insert({
        ...recipeData,
        user_id: userId,
        source_url: url
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error saving recipe to database:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    // Return the saved recipe
    return new Response(
      JSON.stringify({
        status: 'success',
        data: savedRecipe
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in recipe-extractor:', error);
    
    return new Response(
      JSON.stringify({
        status: 'error',
        message: error.message || 'An unexpected error occurred'
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Function to determine the type of URL
function determineUrlType(url: string): 'instagram' | 'recipe-website' | 'general-website' {
  // Check if it's an Instagram URL
  if (/instagram\.com\/(p|reel|stories)\/[^\/\?]+/i.test(url)) {
    return 'instagram';
  }
  
  // Check if it's a known recipe website
  const recipeWebsites = [
    /allrecipes\.com/i,
    /foodnetwork\.com/i,
    /epicurious\.com/i,
    /bonappetit\.com/i,
    /taste\.com/i,
    /delish\.com/i,
    /seriouseats\.com/i,
    /cookinglight\.com/i,
    /eatingwell\.com/i,
    /simplyrecipes\.com/i,
    /food52\.com/i,
    /thekitchn\.com/i,
    /tasty\.co/i
  ];
  
  for (const pattern of recipeWebsites) {
    if (pattern.test(url)) {
      return 'recipe-website';
    }
  }
  
  // Default to general website
  return 'general-website';
}

// Function to extract Instagram post ID from URL
function extractInstagramPostId(url: string): string | null {
  // Handle various Instagram URL formats
  const patterns = [
    /instagram\.com\/p\/([^\/\?]+)/i,      // Regular post: instagram.com/p/ABC123
    /instagram\.com\/reel\/([^\/\?]+)/i,   // Reels: instagram.com/reel/ABC123
    /instagram\.com\/stories\/[^\/]+\/([^\/\?]+)/i  // Stories: instagram.com/stories/username/ABC123
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

// Function to fetch Instagram media data using Graph API
async function fetchInstagramMedia(mediaId: string, accessToken: string) {
  try {
    // In a real implementation, you would use the Instagram Graph API
    // For demonstration purposes, we're returning mock data
    console.log(`[MOCK] Fetching Instagram media with ID: ${mediaId}`);
    
    // Simulate API response
    return {
      id: mediaId,
      caption: `Delicious Avocado Toast recipe! Perfect for breakfast.\n\nIngredients:\n- 2 ripe avocados\n- 4 slices sourdough bread\n- 2 eggs\n- Fresh lime juice\n- Red pepper flakes\n- Salt and pepper to taste\n- Olive oil\n\nInstructions:\n1. Toast the bread until golden.\n2. Mash avocados with lime juice, salt and pepper.\n3. Spread avocado on toast.\n4. Fry eggs sunny side up.\n5. Place eggs on toast and serve.\n\n#avocadotoast #breakfast #healthyfood`,
      media_url: "https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=1000&auto=format&fit=crop",
      media_type: "IMAGE",
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching Instagram media:', error);
    throw error;
  }
}

// Function to parse recipe details from Instagram caption
function parseRecipeFromCaption(mediaData: any) {
  const { caption, media_url } = mediaData;
  
  // Extract ingredients
  const ingredients = [];
  const ingredientsMatch = caption.match(/ingredients:(.+?)instructions:/is);
  if (ingredientsMatch && ingredientsMatch[1]) {
    const ingredientsText = ingredientsMatch[1].trim();
    ingredientsText.split('\n').forEach(line => {
      const ingredient = line.replace(/^-\s*/, '').trim();
      if (ingredient) ingredients.push(ingredient);
    });
  }
  
  // Extract instructions
  const instructions = [];
  const instructionsMatch = caption.match(/instructions:(.+?)(?:#|$)/is);
  if (instructionsMatch && instructionsMatch[1]) {
    const instructionsText = instructionsMatch[1].trim();
    instructionsText.split('\n').forEach(line => {
      const instruction = line.replace(/^\d+\.\s*/, '').trim();
      if (instruction) instructions.push(instruction);
    });
  }
  
  // Generate title
  const titleMatch = caption.match(/^(.+?)(?:\n|$)/);
  const title = titleMatch ? titleMatch[1].trim() : 'Instagram Recipe';
  
  // Determine category based on hashtags or caption keywords
  let category = 'Other';
  const categoryKeywords = {
    'Breakfast': ['breakfast', 'morning', 'brunch', 'toast', 'eggs'],
    'Lunch': ['lunch', 'sandwich', 'salad', 'wrap'],
    'Dinner': ['dinner', 'supper', 'pasta', 'steak'],
    'Dessert': ['dessert', 'cake', 'cookie', 'sweet'],
    'Appetizer': ['appetizer', 'starter', 'snack', 'dip'],
    'Drink': ['drink', 'cocktail', 'smoothie', 'juice', 'beverage']
  };
  
  for (const [cat, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => caption.toLowerCase().includes(keyword))) {
      category = cat;
      break;
    }
  }
  
  // Extract hashtags for tags
  const tags = [];
  const hashtagMatches = caption.match(/#\w+/g);
  if (hashtagMatches) {
    hashtagMatches.forEach(tag => tags.push(tag.substring(1)));
  }
  
  // Estimate prep and cook time based on recipe complexity
  const prepTime = Math.max(5, Math.min(30, ingredients.length * 2));
  const cookTime = Math.max(10, Math.min(60, instructions.length * 5));
  
  return {
    title,
    description: caption.split('\n')[0],
    category,
    image_url: media_url,
    prep_time: prepTime,
    cook_time: cookTime,
    ingredients: JSON.stringify(ingredients),
    instructions: JSON.stringify(instructions),
    tags,
    difficulty_level: determineDifficulty(prepTime, cookTime),
    servings: 2, // Default value
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

// Function to extract recipe data from recipe websites
async function extractRecipeWebsiteData(url: string) {
  // In a real implementation, you would:
  // 1. Fetch the website HTML
  // 2. Look for JSON-LD or microdata with schema.org/Recipe
  // 3. Parse the structured data
  
  console.log(`[MOCK] Extracting recipe data from website: ${url}`);
  
  // For demonstration, return mock recipe data
  return {
    title: "Chocolate Chip Cookies",
    description: "The best chocolate chip cookies you'll ever taste!",
    category: "Dessert",
    image_url: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=1000&auto=format&fit=crop",
    prep_time: 15,
    cook_time: 10,
    ingredients: JSON.stringify([
      "2 1/4 cups all-purpose flour",
      "1 teaspoon baking soda",
      "1 teaspoon salt",
      "1 cup unsalted butter, softened",
      "3/4 cup granulated sugar",
      "3/4 cup packed brown sugar",
      "2 large eggs",
      "2 teaspoons vanilla extract",
      "2 cups semi-sweet chocolate chips"
    ]),
    instructions: JSON.stringify([
      "Preheat oven to 375°F (190°C).",
      "Combine flour, baking soda, and salt in a small bowl.",
      "Beat butter, granulated sugar, and brown sugar in a large bowl until creamy.",
      "Add eggs one at a time, beating well after each addition. Beat in vanilla.",
      "Gradually beat in flour mixture. Stir in chocolate chips.",
      "Drop by rounded tablespoon onto ungreased baking sheets.",
      "Bake for 9 to 11 minutes or until golden brown.",
      "Cool on baking sheets for 2 minutes; remove to wire racks to cool completely."
    ]),
    tags: ["cookies", "dessert", "chocolate", "baking"],
    difficulty_level: "Easy",
    servings: 24,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

// Function to extract recipe data from general websites
async function extractGeneralWebsiteData(url: string) {
  // In a real implementation, you would:
  // 1. Fetch the website HTML
  // 2. Use content extraction algorithms to identify recipe-like content
  // 3. Apply heuristics to identify ingredients, instructions, etc.
  
  console.log(`[MOCK] Extracting general content from website: ${url}`);
  
  // For demonstration, return mock recipe data
  return {
    title: "Extracted Recipe",
    description: "Recipe extracted from website content",
    category: "Main Course",
    image_url: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?q=80&w=1000&auto=format&fit=crop",
    prep_time: 20,
    cook_time: 30,
    ingredients: JSON.stringify([
      "Ingredient 1",
      "Ingredient 2",
      "Ingredient 3",
      "Ingredient 4",
      "Ingredient 5"
    ]),
    instructions: JSON.stringify([
      "Step 1 of the recipe",
      "Step 2 of the recipe",
      "Step 3 of the recipe",
      "Step 4 of the recipe"
    ]),
    tags: ["extracted", "recipe"],
    difficulty_level: "Medium",
    servings: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

// Helper function to determine difficulty based on prep and cook time
function determineDifficulty(prepTime: number, cookTime: number): 'Easy' | 'Medium' | 'Hard' {
  const totalTime = prepTime + cookTime;
  
  if (totalTime < 30) return 'Easy';
  if (totalTime < 60) return 'Medium';
  return 'Hard';
}
