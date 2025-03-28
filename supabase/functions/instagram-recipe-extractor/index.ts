
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// SourceType enumeration for tracking extraction methods
enum SourceType {
  INSTAGRAM = "instagram",
  SCHEMA_RECIPE = "schema.org",
  JSON_LD = "json-ld",
  HEURISTIC = "heuristic",
  UNKNOWN = "unknown"
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Create Supabase client with the project URL and service key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    
    // Parse request body
    const { url, userId } = await req.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ 
          status: "error", 
          message: "URL is required" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    if (!userId) {
      return new Response(
        JSON.stringify({ 
          status: "error", 
          message: "User ID is required" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Determine source type based on URL pattern
    const sourceType = determineSourceType(url);
    console.log(`URL: ${url}, Source Type: ${sourceType}`);
    
    // Multi-strategy extraction based on source type
    let extractionResult = null;
    
    switch (sourceType) {
      case SourceType.INSTAGRAM:
        extractionResult = await extractInstagramRecipe(url);
        break;
      default:
        // For all other URLs, attempt generic extraction strategies
        extractionResult = await extractGenericRecipe(url);
    }
    
    if (!extractionResult || !extractionResult.isRecipe) {
      return new Response(
        JSON.stringify({ 
          status: "error", 
          message: "No recipe found on this page" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }
    
    // Insert the recipe into Supabase
    const { data: recipeData, error: recipeError } = await supabaseClient
      .from("recipes")
      .insert({
        title: extractionResult.recipe.title,
        description: extractionResult.recipe.description || "",
        image_url: extractionResult.recipe.image_url,
        source_url: url,
        user_id: userId,
        category: extractionResult.recipe.category || "Uncategorized",
        ingredients: extractionResult.recipe.ingredients,
        instructions: extractionResult.recipe.instructions,
        prep_time: extractionResult.recipe.prep_time || null,
        cook_time: extractionResult.recipe.cook_time || null,
        difficulty_level: extractionResult.recipe.difficulty || "Medium",
        cuisine: extractionResult.recipe.cuisine || null,
        meal_type: extractionResult.recipe.meal_type || null,
        tags: extractionResult.recipe.tags || []
      })
      .select()
      .single();
    
    if (recipeError) {
      console.error("Error saving recipe:", recipeError);
      throw new Error("Failed to save recipe");
    }
    
    return new Response(
      JSON.stringify({
        status: "success",
        data: recipeData,
        confidence: extractionResult.confidence,
        source: extractionResult.extractionMethod
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error processing URL:", error);
    
    return new Response(
      JSON.stringify({
        status: "error",
        message: error.message || "Failed to extract recipe"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

// Determine the source type based on URL pattern
function determineSourceType(url: string): SourceType {
  const urlLower = url.toLowerCase();
  
  if (urlLower.includes("instagram.com")) {
    return SourceType.INSTAGRAM;
  }
  
  // Add additional source type detection for common recipe sites
  const recipeWebsites = [
    { domain: "allrecipes.com", type: SourceType.SCHEMA_RECIPE },
    { domain: "foodnetwork.com", type: SourceType.SCHEMA_RECIPE },
    { domain: "epicurious.com", type: SourceType.SCHEMA_RECIPE },
    { domain: "bonappetit.com", type: SourceType.SCHEMA_RECIPE },
    { domain: "taste.com", type: SourceType.SCHEMA_RECIPE },
    { domain: "delish.com", type: SourceType.SCHEMA_RECIPE },
    { domain: "seriouseats.com", type: SourceType.SCHEMA_RECIPE },
    { domain: "cookinglight.com", type: SourceType.SCHEMA_RECIPE },
    { domain: "eatingwell.com", type: SourceType.SCHEMA_RECIPE },
    { domain: "simplyrecipes.com", type: SourceType.SCHEMA_RECIPE },
    { domain: "food52.com", type: SourceType.SCHEMA_RECIPE },
    { domain: "thekitchn.com", type: SourceType.SCHEMA_RECIPE },
    { domain: "tasty.co", type: SourceType.SCHEMA_RECIPE }
    // More popular recipe websites could be added here
  ];
  
  for (const site of recipeWebsites) {
    if (urlLower.includes(site.domain)) {
      return site.type;
    }
  }
  
  // Default to unknown/generic source type
  return SourceType.UNKNOWN;
}

// Extract recipe from Instagram post
async function extractInstagramRecipe(url: string) {
  try {
    console.log("Extracting Instagram recipe from:", url);
    
    // Extract post ID from Instagram URL
    const postIdMatch = url.match(/\/p\/([^\/\?]+)/i) || url.match(/\/reel\/([^\/\?]+)/i);
    if (!postIdMatch) {
      throw new Error("Could not extract Instagram post ID from URL");
    }
    
    const postId = postIdMatch[1];
    console.log("Instagram Post ID:", postId);
    
    // For this demonstration, we'll simulate extraction from Instagram
    // In a real implementation, you would use Instagram's API or a scraping approach
    
    // Simulated recipe data for Instagram
    // This would be replaced with actual API calls or scraping logic
    const mockRecipe = {
      title: `Instagram Recipe #${postId.substring(0, 5)}`,
      description: "Delicious recipe shared on Instagram",
      image_url: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?q=80&w=1000&auto=format&fit=crop",
      ingredients: [
        "2 cups flour",
        "1 cup sugar",
        "3 eggs",
        "1 tsp vanilla extract",
        "1/2 cup butter"
      ],
      instructions: [
        "Mix the dry ingredients in a bowl",
        "Add wet ingredients and mix until smooth",
        "Pour into a baking pan",
        "Bake at 350°F for 30 minutes"
      ],
      prep_time: 15,
      cook_time: 30,
      category: "Dessert",
      difficulty: "Medium",
      cuisine: "International",
      meal_type: "Dessert",
      tags: ["instagram", "dessert", "baking"]
    };
    
    return {
      isRecipe: true,
      recipe: mockRecipe,
      confidence: 0.7, // Medium confidence for Instagram extraction
      extractionMethod: "instagram"
    };
  } catch (error) {
    console.error("Instagram extraction error:", error);
    return { isRecipe: false };
  }
}

// Generic recipe extraction for any web URL
async function extractGenericRecipe(url: string) {
  try {
    console.log("Generic recipe extraction for:", url);
    
    // In a real implementation, you would:
    // 1. Fetch the webpage content
    // 2. Try multiple extraction methods (schema.org, JSON-LD, heuristic)
    // 3. Return the highest confidence result
    
    // For demonstration, we'll simulate a generic extraction
    const extractionMethods = [
      extractSchemaRecipe,
      extractJsonLdRecipe,
      extractHeuristicRecipe
    ];
    
    // Try each extraction method
    for (const method of extractionMethods) {
      try {
        const result = await method(url);
        if (result && result.isRecipe) {
          return result;
        }
      } catch (methodError) {
        console.log(`Extraction method failed:`, methodError);
        // Continue to next method
      }
    }
    
    // If all methods fail, return a simulated generic recipe
    // This is just for demo purposes - in production, you should return
    // { isRecipe: false } if no recipe is found
    return {
      isRecipe: true,
      recipe: {
        title: `Recipe from ${new URL(url).hostname}`,
        description: "Recipe extracted from website",
        image_url: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?q=80&w=1000&auto=format&fit=crop",
        ingredients: [
          "Ingredient 1",
          "Ingredient 2",
          "Ingredient 3",
          "Ingredient 4"
        ],
        instructions: [
          "Step 1: Prepare ingredients",
          "Step 2: Cook according to instructions",
          "Step 3: Serve and enjoy"
        ],
        prep_time: 20,
        cook_time: 40,
        category: "Main Course",
        difficulty: "Medium",
        tags: ["extracted", "website"]
      },
      confidence: 0.6, // Medium confidence for generic extraction
      extractionMethod: "generic"
    };
  } catch (error) {
    console.error("Generic extraction error:", error);
    return { isRecipe: false };
  }
}

// Schema.org Recipe extraction
async function extractSchemaRecipe(url: string) {
  // Simulated schema.org extraction for demonstration
  // In a real implementation, you would fetch the webpage and look for schema.org/Recipe markup
  
  console.log("Attempting schema.org extraction from:", url);
  
  // Simulate a 30% chance of finding schema markup
  if (Math.random() > 0.7) {
    return {
      isRecipe: true,
      recipe: {
        title: `Schema Recipe from ${new URL(url).hostname}`,
        description: "Recipe extracted from schema.org markup",
        image_url: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=1000&auto=format&fit=crop",
        ingredients: [
          "2 pounds chicken thighs",
          "1 tablespoon olive oil",
          "2 cloves garlic, minced",
          "1 teaspoon salt",
          "1/2 teaspoon black pepper",
          "1 lemon, sliced"
        ],
        instructions: [
          "Preheat oven to 375°F (190°C)",
          "Season chicken with salt and pepper",
          "Heat oil in a skillet over medium-high heat",
          "Add chicken and sear until golden brown, about 3-4 minutes per side",
          "Add garlic and lemon slices",
          "Transfer to oven and bake for 25-30 minutes until chicken is cooked through"
        ],
        prep_time: 15,
        cook_time: 35,
        category: "Main Course",
        difficulty: "Easy",
        cuisine: "Mediterranean",
        meal_type: "Dinner",
        tags: ["chicken", "easy", "mediterranean"]
      },
      confidence: 0.9, // High confidence for schema.org extraction
      extractionMethod: "schema.org"
    };
  }
  
  return { isRecipe: false };
}

// JSON-LD Recipe extraction
async function extractJsonLdRecipe(url: string) {
  // Simulated JSON-LD extraction for demonstration
  console.log("Attempting JSON-LD extraction from:", url);
  
  // Simulate a 20% chance of finding JSON-LD data
  if (Math.random() > 0.8) {
    return {
      isRecipe: true,
      recipe: {
        title: `JSON-LD Recipe from ${new URL(url).hostname}`,
        description: "Recipe extracted from JSON-LD data",
        image_url: "https://images.unsplash.com/photo-1569058242272-4b1a699ca3aa?q=80&w=1000&auto=format&fit=crop",
        ingredients: [
          "1 pound pasta",
          "2 tablespoons butter",
          "2 tablespoons flour",
          "2 cups milk",
          "2 cups shredded cheese",
          "1/2 teaspoon salt",
          "1/4 teaspoon black pepper"
        ],
        instructions: [
          "Cook pasta according to package directions",
          "Melt butter in a saucepan over medium heat",
          "Whisk in flour and cook for 1-2 minutes",
          "Gradually whisk in milk and bring to a simmer",
          "Cook until thickened, about 3-4 minutes",
          "Stir in cheese until melted",
          "Season with salt and pepper",
          "Combine with cooked pasta and serve"
        ],
        prep_time: 10,
        cook_time: 20,
        category: "Main Course",
        difficulty: "Easy",
        cuisine: "Italian",
        meal_type: "Dinner",
        tags: ["pasta", "cheese", "comfort food"]
      },
      confidence: 0.85, // High confidence for JSON-LD extraction
      extractionMethod: "json-ld"
    };
  }
  
  return { isRecipe: false };
}

// Heuristic recipe extraction
async function extractHeuristicRecipe(url: string) {
  // Simulated heuristic extraction for demonstration
  console.log("Attempting heuristic extraction from:", url);
  
  // Simulate a 50% chance of finding recipe content through heuristics
  if (Math.random() > 0.5) {
    return {
      isRecipe: true,
      recipe: {
        title: `Heuristic Recipe from ${new URL(url).hostname}`,
        description: "Recipe extracted using heuristic methods",
        image_url: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?q=80&w=1000&auto=format&fit=crop",
        ingredients: [
          "3 ripe bananas",
          "1/3 cup melted butter",
          "1 teaspoon baking soda",
          "Pinch of salt",
          "3/4 cup sugar",
          "1 large egg, beaten",
          "1 teaspoon vanilla extract",
          "1 1/2 cups all-purpose flour"
        ],
        instructions: [
          "Preheat oven to 350°F (175°C)",
          "Mash bananas in a mixing bowl",
          "Mix in melted butter",
          "Add baking soda and salt",
          "Stir in sugar, beaten egg, and vanilla extract",
          "Mix in flour",
          "Pour batter into a greased loaf pan",
          "Bake for 50-60 minutes"
        ],
        prep_time: 15,
        cook_time: 60,
        category: "Baking",
        difficulty: "Easy",
        cuisine: "American",
        meal_type: "Dessert",
        tags: ["banana", "baking", "dessert"]
      },
      confidence: 0.7, // Medium confidence for heuristic extraction
      extractionMethod: "heuristic"
    };
  }
  
  return { isRecipe: false };
}
