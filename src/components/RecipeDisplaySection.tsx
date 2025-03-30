
import React from 'react';
import { Recipe } from '@/components/RecipeCard';
import RecipeGrid from '@/components/RecipeGrid';
import { Loader2 } from 'lucide-react';

interface RecipeDisplaySectionProps {
  recipes: Recipe[];
  isLoading: boolean;
  isError: boolean;
  onRecipeClick: (recipe: Recipe) => void;
  emptyMessage?: string;
}

const RecipeDisplaySection: React.FC<RecipeDisplaySectionProps> = ({
  recipes,
  isLoading,
  isError,
  onRecipeClick,
  emptyMessage = "No recipes found. Try extracting one from a URL!"
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading recipes...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-10">
        <p className="text-destructive mb-2">Failed to load recipes</p>
        <p className="text-muted-foreground">Please try again later</p>
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return <RecipeGrid recipes={recipes} onRecipeClick={onRecipeClick} />;
};

export default RecipeDisplaySection;
