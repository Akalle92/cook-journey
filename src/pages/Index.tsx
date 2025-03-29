import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/Header';
import RecipeUrlInput from '@/components/RecipeUrlInput';
import TrendingRecipes from '@/components/TrendingRecipes';
import RecipeGrid from '@/components/RecipeGrid';
import RecipeDetail from '@/components/RecipeDetail';
import { Recipe, ExtractionMethod } from '@/components/RecipeCard';
import { fetchRecipes, extractRecipeFromUrl, enhanceRecipeWithClaude } from '@/services/recipeService';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

// Define types for extraction errors
interface ExtractionError {
  status: string;
  message: string;
  extractionResults?: ExtractionMethod[];
  suggestion?: string;
}

const Index = () => {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showRecipeDetail, setShowRecipeDetail] = useState(false);
  const [extractionError, setExtractionError] = useState<ExtractionError | null>(null);
  const [debugInfo, setDebugInfo] = useState<any | null>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch recipes using React Query
  const {
    data: recipes = [],
    isLoading: isLoadingRecipes,
    isError: isRecipesError
  } = useQuery({
    queryKey: ['recipes'],
    queryFn: fetchRecipes,
    staleTime: 60000, // 1 minute
    retry: 3,
    meta: {
      onError: (error: any) => {
        console.error('Failed to load recipes:', error);
        toast({
          title: "Error Loading Recipes",
          description: "There was a problem loading your recipes. Please try again later.",
          variant: "destructive"
        });
      }
    }
  });

  // Log recipes data for debugging
  useEffect(() => {
    console.log('Recipes from React Query:', recipes);
  }, [recipes]);

  // Set up mutation for standard recipe extraction
  const extractRecipeMutation = useMutation({
    mutationFn: ({ url, debugMode }: { url: string, debugMode?: boolean }) => 
      extractRecipeFromUrl(url, debugMode),
    onSuccess: (response) => {
      console.log('Successfully extracted recipe:', response);

      if (response.data) {
        const recipeData = response.data;
        
        // Update the recipes in the cache with the new recipe
        queryClient.setQueryData(['recipes'], (oldData: Recipe[] = []) => {
          return [recipeData, ...oldData];
        });

        // Show the new recipe in the detail view
        setSelectedRecipe(recipeData);
        setShowRecipeDetail(true);
        toast({
          title: "Recipe Extracted",
          description: "Your recipe has been successfully extracted!",
          variant: "default"
        });

        // Store debug info if available
        if (response.extractionResults) {
          setDebugInfo({
            method: response.method,
            confidence: response.confidence,
            results: response.extractionResults
          });
        }

        // Clear any previous errors
        setExtractionError(null);

        // Refetch the recipes to ensure we have the latest data
        queryClient.invalidateQueries({
          queryKey: ['recipes']
        });
      }
    },
    onError: (error: any) => {
      console.error("Error extracting recipe:", error);
      
      let errorMessage = "Failed to extract recipe from the provided URL.";
      let extractionResults = [];
      let suggestion = "Try using Claude AI to enhance this content instead.";
      
      // Try to parse detailed error information
      try {
        if (error.message) {
          errorMessage = error.message;
        }
        
        if (error.response) {
          const data = error.response.data;
          if (data) {
            if (data.message) errorMessage = data.message;
            if (data.extractionResults) extractionResults = data.extractionResults;
            if (data.suggestion) suggestion = data.suggestion;
          }
        }
      } catch (parseError) {
        console.error("Error parsing extraction error:", parseError);
      }
      
      setExtractionError({
        status: "error",
        message: errorMessage,
        extractionResults,
        suggestion
      });
      
      toast({
        title: "Extraction Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  });

  // Set up mutation for Claude-enhanced recipe extraction
  const claudeRecipeMutation = useMutation({
    mutationFn: ({ url, debugMode }: { url: string, debugMode?: boolean }) => 
      enhanceRecipeWithClaude(url, debugMode),
    onSuccess: (response) => {
      console.log('Successfully extracted recipe with Claude:', response);

      if (response.data) {
        const recipeData = response.data;
        
        // Update the recipes in the cache with the new recipe
        queryClient.setQueryData(['recipes'], (oldData: Recipe[] = []) => {
          return [recipeData, ...oldData];
        });

        // Show the new recipe in the detail view
        setSelectedRecipe(recipeData);
        setShowRecipeDetail(true);
        toast({
          title: "Recipe Created with Claude AI",
          description: "Your recipe has been successfully extracted and enhanced!",
          variant: "default"
        });

        // Store debug info if available
        if (response.debugInfo) {
          setDebugInfo(response.debugInfo);
        }

        // Clear any previous errors
        setExtractionError(null);

        // Refetch the recipes to ensure we have the latest data
        queryClient.invalidateQueries({
          queryKey: ['recipes']
        });
      }
    },
    onError: (error: any) => {
      console.error("Error extracting recipe with Claude:", error);
      
      let errorMessage = "Failed to enhance recipe from the provided URL.";
      if (error.message) {
        errorMessage = error.message;
      }
      
      setExtractionError({
        status: "error",
        message: errorMessage,
        suggestion: "Please try again or try a different URL."
      });
      
      toast({
        title: "Claude Enhancement Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  });

  const handleRecipeExtraction = (url: string, useClaude: boolean = false, debugMode: boolean = false) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to extract and save recipes",
        variant: "destructive"
      });
      return;
    }

    // Clear any previous errors and debug info
    setExtractionError(null);
    setDebugInfo(null);

    toast({
      title: useClaude ? "AI-Enhancing Recipe" : "Extracting Recipe",
      description: "Processing the URL..."
    });

    if (useClaude) {
      claudeRecipeMutation.mutate({ url, debugMode });
    } else {
      extractRecipeMutation.mutate({ url, debugMode });
    }
  };

  const handleRecipeClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setShowRecipeDetail(true);
  };

  const closeRecipeDetail = () => {
    setShowRecipeDetail(false);
  };

  // Display debug information when available
  const renderDebugInfo = () => {
    if (!debugInfo) return null;
    
    return (
      <div className="my-8 p-4 bg-gray-900/70 border border-gray-800 rounded-md">
        <h3 className="text-lg font-mono text-yellow-400 mb-2">Debug Information</h3>
        <div className="text-xs font-mono text-gray-300 space-y-2">
          <p>Extraction Method: <span className="text-green-400">{debugInfo.method}</span></p>
          <p>Confidence Score: <span className="text-green-400">{debugInfo.confidence || 'N/A'}</span></p>
          
          {debugInfo.results && (
            <div className="mt-4">
              <p className="text-yellow-400 mb-2">Extraction Attempts:</p>
              <div className="space-y-2">
                {debugInfo.results.map((result: any, index: number) => (
                  <div key={index} className="p-2 bg-gray-800/50 rounded border border-gray-700">
                    <p>Method: <span className={result.success ? 'text-green-400' : 'text-red-400'}>{result.method}</span></p>
                    <p>Success: <span className={result.success ? 'text-green-400' : 'text-red-400'}>{result.success ? 'Yes' : 'No'}</span></p>
                    {result.confidence && <p>Confidence: {result.confidence.toFixed(2)}</p>}
                    {result.error && (
                      <div className="mt-1 text-red-400">
                        <p>Error: {result.error.message}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen grid-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 bg-black">
        <div className="max-w-3xl mx-auto mb-12">
          <RecipeUrlInput 
            onSubmit={handleRecipeExtraction} 
            isLoading={extractRecipeMutation.isPending || claudeRecipeMutation.isPending} 
          />
          
          {extractionError && (
            <div className="mt-4 p-4 bg-red-900/20 border border-red-800 rounded-md">
              <h3 className="text-lg font-medium text-red-300 mb-2">Extraction Error</h3>
              <p className="text-red-200 text-sm mb-3">{extractionError.message}</p>
              
              {extractionError.suggestion && (
                <p className="text-yellow-300 text-sm">{extractionError.suggestion}</p>
              )}
              
              {extractionError.extractionResults && extractionError.extractionResults.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-red-300 mb-2">Details:</p>
                  <div className="space-y-2">
                    {extractionError.extractionResults.map((result, index) => (
                      <div key={index} className="text-xs bg-red-900/20 p-2 rounded">
                        <p>Method: {result.method} - <span className={result.success ? "text-green-400" : "text-red-400"}>
                          {result.success ? "Success" : "Failed"}
                        </span></p>
                        {result.error && <p className="text-red-400">{result.error.message}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {debugInfo && renderDebugInfo()}
        </div>
        
        {isLoadingRecipes ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading recipes...</p>
          </div>
        ) : isRecipesError ? (
          <div className="text-center py-8">
            <p className="text-destructive">Error loading recipes. Please try again later.</p>
          </div>
        ) : (
          <>
            {recipes && recipes.length > 0 ? (
              <>
                <TrendingRecipes recipes={recipes.slice(0, 5)} onRecipeClick={handleRecipeClick} />
                
                <div className="mb-8">
                  <h2 className="font-mono text-xl uppercase tracking-tight mb-4">Your Recipes</h2>
                  <RecipeGrid recipes={recipes} onRecipeClick={handleRecipeClick} />
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  No recipes found. Extract your first recipe from a URL!
                </p>
              </div>
            )}
          </>
        )}
      </main>
      
      <RecipeDetail recipe={selectedRecipe} isOpen={showRecipeDetail} onClose={closeRecipeDetail} />
    </div>
  );
};

export default Index;
