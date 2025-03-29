
import React from 'react';
import { Clock, Utensils, ChefHat } from 'lucide-react';
import { Recipe } from '@/components/RecipeCard';

interface RecipeMetadataProps {
  recipe: Recipe;
}

const RecipeMetadata: React.FC<RecipeMetadataProps> = ({ recipe }) => {
  return (
    <div className="flex items-center gap-4 mt-4 text-sm text-offwhite/70">
      <div className="flex items-center gap-1.5">
        <Clock className="h-4 w-4 text-coral" />
        <span>{recipe.prepTime}</span>
      </div>
      
      <div className="flex items-center gap-1.5">
        <Utensils className="h-4 w-4 text-purple" />
        <span>{recipe.ingredients?.length || 0} ingredients</span>
      </div>
      
      <div className="flex items-center gap-1.5">
        <ChefHat className="h-4 w-4 text-teal" />
        <span>{recipe.difficulty}</span>
      </div>
    </div>
  );
};

export default RecipeMetadata;
