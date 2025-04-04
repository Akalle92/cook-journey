import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { load } from "https://esm.sh/cheerio@1.0.0-rc.12";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Debug mode flag - can be toggled via query parameter
let DEBUG_MODE = false;

// Handle CORS preflight requests
function handleCors(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
    });
  }
}

// Helper function for consistent logging
function logDebug(message: string, data?: any) {
  if (DEBUG_MODE) {
    if (data) {
      console.log(`DEBUG: ${message}`, data);
    } else {
      console.log(`DEBUG: ${message}`);
    }
  }
}

// Serve HTTP requests
serve(async (req) => {
  // Handle CORS if needed
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;
  
  try {
    // Create Supabase client with the project URL and service key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "" // Use service role key for unrestricted access
    );
    
    // Parse URL to check for debug parameter
    const url = new URL(req.url);
    DEBUG_MODE = url.searchParams.get('debug') === 'true';
    
    // Parse request body
    let requestData;
    try {
      requestData = await req.json();
      logDebug("Request data received:", requestData);
    } catch (error) {
      console.error("Error parsing request:", error);
      return new Response(
        JSON.stringify({
          status: "error",
          message: "Invalid request format",
          error: {
            name: error.name,
            message: error.message,
            stack: DEBUG_MODE ? error.stack : undefined
          }
        }),
        {
          status: 400,
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          },
        }
      );
    }
    
    const { url: targetUrl, userId } = requestData;
    
    if (!targetUrl) {
      return new Response(
        JSON.stringify({
          status: "error",
          message: "URL is required",
          details: "Please provide a valid URL to extract recipe from"
        }),
        {
          status: 400,
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          },
        }
      );
    }
    
    if (!userId) {
      return new Response(
        JSON.stringify({
          status: "error",
          message: "User ID is required",
          details: "Authentication is required to save recipes"
        }),
        {
          status: 400,
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          },
        }
      );
    }

    logDebug(`Starting extraction for URL: ${targetUrl}`);
    
    // Determine the type of content source
    const sourceType = determineSourceType(targetUrl);
    logDebug(`URL: ${targetUrl}, Source Type: ${sourceType}`);
    
    // Prepare for extraction results gathering
    let extractionResults = [];
    
    // Extract recipe data based on source type
    let recipeData = null;
    
    // Generic recipe extraction (supports multiple strategies)
    logDebug(`Generic recipe extraction for: ${targetUrl}`);
    
    // Strategy 1: Schema.org structured data
    logDebug(`Attempting schema.org extraction from: ${targetUrl}`);
    try {
      const schemaResult = await extractSchemaRecipe(targetUrl);
      extractionResults.push({
        method: "schema.org",
        success: schemaResult.isRecipe,
        confidence: schemaResult.confidence || 0,
        data: DEBUG_MODE ? schemaResult : undefined
      });
      
      if (schemaResult.isRecipe) {
        recipeData = schemaResult;
      }
    } catch (error) {
      console.error("Error in schema.org extraction:", error);
      extractionResults.push({
        method: "schema.org",
        success: false,
        error: {
          name: error.name,
          message: error.message,
          stack: DEBUG_MODE ? error.stack : undefined
        }
      });
    }
    
    // Strategy 2: JSON-LD extraction
    if (!recipeData || !recipeData.isRecipe) {
      logDebug(`Attempting JSON-LD extraction from: ${targetUrl}`);
      try {
        const jsonLdResult = await extractJsonLdRecipe(targetUrl);
        extractionResults.push({
          method: "json-ld",
          success: jsonLdResult.isRecipe,
          confidence: jsonLdResult.confidence || 0,
          data: DEBUG_MODE ? jsonLdResult : undefined
        });
        
        if (jsonLdResult.isRecipe) {
          recipeData = jsonLdResult;
        }
      } catch (error) {
        console.error("Error in JSON-LD extraction:", error);
        extractionResults.push({
          method: "json-ld",
          success: false,
          error: {
            name: error.name,
            message: error.message,
            stack: DEBUG_MODE ? error.stack : undefined
          }
        });
      }
    }
    
    // Strategy 3: Heuristic extraction for general websites
    if (!recipeData || !recipeData.isRecipe) {
      logDebug(`Attempting heuristic extraction from: ${targetUrl}`);
      try {
        const heuristicResult = await extractHeuristicRecipe(targetUrl);
        extractionResults.push({
          method: "heuristic",
          success: heuristicResult.isRecipe,
          confidence: heuristicResult.confidence || 0,
          data: DEBUG_MODE ? heuristicResult : undefined
        });
        
        if (heuristicResult.isRecipe) {
          recipeData = heuristicResult;
        }
      } catch (error) {
        console.error("Error in heuristic extraction:", error);
        extractionResults.push({
          method: "heuristic",
          success: false,
          error: {
            name: error.name,
            message: error.message,
            stack: DEBUG_MODE ? error.stack : undefined
          }
        });
      }
    }
    
    // If no extraction method worked, return detailed error
    if (!recipeData || !recipeData.isRecipe) {
      return new Response(
        JSON.stringify({
          status: "error",
          message: "Could not extract recipe information from the provided URL",
          extractionResults,
          suggestion: "Try using Claude AI to enhance this content, or check if the URL contains recipe information."
        }),
        {
          status: 422, // Unprocessable Entity - semantically invalid
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          },
        }
      );
    }
    
    logDebug("Recipe data successfully extracted:", recipeData);
    
    // Prepare recipe data for saving
    const recipe = {
      title: recipeData.recipe.title || "Untitled Recipe",
      description: recipeData.recipe.description || "",
      source_url: targetUrl,
      image_url: recipeData.recipe.image_url || "",
      instructions: recipeData.recipe.instructions || [],
      ingredients: recipeData.recipe.ingredients || [],
      prep_time: recipeData.recipe.prep_time || null,
      cook_time: recipeData.recipe.cook_time || null,
      servings: recipeData.recipe.servings || null,
      category: recipeData.recipe.category || "Uncategorized",
      cuisine: recipeData.recipe.cuisine || null,
      meal_type: recipeData.recipe.meal_type || null,
      tags: recipeData.recipe.tags || [],
      difficulty_level: determineDifficulty(recipeData.recipe),
      user_id: userId, // Important: set the user_id to associate with the authenticated user
    };
    
    logDebug("Prepared recipe data for saving:", recipe);
    
    try {
      // Using service role key to bypass RLS
      const { data, error } = await supabaseClient
        .from('recipes')
        .insert([recipe])
        .select()
        .single();
      
      if (error) {
        console.error("Error saving recipe:", error);
        return new Response(
          JSON.stringify({
            status: "error",
            message: `Failed to save recipe: ${error.message}`,
            details: error.details,
            extractionResults
          }),
          {
            status: 400,
            headers: { 
              "Content-Type": "application/json",
              ...corsHeaders
            },
          }
        );
      }
      
      logDebug("Recipe successfully saved to database:", data);
      
      // Return the saved recipe
      return new Response(
        JSON.stringify({
          status: "success",
          data,
          method: recipeData.extractionMethod,
          confidence: recipeData.confidence,
          extractionResults: DEBUG_MODE ? extractionResults : undefined
        }),
        {
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          },
        }
      );
    } catch (error) {
      console.error("Error saving recipe:", error);
      return new Response(
        JSON.stringify({
          status: "error",
          message: `Failed to save recipe: ${error.message}`,
          error: {
            name: error.name,
            message: error.message,
            stack: DEBUG_MODE ? error.stack : undefined
          },
          extractionResults
        }),
        {
          status: 500,
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          },
        }
      );
    }
  } catch (error) {
    // Return detailed error response
    console.error("Error processing URL:", error);
    return new Response(
      JSON.stringify({
        status: "error",
        message: error.message,
        error: {
          name: error.name,
          message: error.message,
          stack: DEBUG_MODE ? error.stack : undefined
        },
        suggestion: "Try using Claude AI to enhance this content instead."
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        },
      }
    );
  }
});

// Determine source type based on URL
function determineSourceType(url: string): string {
  const urlLower = url.toLowerCase();
  
  // Check for social media platforms
  if (urlLower.includes('instagram.com') || urlLower.includes('instagram.')) {
    return 'instagram';
  } else if (urlLower.includes('facebook.com') || urlLower.includes('fb.com')) {
    return 'facebook';
  } else if (urlLower.includes('tiktok.com')) {
    return 'tiktok';
  } else if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
    return 'youtube';
  } else if (urlLower.includes('pinterest.com')) {
    return 'pinterest';
  }
  
  // Check for popular recipe websites
  const recipeWebsites = [
    'allrecipes.com', 'foodnetwork.com', 'epicurious.com', 'bonappetit.com',
    'taste.com', 'delish.com', 'seriouseats.com', 'cookinglight.com',
    'eatingwell.com', 'simplyrecipes.com', 'food52.com', 'thekitchn.com',
    'tasty.co', 'bbcgoodfood.com', 'cooking.nytimes.com', 'smittenkitchen.com',
    'indianhealthyrecipes.com', 'taste.com.au', 'recipetineats.com', 'budgetbytes.com'
  ];
  
  for (const site of recipeWebsites) {
    if (urlLower.includes(site)) {
      return 'recipe-website';
    }
  }
  
  // Default to unknown source
  return 'unknown';
}

// Extract recipe data using Schema.org Recipe type
async function extractSchemaRecipe(url: string) {
  try {
    // Fetch the URL content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RecipeKeeperBot/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    
    if (!response.ok) {
      logDebug(`Failed to fetch URL: ${url}, status: ${response.status}`);
      return { isRecipe: false };
    }
    
    const html = await response.text();
    const $ = load(html);
    
    // Look for Schema.org Recipe metadata
    let recipeData = null;
    let recipeNode = null;
    
    // Look for recipe microdata
    $('[itemtype="https://schema.org/Recipe"], [itemtype="http://schema.org/Recipe"]').each((i, el) => {
      if (!recipeData) {
        recipeData = {
          title: $(el).find('[itemprop="name"]').first().text(),
          description: $(el).find('[itemprop="description"]').first().text(),
          image_url: $(el).find('[itemprop="image"]').first().attr('src') || $(el).find('[itemprop="image"]').first().attr('content'),
          prep_time: parseISO8601Duration($(el).find('[itemprop="prepTime"]').first().attr('content')),
          cook_time: parseISO8601Duration($(el).find('[itemprop="cookTime"]').first().attr('content')),
          total_time: parseISO8601Duration($(el).find('[itemprop="totalTime"]').first().attr('content')),
          servings: parseInt($(el).find('[itemprop="recipeYield"]').first().text()) || null,
          ingredients: [],
          instructions: [],
          category: $(el).find('[itemprop="recipeCategory"]').first().text(),
          cuisine: $(el).find('[itemprop="recipeCuisine"]').first().text(),
        };
        
        // Get ingredients
        $(el).find('[itemprop="recipeIngredient"], [itemprop="ingredients"]').each((i, ingredient) => {
          const text = $(ingredient).text().trim();
          if (text && !recipeData.ingredients.includes(text)) {
            recipeData.ingredients.push(text);
          }
        });
        
        // Get instructions
        $(el).find('[itemprop="recipeInstructions"]').each((i, instruction) => {
          // Check if this is a parent container with itemList elements
          if ($(instruction).attr('itemtype') && 
             ($(instruction).attr('itemtype').includes('ItemList') || 
              $(instruction).find('[itemtype*="HowToStep"]').length > 0)) {
            
            $(instruction).find('[itemprop="itemListElement"], [itemtype*="HowToStep"]').each((j, step) => {
              const text = $(step).find('[itemprop="text"]').text().trim() || $(step).text().trim();
              if (text) {
                recipeData.instructions.push(text);
              }
            });
          } else {
            // Single instruction step
            const text = $(instruction).text().trim();
            if (text) {
              recipeData.instructions.push(text);
            }
          }
        });
      }
    });
    
    if (recipeData) {
      logDebug("Schema.org recipe data found:", recipeData);
      return {
        isRecipe: true,
        recipe: recipeData,
        confidence: 0.9, // High confidence for schema.org
        extractionMethod: 'schema.org'
      };
    }
    
    logDebug("No Schema.org recipe data found");
    return { isRecipe: false };
  } catch (error) {
    console.error("Error in Schema extraction:", error);
    throw error;
  }
}

// Extract recipe using JSON-LD structured data
async function extractJsonLdRecipe(url: string) {
  try {
    // Fetch the URL content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RecipeKeeperBot/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    
    if (!response.ok) {
      logDebug(`Failed to fetch URL: ${url}, status: ${response.status}`);
      return { isRecipe: false };
    }
    
    const html = await response.text();
    const $ = load(html);
    
    // Find all JSON-LD scripts
    const jsonLdScripts = $('script[type="application/ld+json"]');
    logDebug(`Found ${jsonLdScripts.length} JSON-LD scripts`);
    
    for (let i = 0; i < jsonLdScripts.length; i++) {
      try {
        const jsonText = $(jsonLdScripts[i]).html();
        if (!jsonText) continue;
        
        const jsonData = JSON.parse(jsonText);
        logDebug(`Parsed JSON-LD script #${i+1}:`, jsonData);
        
        // Handle both direct Recipe objects and @graph arrays
        let recipeObject = null;
        
        if (jsonData['@type'] === 'Recipe') {
          recipeObject = jsonData;
        } else if (Array.isArray(jsonData)) {
          recipeObject = jsonData.find(item => item['@type'] === 'Recipe');
        } else if (jsonData['@graph']) {
          recipeObject = jsonData['@graph'].find(item => item['@type'] === 'Recipe');
        }
        
        if (recipeObject) {
          logDebug("Found Recipe object in JSON-LD:", recipeObject);
          
          // Parse the recipe data
          const recipeData = {
            title: recipeObject.name || '',
            description: recipeObject.description || '',
            image_url: recipeObject.image?.url || recipeObject.image || '',
            prep_time: parseISO8601Duration(recipeObject.prepTime),
            cook_time: parseISO8601Duration(recipeObject.cookTime),
            total_time: parseISO8601Duration(recipeObject.totalTime),
            servings: parseInt(recipeObject.recipeYield) || null,
            ingredients: [],
            instructions: [],
            category: recipeObject.recipeCategory || '',
            cuisine: recipeObject.recipeCuisine || '',
          };
          
          // Get ingredients
          if (recipeObject.recipeIngredient && Array.isArray(recipeObject.recipeIngredient)) {
            recipeData.ingredients = recipeObject.recipeIngredient;
            logDebug("Found ingredients:", recipeData.ingredients);
          }
          
          // Get instructions
          if (recipeObject.recipeInstructions) {
            if (Array.isArray(recipeObject.recipeInstructions)) {
              recipeObject.recipeInstructions.forEach(instruction => {
                if (typeof instruction === 'string') {
                  recipeData.instructions.push(instruction);
                } else if (instruction['@type'] === 'HowToStep') {
                  recipeData.instructions.push(instruction.text);
                }
              });
            } else if (typeof recipeObject.recipeInstructions === 'string') {
              recipeData.instructions = recipeObject.recipeInstructions
                .split(/\n|<br\s*\/?>/)
                .map(s => s.trim())
                .filter(s => s);
            }
            logDebug("Found instructions:", recipeData.instructions);
          }
          
          return {
            isRecipe: true,
            recipe: recipeData,
            confidence: 0.85, // High confidence for JSON-LD
            extractionMethod: 'json-ld'
          };
        }
      } catch (e) {
        // Continue to next script
        console.error("Error parsing JSON-LD script:", e);
      }
    }
    
    logDebug("No recipe data found in JSON-LD scripts");
    return { isRecipe: false };
  } catch (error) {
    console.error("Error in JSON-LD extraction:", error);
    throw error;
  }
}

// Extract recipe using heuristic methods for general websites
async function extractHeuristicRecipe(url: string) {
  try {
    // Fetch the URL content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RecipeKeeperBot/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    
    if (!response.ok) {
      logDebug(`Failed to fetch URL: ${url}, status: ${response.status}`);
      return { isRecipe: false };
    }
    
    const html = await response.text();
    const $ = load(html);
    
    // Use heuristics to identify recipe content
    const recipeData = {
      title: '',
      description: '',
      image_url: '',
      ingredients: [],
      instructions: [],
      prep_time: null,
      cook_time: null,
      servings: null,
      category: '',
      cuisine: '',
    };
    
    // Extract title - prioritize heading elements
    recipeData.title = $('h1').first().text().trim() || $('title').text().trim();
    logDebug("Heuristic found title:", recipeData.title);
    
    // Extract main image
    recipeData.image_url = $('meta[property="og:image"]').attr('content') ||
                         $('meta[name="twitter:image"]').attr('content');
    
    if (!recipeData.image_url) {
      // Look for large images in content area
      $('img').each((i, el) => {
        const src = $(el).attr('src');
        const width = $(el).attr('width');
        const height = $(el).attr('height');
        
        if (src && ((width && height && parseInt(width) > 300 && parseInt(height) > 300) || 
            $(el).hasClass('hero-image') || 
            $(el).hasClass('main-image') || 
            $(el).closest('.recipe-image, .hero, .featured-image').length)) {
          recipeData.image_url = src;
          return false; // break loop
        }
      });
    }
    logDebug("Heuristic found image:", recipeData.image_url);
    
    // Extract description
    recipeData.description = $('meta[property="og:description"]').attr('content') || 
                          $('meta[name="description"]').attr('content') || 
                          $('.recipe-description, .description, .summary').first().text().trim();
    logDebug("Heuristic found description:", recipeData.description);
    
    // Extract ingredients - common ingredient selectors
    const ingredientSelectors = [
      '.ingredients li',
      '.ingredient-list li',
      '.recipe-ingredients li',
      '.ingredients-section li',
      '.ingredient',
      '[itemprop="recipeIngredient"]',
      '#ingredients li',
      '.wprm-recipe-ingredient'
    ];
    
    for (const selector of ingredientSelectors) {
      $(selector).each((i, el) => {
        const text = $(el).text().trim();
        if (text && !recipeData.ingredients.includes(text)) {
          recipeData.ingredients.push(text);
        }
      });
      
      if (recipeData.ingredients.length > 0) {
        logDebug(`Found ingredients using selector: ${selector}`, recipeData.ingredients);
        break;
      }
    }
    
    // If no ingredients found yet, look for common ingredient container patterns
    if (recipeData.ingredients.length === 0) {
      $('.ingredients, .recipe-ingredients, #ingredients').each((i, el) => {
        const text = $(el).text().trim();
        if (text) {
          // Split text into lines and filter empty ones
          const lines = text.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 5 && line.length < 200);
          
          recipeData.ingredients = lines;
          logDebug("Found ingredients in container:", recipeData.ingredients);
          return false; // break loop if found
        }
      });
    }
    
    // Extract instructions - common instruction selectors
    const instructionSelectors = [
      '.instructions li',
      '.recipe-instructions li',
      '.steps li',
      '.recipe-steps li',
      '.prep-steps li',
      '.method li',
      '.directions li',
      '[itemprop="recipeInstructions"] li',
      '.wprm-recipe-instruction'
    ];
    
    for (const selector of instructionSelectors) {
      $(selector).each((i, el) => {
        const text = $(el).text().trim();
        if (text) {
          recipeData.instructions.push(text);
        }
      });
      
      if (recipeData.instructions.length > 0) {
        logDebug(`Found instructions using selector: ${selector}`, recipeData.instructions);
        break;
      }
    }
    
    // If no instructions found yet, look for paragraphs in instruction containers
    if (recipeData.instructions.length === 0) {
      $('.instructions, .recipe-instructions, .steps, .method, .directions').find('p').each((i, el) => {
        const text = $(el).text().trim();
        if (text && text.length > 10) {
          recipeData.instructions.push(text);
        }
      });
      
      if (recipeData.instructions.length > 0) {
        logDebug("Found instructions in paragraphs:", recipeData.instructions);
      }
    }
    
    // Extract prep and cook times
    const timeRegex = /(\d+)\s*(min|minute|hour|hr|h)/i;
    $('.prep-time, .cook-time, .recipe-time, [itemprop="prepTime"], [itemprop="cookTime"]').each((i, el) => {
      const text = $(el).text().trim();
      const match = text.match(timeRegex);
      
      if (match) {
        const time = parseInt(match[1]);
        const unit = match[2].toLowerCase();
        const minutes = unit.startsWith('h') ? time * 60 : time;
        
        if ($(el).hasClass('prep-time') || $(el).attr('itemprop') === 'prepTime') {
          recipeData.prep_time = minutes;
          logDebug("Found prep time:", minutes);
        } else if ($(el).hasClass('cook-time') || $(el).attr('itemprop') === 'cookTime') {
          recipeData.cook_time = minutes;
          logDebug("Found cook time:", minutes);
        }
      }
    });
    
    // Extract servings
    const servingsRegex = /serves\s*(\d+)|(\d+)\s*serv(ing|e)/i;
    $('.servings, .yield, [itemprop="recipeYield"]').each((i, el) => {
      const text = $(el).text().trim();
      const match = text.match(servingsRegex);
      
      if (match) {
        recipeData.servings = parseInt(match[1] || match[2]);
        logDebug("Found servings:", recipeData.servings);
      } else if (text.match(/\d+/)) {
        // Just try to find the first number if the regex didn't work
        const numMatch = text.match(/\d+/);
        if (numMatch) {
          recipeData.servings = parseInt(numMatch[0]);
          logDebug("Found servings (fallback):", recipeData.servings);
        }
      }
    });
    
    // Calculate confidence score based on extracted content
    let confidence = 0.3; // Base confidence
    
    // Increase confidence based on what we found
    if (recipeData.title) confidence += 0.1;
    if (recipeData.image_url) confidence += 0.1;
    if (recipeData.ingredients.length > 3) confidence += 0.2;
    if (recipeData.instructions.length > 1) confidence += 0.2;
    if (recipeData.prep_time || recipeData.cook_time) confidence += 0.1;
    
    logDebug("Heuristic extraction confidence score:", confidence);
    
    // Only consider it a recipe if we have some minimum content
    if (recipeData.ingredients.length > 0 && recipeData.instructions.length > 0) {
      return {
        isRecipe: true,
        recipe: recipeData,
        confidence: confidence,
        extractionMethod: 'heuristic'
      };
    }
    
    return { isRecipe: false };
  } catch (error) {
    console.error("Error in heuristic extraction:", error);
    throw error;
  }
}

// Helper function to parse ISO 8601 duration format (e.g., PT1H30M)
function parseISO8601Duration(duration: string | undefined): number | null {
  if (!duration) return null;
  
  const matches = duration.match(/P(?:(\d+)D)?T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!matches) return null;
  
  const days = parseInt(matches[1] || '0');
  const hours = parseInt(matches[2] || '0');
  const minutes = parseInt(matches[3] || '0');
  const seconds = parseInt(matches[4] || '0');
  
  return (days * 24 * 60) + (hours * 60) + minutes + (seconds / 60);
}

// Helper function to determine recipe difficulty
function determineDifficulty(recipe: any): string {
  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);
  const stepsCount = recipe.instructions?.length || 0;
  const ingredientsCount = recipe.ingredients?.length || 0;
  
  // Calculate a difficulty score based on time, steps, and ingredients
  let difficultyScore = 0;
  
  if (totalTime < 30) difficultyScore += 1;
  else if (totalTime < 60) difficultyScore += 2;
  else difficultyScore += 3;
  
  if (stepsCount < 5) difficultyScore += 1;
  else if (stepsCount < 10) difficultyScore += 2;
  else difficultyScore += 3;
  
  if (ingredientsCount < 5) difficultyScore += 1;
  else if (ingredientsCount < 10) difficultyScore += 2;
  else difficultyScore += 3;
  
  // Determine difficulty level based on score
  const avgScore = difficultyScore / 3;
  if (avgScore < 1.7) return 'Easy';
  if (avgScore < 2.5) return 'Medium';
  return 'Hard';
}

// Helper to log HTML structure for debugging
function logDebug(message: string, data?: any) {
  if (DEBUG_MODE) {
    if (data) {
      console.log(`DEBUG: ${message}`, data);
    } else {
      console.log(`DEBUG: ${message}`);
    }
  }
}

// Function to extract the best image
async function extractBestImage(html, url) {
  const images = [];
  
  // First try to get structured data images
  try {
    const jsonLdMatches = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/gs);
    if (jsonLdMatches) {
      for (const match of jsonLdMatches) {
        const jsonContent = match.replace(/<script type="application\/ld\+json">(.*?)<\/script>/s, '$1');
        const data = JSON.parse(jsonContent);
        
        if (data.image) {
          if (typeof data.image === 'string') {
            images.push({ url: data.image, source: 'json-ld', confidence: 0.9 });
          } else if (Array.isArray(data.image)) {
            data.image.forEach(img => {
              if (typeof img === 'string') {
                images.push({ url: img, source: 'json-ld', confidence: 0.9 });
              } else if (typeof img === 'object' && img.url) {
                images.push({ 
                  url: img.url, 
                  width: img.width, 
                  height: img.height,
                  source: 'json-ld', 
                  confidence: 0.9 
                });
              }
            });
          }
        }
      }
    }
  } catch (e) {
    console.log('Error extracting JSON-LD images:', e);
  }
  
  // Try to get Open Graph images
  try {
    const ogImageMatch = html.match(/<meta property="og:image" content="(.*?)"/i);
    if (ogImageMatch && ogImageMatch[1]) {
      images.push({ url: ogImageMatch[1], source: 'og-image', confidence: 0.8 });
    }
  } catch (e) {
    console.log('Error extracting Open Graph images:', e);
  }
  
  // Try to get Twitter card images
  try {
    const twitterImageMatch = html.match(/<meta name="twitter:image" content="(.*?)"/i);
    if (twitterImageMatch && twitterImageMatch[1]) {
      images.push({ url: twitterImageMatch[1], source: 'twitter-card', confidence: 0.8 });
    }
  } catch (e) {
    console.log('Error extracting Twitter Card images:', e);
  }
  
  // Try to get images from the content
  try {
    const imgMatches = html.match(/<img[^>]+src="([^">]+)"/g);
    if (imgMatches) {
      for (const match of imgMatches) {
        const srcMatch = match.match(/src="([^">]+)"/);
        if (srcMatch && srcMatch[1]) {
          // Check if it's a recipe image (skip logos, icons, etc.)
          const imgSrc = srcMatch[1];
          const isLikelyRecipeImage = 
            !imgSrc.includes('logo') && 
            !imgSrc.includes('icon') && 
            !imgSrc.includes('avatar') &&
            !imgSrc.includes('banner') &&
            (imgSrc.includes('recipe') || 
             imgSrc.includes('food') || 
             imgSrc.includes('dish') || 
             imgSrc.includes('meal') ||
             match.includes('data-pin-media') ||
             match.includes('hero') ||
             match.includes('featured'));
          
          if (isLikelyRecipeImage) {
            // Look for width and height
            const widthMatch = match.match(/width="(\d+)"/);
            const heightMatch = match.match(/height="(\d+)"/);
            const width = widthMatch ? parseInt(widthMatch[1]) : null;
            const height = heightMatch ? parseInt(heightMatch[1]) : null;
            
            // Prioritize larger images
            const confidence = (width && height && width > 300 && height > 300) ? 0.7 : 0.5;
            
            images.push({ 
              url: srcMatch[1], 
              width, 
              height,
              source: 'img-tag',
              confidence
            });
          }
        }
      }
    }
  } catch (e) {
    console.log('Error extracting content images:', e);
  }
  
  if (images.length === 0) {
    return null;
  }
  
  // Sort images by confidence and size
  const sortedImages = images.sort((a, b) => {
    // First by confidence
    if (a.confidence !== b.confidence) {
      return b.confidence - a.confidence;
    }
    
    // Then by size if available
    if (a.width && a.height && b.width && b.height) {
      const aSize = a.width * a.height;
      const bSize = b.width * b.height;
      return bSize - aSize;
    }
    
    return 0;
  });
  
  console.log(`Found ${images.length} images, best candidate:`, sortedImages[0]);
  
  // Make sure the URL is absolute
  let bestImageUrl = sortedImages[0].url;
  if (!bestImageUrl.startsWith('http')) {
    const urlObj = new URL(url);
    if (bestImageUrl.startsWith('/')) {
      bestImageUrl = `${urlObj.protocol}//${urlObj.hostname}${bestImageUrl}`;
    } else {
      bestImageUrl = `${urlObj.protocol}//${urlObj.hostname}/${bestImageUrl}`;
    }
  }
  
  return {
    url: bestImageUrl,
    metadata: sortedImages[0]
  };
}
