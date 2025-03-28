
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Constants for Instagram API
const INSTAGRAM_API_URL = "https://graph.instagram.com/v13.0";

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
      throw new Error('No Instagram URL provided');
    }

    if (!userId) {
      throw new Error('User ID is required');
    }

    // Extract the Instagram post ID
    const postId = extractInstagramPostId(url);
    if (!postId) {
      throw new Error('Invalid Instagram URL. Could not extract post ID.');
    }

    console.log(`Extracting recipe from Instagram post ID: ${postId}`);

    // Fetch media data from Instagram Graph API
    const mediaData = await fetchInstagramMedia(postId, instagramAccessToken);
    
    if (!mediaData) {
      throw new Error('Failed to fetch Instagram post data');
    }

    // Parse caption to extract recipe details
    const recipe = parseRecipeFromCaption(mediaData);
    
    // Store the recipe in Supabase
    const { data: savedRecipe, error } = await supabase
      .from('recipes')
      .insert({
        ...recipe,
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
    console.error('Error in instagram-recipe-extractor:', error);
    
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
    // For example: https://graph.instagram.com/v13.0/{media-id}?fields=caption,media_url&access_token={access-token}
    
    // For demonstration purposes, we're returning mock data
    // In production, you'd replace this with a real API call
    console.log(`[MOCK] Fetching Instagram media with ID: ${mediaId}`);
    
    // Simulate API response
    return {
      id: mediaId,
      caption: `Delicious Avocado Toast recipe! Perfect for breakfast.\n\nIngredients:\n- 2 ripe avocados\n- 4 slices sourdough bread\n- 2 eggs\n- Fresh lime juice\n- Red pepper flakes\n- Salt and pepper to taste\n- Olive oil\n\nInstructions:\n1. Toast the bread until golden.\n2. Mash avocados with lime juice, salt and pepper.\n3. Spread avocado on toast.\n4. Fry eggs sunny side up.\n5. Place eggs on toast and serve.\n\n#avocadotoast #breakfast #healthyfood`,
      media_url: "https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=1000&auto=format&fit=crop",
      media_type: "IMAGE",
      timestamp: new Date().toISOString()
    };
    
    // In a real implementation, you would make an actual HTTP request:
    /*
    const response = await fetch(`${INSTAGRAM_API_URL}/${mediaId}?fields=caption,media_url,media_type,timestamp&access_token=${accessToken}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Instagram API error: ${errorData.error?.message || response.statusText}`);
    }
    
    return await response.json();
    */
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

// Helper function to determine difficulty based on prep and cook time
function determineDifficulty(prepTime: number, cookTime: number): 'Easy' | 'Medium' | 'Hard' {
  const totalTime = prepTime + cookTime;
  
  if (totalTime < 30) return 'Easy';
  if (totalTime < 60) return 'Medium';
  return 'Hard';
}
