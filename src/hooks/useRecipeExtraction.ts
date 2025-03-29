
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { extractRecipeFromUrl, enhanceRecipeWithFreeModel } from '@/services/recipeExtractionService';
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
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showRecipeDetail, setShowRecipeDetail] = useState(false);
  const [retries, setRetries] = useState(0);
  const maxRetries = 3;
  
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const extractRecipeMutation = useMutation({
    mutationFn: ({ url }: { url: string }) => 
      extractRecipeFromUrl(url),
    onSuccess: (response: ExtractionResponse) => {
      console.log('Successfully extracted recipe:', response);

      if (response.data) {
        const recipeData = response.data;
        
        queryClient.setQueryData(['recipes'], (oldData: Recipe[] = []) => {
          return [recipeData, ...oldData];
        });

        setSelectedRecipe(recipeData);
        setShowRecipeDetail(true);
        toast({
          title: "Recipe Extracted",
          description: "Your recipe has been successfully extracted!",
          variant: "default"
        });

        setExtractionError(null);
        queryClient.invalidateQueries({
          queryKey: ['recipes']
        });
      }
    },
    onError: (error: any) => {
      console.error("Error extracting recipe:", error);
      
      let errorMessage = "Failed to extract recipe from the provided URL.";
      let extractionResults = [];
      let suggestion = "Try using AI to enhance this content instead.";
      
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

  const freeModelRecipeMutation = useMutation({
    mutationFn: ({ url }: { url: string }) => 
      enhanceRecipeWithFreeModel(url),
    onSuccess: (response: ExtractionResponse) => {
      console.log('Successfully extracted recipe with free model:', response);

      if (response.data) {
        const recipeData = response.data;
        
        queryClient.setQueryData(['recipes'], (oldData: Recipe[] = []) => {
          return [recipeData, ...oldData];
        });

        setSelectedRecipe(recipeData);
        setShowRecipeDetail(true);
        toast({
          title: "Recipe Created with AI",
          description: "Your recipe has been successfully extracted and enhanced!",
          variant: "default"
        });

        setExtractionError(null);
        queryClient.invalidateQueries({
          queryKey: ['recipes']
        });
      }
    },
    onError: (error: any) => {
      console.error("Error extracting recipe with free model:", error);
      
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
        title: "AI Enhancement Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  });

  const handleRecipeExtraction = (url: string, useAI: boolean = false) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to extract and save recipes",
        variant: "destructive"
      });
      return;
    }

    setExtractionError(null);

    if (useAI) {
      toast({
        title: "AI-Enhancing Recipe",
        description: "Processing the URL with AI..."
      });
      freeModelRecipeMutation.mutate({ url });
    } else {
      toast({
        title: "Extracting Recipe",
        description: "Processing the URL..."
      });
      extractRecipeMutation.mutate({ url });
    }
  };

  const handleRetry = (url: string) => {
    if (retries < maxRetries) {
      const delay = Math.pow(2, retries) * 1000;
      toast({
        title: "Retrying extraction",
        description: `Attempt ${retries + 1} of ${maxRetries}. Waiting ${delay/1000}s...`,
      });
      setTimeout(() => {
        setRetries(retries + 1);
        handleRecipeExtraction(url, true);
      }, delay);
    } else {
      toast({
        title: "Maximum retries reached",
        description: "Please try again with a different URL.",
        variant: "destructive"
      });
    }
  };
  
  const handleTryWithAI = (url: string) => {
    handleRecipeExtraction(url, true);
  };

  return {
    extractionError,
    selectedRecipe,
    showRecipeDetail,
    retries,
    maxRetries,
    isLoading: extractRecipeMutation.isPending || freeModelRecipeMutation.isPending,
    handleRecipeExtraction,
    handleRetry,
    handleTryWithAI,
    setSelectedRecipe,
    setShowRecipeDetail,
    resetRetries: () => setRetries(0)
  };
};
