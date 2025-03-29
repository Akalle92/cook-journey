
import React from 'react';
import { Clock, Utensils, ChefHat } from 'lucide-react';
import { Recipe } from '@/components/RecipeCard';

interface RecipeMetadataProps {
  recipe: Recipe;
}

const RecipeMetadata: React.FC<RecipeMetadataProps> = ({ recipe }) => {
  // Format ingredients count
  const getIngredientsCount = () => {
    return recipe.ingredients?.filter(item => item && item.trim().length > 0).length || 0;
  };

  // Format prep time to be more readable
  const getFormattedPrepTime = () => {
    if (!recipe.prepTime) return '30 min';
    
    // If it's already formatted with 'min', return as is
    if (recipe.prepTime.toLowerCase().includes('min')) {
      return recipe.prepTime;
    }
    
    // Extract numbers from the string
    const timeMatch = recipe.prepTime.match(/\d+/);
    if (timeMatch) {
      return `${timeMatch[0]} min`;
    }
    
    return recipe.prepTime;
  };

  return (
    <div className="flex items-center gap-4 mt-4 text-sm text-offwhite/70">
      <div className="flex items-center gap-1.5">
        <Clock className="h-4 w-4 text-coral" />
        <span>{getFormattedPrepTime()}</span>
      </div>
      
      <div className="flex items-center gap-1.5">
        <Utensils className="h-4 w-4 text-purple" />
        <span>{getIngredientsCount()} ingredients</span>
      </div>
      
      <div className="flex items-center gap-1.5">
        <ChefHat className="h-4 w-4 text-teal" />
        <span>{recipe.difficulty}</span>
      </div>
    </div>
  );
};

export default RecipeMetadata;
