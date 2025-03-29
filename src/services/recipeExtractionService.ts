
import { Recipe } from '@/components/RecipeCard';
import { supabase } from '@/integrations/supabase/client';

// Extract recipe from URL using our universal recipe extractor edge function
export const extractRecipeFromUrl = async (url: string, debugMode: boolean = false): Promise<any> => {
  console.log(`Extracting recipe from URL: ${url}, Debug mode: ${debugMode}`);
  
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
        userId: user.id,
        debug: debugMode
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
    
    // Return the extraction result with all data
    return data;
  } catch (error: any) {
    console.error('Error in extractRecipeFromUrl:', error);
    
    // Enhanced error handling for better debugging
    if (error.response) {
      const responseError = {
        ...error,
        response: {
          ...error.response,
          data: error.response.data
        }
      };
      throw responseError;
    }
    
    throw new Error(error.message || 'Failed to extract recipe. Please try again.');
  }
};

// Extract and enhance recipe using Claude AI
export const enhanceRecipeWithClaude = async (url: string, debugMode: boolean = false): Promise<any> => {
  console.log(`Enhancing recipe from URL with Claude: ${url}, Debug mode: ${debugMode}`);
  
  try {
    // Get the current user's ID to associate with the recipe
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('You must be logged in to generate recipes');
    }
    
    // Clean the URL before sending
    let cleanUrl = url.trim();
    
    // Call our Claude recipe generator edge function
    const { data, error } = await supabase.functions.invoke('claude-recipe-generator', {
      body: {
        url: cleanUrl,
        userId: user.id,
        debug: debugMode
      }
    });
    
    if (error) {
      console.error('Error calling Claude recipe generator:', error);
      throw new Error(error.message || 'Failed to generate recipe');
    }
    
    if (!data || data.status === 'error') {
      console.error('Claude enhancement failed:', data);
      throw new Error(data?.message || 'Failed to enhance recipe from URL');
    }
    
    console.log('Claude enhancement successful - data:', data);
    
    // Return the enhanced recipe data
    return data;
  } catch (error: any) {
    console.error('Error in enhanceRecipeWithClaude:', error);
    throw new Error(error.message || 'Failed to enhance recipe. Please try again.');
  }
};

// Extract and enhance recipe using free AI model (fallback option)
export const enhanceRecipeWithFreeModel = async (url: string, debugMode: boolean = false): Promise<any> => {
  console.log(`Enhancing recipe from URL with free model: ${url}, Debug mode: ${debugMode}`);
  
  try {
    // Get the current user's ID to associate with the recipe
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('You must be logged in to generate recipes');
    }
    
    // Clean the URL before sending
    let cleanUrl = url.trim();
    
    // Call our free AI model edge function
    const { data, error } = await supabase.functions.invoke('free-model-recipe-generator', {
      body: {
        url: cleanUrl,
        userId: user.id,
        debug: debugMode
      }
    });
    
    if (error) {
      console.error('Error calling free model recipe generator:', error);
      throw new Error(error.message || 'Failed to generate recipe');
    }
    
    if (!data || data.status === 'error') {
      console.error('Free model enhancement failed:', data);
      throw new Error(data?.message || 'Failed to enhance recipe from URL');
    }
    
    console.log('Free model enhancement successful - data:', data);
    
    // Return the enhanced recipe data
    return data;
  } catch (error: any) {
    console.error('Error in enhanceRecipeWithFreeModel:', error);
    throw new Error(error.message || 'Failed to enhance recipe. Please try again.');
  }
};
