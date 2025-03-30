import React from 'react';
import Header from '@/components/Header';
import RecipeDetail from '@/components/RecipeDetail';
import { useFavorites } from '@/hooks/useFavorites';
import RecipeDisplaySection from '@/components/RecipeDisplaySection';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Recipe } from '@/types/recipe';

const Favorites = () => {
  const {
    favorites,
    isLoading,
    isError,
    error,
    selectedRecipe,
    setSelectedRecipe,
  } = useFavorites();

  const handleRecipeClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
  };

  const closeRecipeDetail = () => {
    setSelectedRecipe(null);
  };

  return (
    <div className="min-h-screen grid-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 bg-black">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Your Favorite Recipes</h1>
            <p className="text-muted-foreground">
              {favorites.length} {favorites.length === 1 ? 'recipe' : 'recipes'}
            </p>
          </div>

          {isError && error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription className="flex items-center justify-between">
                <span>{error.message}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.reload()}
                  className="ml-4"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {!isLoading && favorites.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                You haven't added any recipes to your favorites yet.
              </p>
            </div>
          )}

          <RecipeDisplaySection
            recipes={favorites.map(f => f.recipe)}
            isLoading={isLoading}
            isError={isError}
            onRecipeClick={handleRecipeClick}
            onLoadMore={() => {}}
            hasMore={false}
            sortBy="createdAt"
            sortOrder="desc"
            onSortChange={() => {}}
          />
        </div>
      </main>
      
      <RecipeDetail recipe={selectedRecipe} isOpen={!!selectedRecipe} onClose={closeRecipeDetail} />
    </div>
  );
};

export default Favorites; 