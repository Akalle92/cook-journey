
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import RecipeDetail from '@/components/RecipeDetail';
import { Recipe } from '@/components/RecipeCard';
import { fetchRecipes } from '@/services/recipeService';
import ExtractRecipeSection from '@/components/RecipeExtraction/ExtractRecipeSection';
import RecipeDisplaySection from '@/components/RecipeDisplaySection';
import { useRecipeExtraction } from '@/hooks/useRecipeExtraction';

const Index = () => {
  const {
    selectedRecipe,
    showRecipeDetail,
    setSelectedRecipe,
    setShowRecipeDetail
  } = useRecipeExtraction();

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
      }
    }
  });

  // Log recipes data for debugging
  React.useEffect(() => {
    console.log('Recipes from React Query:', recipes);
  }, [recipes]);

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
        <ExtractRecipeSection />
        
        <RecipeDisplaySection
          recipes={recipes}
          isLoading={isLoadingRecipes}
          isError={isRecipesError}
          onRecipeClick={handleRecipeClick}
        />
      </main>
      
      <RecipeDetail recipe={selectedRecipe} isOpen={showRecipeDetail} onClose={closeRecipeDetail} />
    </div>
  );
};

export default Index;
