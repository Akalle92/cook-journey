
import React from 'react';
import RecipeCard, { Recipe } from './RecipeCard';

interface RecipeGridProps {
  recipes: Recipe[];
  onRecipeClick: (recipe: Recipe) => void;
}

const RecipeGrid: React.FC<RecipeGridProps> = ({ recipes, onRecipeClick }) => {
  if (recipes.length === 0) {
    return (
      <div className="glass p-6 text-center">
        <p className="text-muted-foreground">No recipes yet. Extract your first recipe from Instagram!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {recipes.map((recipe) => (
        <RecipeCard 
          key={recipe.id} 
          recipe={recipe} 
          onClick={onRecipeClick}
        />
      ))}
    </div>
  );
};

export default RecipeGrid;
