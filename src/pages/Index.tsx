
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/Header';
import RecipeUrlInput from '@/components/RecipeUrlInput';
import TrendingRecipes from '@/components/TrendingRecipes';
import RecipeGrid from '@/components/RecipeGrid';
import RecipeDetail from '@/components/RecipeDetail';
import { Recipe } from '@/components/RecipeCard';
import { fetchRecipes, extractRecipeFromUrl, enhanceRecipeWithClaude } from '@/services/recipeService';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

const Index = () => {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showRecipeDetail, setShowRecipeDetail] = useState(false);
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
    mutationFn: extractRecipeFromUrl,
    onSuccess: newRecipe => {
      console.log('Successfully extracted recipe:', newRecipe);

      // Update the recipes in the cache with the new recipe
      queryClient.setQueryData(['recipes'], (oldData: Recipe[] = []) => {
        return [newRecipe, ...oldData];
      });

      // Show the new recipe in the detail view
      setSelectedRecipe(newRecipe);
      setShowRecipeDetail(true);
      toast({
        title: "Recipe Extracted",
        description: "Your recipe has been successfully extracted!",
        variant: "default"
      });

      // Refetch the recipes to ensure we have the latest data
      queryClient.invalidateQueries({
        queryKey: ['recipes']
      });
    },
    onError: (error: any) => {
      console.error("Error extracting recipe:", error);
      toast({
        title: "Extraction Failed",
        description: error.message || "Failed to extract recipe from the provided URL.",
        variant: "destructive"
      });
    }
  });

  // Set up mutation for Claude-enhanced recipe extraction
  const claudeRecipeMutation = useMutation({
    mutationFn: enhanceRecipeWithClaude,
    onSuccess: newRecipe => {
      console.log('Successfully extracted recipe with Claude:', newRecipe);

      // Update the recipes in the cache with the new recipe
      queryClient.setQueryData(['recipes'], (oldData: Recipe[] = []) => {
        return [newRecipe, ...oldData];
      });

      // Show the new recipe in the detail view
      setSelectedRecipe(newRecipe);
      setShowRecipeDetail(true);
      toast({
        title: "Recipe Created with Claude AI",
        description: "Your recipe has been successfully extracted and enhanced!",
        variant: "default"
      });

      // Refetch the recipes to ensure we have the latest data
      queryClient.invalidateQueries({
        queryKey: ['recipes']
      });
    },
    onError: (error: any) => {
      console.error("Error extracting recipe with Claude:", error);
      toast({
        title: "Claude Enhancement Failed",
        description: error.message || "Failed to enhance recipe from the provided URL.",
        variant: "destructive"
      });
    }
  });

  const handleRecipeExtraction = (url: string, useClaude: boolean = false) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to extract and save recipes",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: useClaude ? "AI-Enhancing Recipe" : "Extracting Recipe",
      description: "Processing the URL..."
    });

    if (useClaude) {
      claudeRecipeMutation.mutate(url);
    } else {
      extractRecipeMutation.mutate(url);
    }
  };

  const handleRecipeClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setShowRecipeDetail(true);
  };

  const closeRecipeDetail = () => {
    setShowRecipeDetail(false);
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
