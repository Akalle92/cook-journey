
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { extractRecipeFromUrl, enhanceRecipeWithClaude } from '@/services/recipeService';
import { Recipe, ExtractionMethod } from '@/components/RecipeCard';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

interface ExtractionError {
  status: string;
  message: string;
  extractionResults?: ExtractionMethod[];
  suggestion?: string;
}

interface ExtractionResponse {
  data?: Recipe;
  method?: string;
  confidence?: number;
  extractionResults?: ExtractionMethod[];
  debugInfo?: any;
}

export const useRecipeExtraction = () => {
  const [extractionError, setExtractionError] = useState<ExtractionError | null>(null);
  const [debugInfo, setDebugInfo] = useState<any | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showRecipeDetail, setShowRecipeDetail] = useState(false);
  const [retries, setRetries] = useState(0);
  const maxRetries = 3;
  
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Set up mutation for standard recipe extraction
  const extractRecipeMutation = useMutation({
    mutationFn: ({ url, debugMode }: { url: string, debugMode?: boolean }) => 
      extractRecipeFromUrl(url, debugMode),
    onSuccess: (response: ExtractionResponse) => {
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
    onSuccess: (response: ExtractionResponse) => {
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

  const handleRetry = (url: string) => {
    if (retries < maxRetries) {
      // Calculate exponential backoff delay
      const delay = Math.pow(2, retries) * 1000; // 1s, 2s, 4s...
      
      toast({
        title: "Retrying extraction",
        description: `Attempt ${retries + 1} of ${maxRetries}. Waiting ${delay/1000}s...`,
      });
      
      setTimeout(() => {
        setRetries(retries + 1);
        handleRecipeExtraction(url, false, true);
      }, delay);
    } else {
      toast({
        title: "Maximum retries reached",
        description: "Please try with Claude AI enhancement enabled instead.",
        variant: "destructive"
      });
    }
  };
  
  const handleTryWithClaude = (url: string) => {
    handleRecipeExtraction(url, true, true);
  };

  return {
    extractionError,
    debugInfo,
    selectedRecipe,
    showRecipeDetail,
    retries,
    maxRetries,
    isLoading: extractRecipeMutation.isPending || claudeRecipeMutation.isPending,
    handleRecipeExtraction,
    handleRetry,
    handleTryWithClaude,
    setSelectedRecipe,
    setShowRecipeDetail,
    resetRetries: () => setRetries(0)
  };
};
