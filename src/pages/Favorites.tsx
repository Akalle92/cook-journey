
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import RecipeDetail from '@/components/RecipeDetail';
import { Recipe } from '@/components/RecipeCard';
import { fetchFavoriteRecipes } from '@/services/recipeService';
import RecipeDisplaySection from '@/components/RecipeDisplaySection';
import { useRecipeExtraction } from '@/hooks/useRecipeExtraction';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Favorites = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    selectedRecipe,
    showRecipeDetail,
    setSelectedRecipe,
    setShowRecipeDetail
  } = useRecipeExtraction();

  // Fetch favorites using React Query
  const {
    data: favoriteRecipes = [],
    isLoading,
    isError
  } = useQuery({
    queryKey: ['favoriteRecipes', user?.id],
    queryFn: () => fetchFavoriteRecipes(),
    staleTime: 60000, // 1 minute
    enabled: !!user, // Only fetch if user is logged in
    meta: {
      onError: (error: any) => {
        console.error('Failed to load favorite recipes:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your favorite recipes. Please try again.',
          variant: 'destructive'
        });
      }
    }
  });

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
        <h1 className="text-3xl font-bold mb-8 text-white">My Favorite Recipes</h1>
        
        {!user && (
          <div className="bg-muted/20 backdrop-blur-sm rounded-lg p-6 mb-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Sign in to view your favorites</h2>
            <p className="text-muted-foreground mb-4">
              You need to be signed in to save and view your favorite recipes.
            </p>
          </div>
        )}
        
        <RecipeDisplaySection
          recipes={favoriteRecipes}
          isLoading={isLoading}
          isError={isError}
          onRecipeClick={handleRecipeClick}
          emptyMessage="You don't have any favorite recipes yet."
        />
      </main>
      
      <RecipeDetail recipe={selectedRecipe} isOpen={showRecipeDetail} onClose={closeRecipeDetail} />
    </div>
  );
};

export default Favorites;
