import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { extractRecipeFromUrl, enhanceRecipeWithClaude, enhanceRecipeWithFreeModel } from '@/services/recipeExtractionService';
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

  const extractRecipeMutation = useMutation({
    mutationFn: ({ url, debugMode }: { url: string, debugMode?: boolean }) => 
      extractRecipeFromUrl(url, debugMode),
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

        if (response.extractionResults) {
          setDebugInfo({
            method: response.method,
            confidence: response.confidence,
            results: response.extractionResults
          });
        }

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
      let suggestion = "Try using Claude AI to enhance this content instead.";
      
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

  const claudeRecipeMutation = useMutation({
    mutationFn: ({ url, debugMode }: { url: string, debugMode?: boolean }) => 
      enhanceRecipeWithClaude(url, debugMode),
    onSuccess: (response: ExtractionResponse) => {
      console.log('Successfully extracted recipe with Claude:', response);

      if (response.data) {
        const recipeData = response.data;
        
        queryClient.setQueryData(['recipes'], (oldData: Recipe[] = []) => {
          return [recipeData, ...oldData];
        });

        setSelectedRecipe(recipeData);
        setShowRecipeDetail(true);
        toast({
          title: "Recipe Created with Claude AI",
          description: "Your recipe has been successfully extracted and enhanced!",
          variant: "default"
        });

        if (response.debugInfo) {
          setDebugInfo(response.debugInfo);
        }

        setExtractionError(null);
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

  const freeModelRecipeMutation = useMutation({
    mutationFn: ({ url, debugMode }: { url: string, debugMode?: boolean }) => 
      enhanceRecipeWithFreeModel(url, debugMode),
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
          title: "Recipe Created with Free AI",
          description: "Your recipe has been successfully extracted and enhanced!",
          variant: "default"
        });

        if (response.debugInfo) {
          setDebugInfo(response.debugInfo);
        }

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
        title: "Free AI Enhancement Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  });

  const handleRecipeExtraction = (url: string, useClaude: boolean = false, useFreeModel: boolean = false, debugMode: boolean = false) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to extract and save recipes",
        variant: "destructive"
      });
      return;
    }

    setExtractionError(null);
    setDebugInfo(null);

    if (useFreeModel) {
      toast({
        title: "AI-Enhancing Recipe",
        description: "Processing the URL with free AI model..."
      });
      freeModelRecipeMutation.mutate({ url, debugMode });
    } else if (useClaude) {
      toast({
        title: "AI-Enhancing Recipe",
        description: "Processing the URL with Claude AI..."
      });
      claudeRecipeMutation.mutate({ url, debugMode });
    } else {
      toast({
        title: "Extracting Recipe",
        description: "Processing the URL..."
      });
      extractRecipeMutation.mutate({ url, debugMode });
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
        handleRecipeExtraction(url, false, true, true);
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
    handleRecipeExtraction(url, true, false, true);
  };

  const handleTryWithFreeModel = (url: string) => {
    handleRecipeExtraction(url, false, true, true);
  };

  return {
    extractionError,
    debugInfo,
    selectedRecipe,
    showRecipeDetail,
    retries,
    maxRetries,
    isLoading: extractRecipeMutation.isPending || claudeRecipeMutation.isPending || freeModelRecipeMutation.isPending,
    handleRecipeExtraction,
    handleRetry,
    handleTryWithClaude,
    handleTryWithFreeModel,
    setSelectedRecipe,
    setShowRecipeDetail,
    resetRetries: () => setRetries(0)
  };
};
