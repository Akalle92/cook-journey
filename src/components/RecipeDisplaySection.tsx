
import React from 'react';
import TrendingRecipes from '@/components/TrendingRecipes';
import RecipeGrid from '@/components/RecipeGrid';
import { Recipe } from '@/components/RecipeCard';

interface RecipeDisplaySectionProps {
  recipes: Recipe[];
  isLoading: boolean;
  isError: boolean;
  onRecipeClick: (recipe: Recipe) => void;
}

const RecipeDisplaySection: React.FC<RecipeDisplaySectionProps> = ({
  recipes,
  isLoading,
  isError,
  onRecipeClick
}) => {
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading recipes...</p>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Error loading recipes. Please try again later.</p>
      </div>
    );
  }
  
  if (recipes && recipes.length > 0) {
    return (
      <>
        <TrendingRecipes recipes={recipes.slice(0, 5)} onRecipeClick={onRecipeClick} />
        
        <div className="mb-8">
          <h2 className="font-mono text-xl uppercase tracking-tight mb-4">Your Recipes</h2>
          <RecipeGrid recipes={recipes} onRecipeClick={onRecipeClick} />
        </div>
      </>
    );
  }
  
  return (
    <div className="text-center py-12">
      <p className="text-muted-foreground mb-4">
        No recipes found. Extract your first recipe from a URL!
      </p>
    </div>
  );
};

export default RecipeDisplaySection;
