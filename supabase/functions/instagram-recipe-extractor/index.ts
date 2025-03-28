
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { load } from "https://esm.sh/cheerio@1.0.0-rc.12";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle CORS preflight requests
function handleCors(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
    });
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
    
    // Parse request body
    const { url, userId } = await req.json();
    
    if (!url) {
      throw new Error("URL is required");
    }
    
    if (!userId) {
      throw new Error("User ID is required");
    }

    console.log(`URL: ${url}, Source Type: unknown`);
    
    // Determine the type of content source
    const sourceType = determineSourceType(url);
    console.log(`URL: ${url}, Source Type: ${sourceType}`);
    
    // Extract recipe data based on source type
    let recipeData;
    
    // Generic recipe extraction (supports multiple strategies)
    console.log(`Generic recipe extraction for: ${url}`);
    
    // Strategy 1: Schema.org structured data
    console.log(`Attempting schema.org extraction from: ${url}`);
    recipeData = await extractSchemaRecipe(url);
    
    // Strategy 2: JSON-LD extraction
    if (!recipeData || !recipeData.isRecipe) {
      console.log(`Attempting JSON-LD extraction from: ${url}`);
      recipeData = await extractJsonLdRecipe(url);
    }
    
    // Strategy 3: Heuristic extraction for general websites
    if (!recipeData || !recipeData.isRecipe) {
      console.log(`Attempting heuristic extraction from: ${url}`);
      recipeData = await extractHeuristicRecipe(url);
    }
    
    // If no extraction method worked, return error
    if (!recipeData || !recipeData.isRecipe) {
      throw new Error("Could not extract recipe information from the provided URL");
    }
    
    // Prepare recipe data for saving
    const recipe = {
      title: recipeData.recipe.title || "Untitled Recipe",
      description: recipeData.recipe.description || "",
      source_url: url,
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
    
    try {
      // Save recipe to database
      const { data, error } = await supabaseClient
        .from('recipes')
        .insert([recipe])
        .select()
        .single();
      
      if (error) {
        console.error("Error saving recipe:", error);
        throw new Error("Failed to save recipe");
      }
      
      // Return the saved recipe
      return new Response(
        JSON.stringify({
          status: "success",
          data,
          method: recipeData.extractionMethod,
          confidence: recipeData.confidence,
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
      throw new Error("Failed to save recipe");
    }
  } catch (error) {
    // Return error response
    return new Response(
      JSON.stringify({
        status: "error",
        message: error.message,
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
    'tasty.co', 'bbcgoodfood.com', 'cooking.nytimes.com', 'smittenkitchen.com'
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
      return {
        isRecipe: true,
        recipe: recipeData,
        confidence: 0.9, // High confidence for schema.org
        extractionMethod: 'schema.org'
      };
    }
    
    return { isRecipe: false };
  } catch (error) {
    console.error("Error in Schema extraction:", error);
    return { isRecipe: false };
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
      return { isRecipe: false };
    }
    
    const html = await response.text();
    const $ = load(html);
    
    // Find all JSON-LD scripts
    const jsonLdScripts = $('script[type="application/ld+json"]');
    
    for (let i = 0; i < jsonLdScripts.length; i++) {
      try {
        const jsonText = $(jsonLdScripts[i]).html();
        if (!jsonText) continue;
        
        const jsonData = JSON.parse(jsonText);
        
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
    
    return { isRecipe: false };
  } catch (error) {
    console.error("Error in JSON-LD extraction:", error);
    return { isRecipe: false };
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
    
    // Extract description
    recipeData.description = $('meta[property="og:description"]').attr('content') || 
                          $('meta[name="description"]').attr('content') || 
                          $('.recipe-description, .description, .summary').first().text().trim();
    
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
      
      if (recipeData.ingredients.length > 0) break;
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
      
      if (recipeData.instructions.length > 0) break;
    }
    
    // If no instructions found yet, look for paragraphs in instruction containers
    if (recipeData.instructions.length === 0) {
      $('.instructions, .recipe-instructions, .steps, .method, .directions').find('p').each((i, el) => {
        const text = $(el).text().trim();
        if (text && text.length > 10) {
          recipeData.instructions.push(text);
        }
      });
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
        } else if ($(el).hasClass('cook-time') || $(el).attr('itemprop') === 'cookTime') {
          recipeData.cook_time = minutes;
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
      } else if (text.match(/\d+/)) {
        // Just try to find the first number if the regex didn't work
        const numMatch = text.match(/\d+/);
        if (numMatch) {
          recipeData.servings = parseInt(numMatch[0]);
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
    return { isRecipe: false };
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
