
import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/Header';
import InstagramUrlInput from '@/components/InstagramUrlInput';
import TrendingRecipes from '@/components/TrendingRecipes';
import RecipeGrid from '@/components/RecipeGrid';
import RecipeDetail from '@/components/RecipeDetail';
import { Recipe } from '@/components/RecipeCard';
import { fetchRecipes, extractRecipeFromInstagram } from '@/services/recipeService';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

const Index = () => {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showRecipeDetail, setShowRecipeDetail] = useState(false);
  const { user } = useAuth();
  
  const queryClient = useQueryClient();
  
  // Fetch recipes using React Query
  const { data: recipes = [], isLoading: isLoadingRecipes } = useQuery({
    queryKey: ['recipes'],
    queryFn: fetchRecipes,
    staleTime: 60000, // 1 minute
  });
  
  // Set up mutation for recipe extraction
  const extractRecipeMutation = useMutation({
    mutationFn: extractRecipeFromInstagram,
    onSuccess: (newRecipe) => {
      // Update the recipes in the cache with the new recipe
      queryClient.setQueryData(['recipes'], (oldData: Recipe[] = []) => {
        return [newRecipe, ...oldData];
      });
      
      // Show the new recipe in the detail view
      setSelectedRecipe(newRecipe);
      setShowRecipeDetail(true);
      
      toast({
        title: "Recipe Extracted",
        description: "Your recipe has been successfully extracted from Instagram!",
        variant: "default",
      });
    },
    onError: (error: any) => {
      console.error("Error extracting recipe:", error);
      toast({
        title: "Extraction Failed",
        description: error.message || "Failed to extract recipe from the provided URL.",
        variant: "destructive",
      });
    }
  });
  
  const handleRecipeExtraction = (url: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to extract and save recipes",
        variant: "destructive",
      });
      return;
    }
    
    // Clean the URL a bit before sending
    let cleanUrl = url.trim();
    // Remove any URL parameters
    cleanUrl = cleanUrl.split('?')[0];
    
    toast({
      title: "Extracting Recipe",
      description: "Processing the Instagram post...",
    });
    
    extractRecipeMutation.mutate(cleanUrl);
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
      
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-3xl mx-auto mb-12">
          <InstagramUrlInput 
            onSubmit={handleRecipeExtraction} 
            isLoading={extractRecipeMutation.isPending} 
          />
        </div>
        
        {isLoadingRecipes ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading recipes...</p>
          </div>
        ) : (
          <>
            {recipes.length > 0 ? (
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
                  No recipes found. Extract your first recipe from Instagram!
                </p>
              </div>
            )}
          </>
        )}
      </main>
      
      <RecipeDetail 
        recipe={selectedRecipe} 
        isOpen={showRecipeDetail} 
        onClose={closeRecipeDetail} 
      />
    </div>
  );
};

export default Index;
