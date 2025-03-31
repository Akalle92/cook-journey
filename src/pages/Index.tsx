
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import RecipeDetail from '@/components/RecipeDetail/index';
import { Recipe } from '@/types/recipe';
import { fetchRecipes } from '@/services/recipeApiService';
import ExtractRecipeSection from '@/components/RecipeExtraction/ExtractRecipeSection';
import RecipeDisplaySection from '@/components/RecipeDisplaySection';
import { useRecipeExtraction } from '@/hooks/useRecipeExtraction';
import { RecipeSearch } from '@/components/RecipeSearch/RecipeSearch';
import { useRecipeSearch } from '@/hooks/useRecipeSearch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

const Index = () => {
  const {
    selectedRecipe,
    showRecipeDetail,
    setSelectedRecipe,
    setShowRecipeDetail
  } = useRecipeExtraction();

  const {
    recipes,
    isLoading,
    isError,
    error,
    filters,
    searchParams,
    hasMore,
    handleSearch,
    handleSortChange,
    handleRetry,
    loadMore
  } = useRecipeSearch();

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
        
        <div className="space-y-6">
          <RecipeSearch
            onSearch={handleSearch}
            filters={filters}
            currentFilters={searchParams}
            isLoading={isLoading}
          />

          {isError && error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription className="flex items-center justify-between">
                <span>{error.message}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                  className="ml-4"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <RecipeDisplaySection
            recipes={recipes}
            isLoading={isLoading}
            isError={isError}
            onRecipeClick={handleRecipeClick}
            onLoadMore={loadMore}
            hasMore={hasMore}
            sortBy={searchParams.sortBy || 'createdAt'}
            sortOrder={searchParams.sortOrder || 'desc'}
            onSortChange={handleSortChange}
          />
        </div>
      </main>
      
      <RecipeDetail recipe={selectedRecipe} isOpen={showRecipeDetail} onClose={closeRecipeDetail} />
    </div>
  );
};

export default Index;
