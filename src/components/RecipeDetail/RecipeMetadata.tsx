
import React from 'react';
import { Clock, Utensils, ChefHat, Star, TagIcon } from 'lucide-react';
import { Recipe } from '@/components/RecipeCard';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';

interface RecipeMetadataProps {
  recipe: Recipe;
}

const RecipeMetadata: React.FC<RecipeMetadataProps> = ({ recipe }) => {
  // Format ingredients count with validation
  const getIngredientsCount = () => {
    const nonEmptyIngredients = recipe.ingredients?.filter(item => item && item.trim().length > 0) || [];
    return nonEmptyIngredients.length;
  };

  // Format prep time with better validation and parsing
  const getFormattedPrepTime = () => {
    if (!recipe.prepTime) return '30 min'; // Default fallback
    
    // Handle cases where prepTime is already formatted
    if (typeof recipe.prepTime === 'string') {
      // If it's already formatted with time units, return as is
      if (recipe.prepTime.toLowerCase().includes('min') || 
          recipe.prepTime.toLowerCase().includes('hour') ||
          recipe.prepTime.toLowerCase().includes('hr')) {
        return recipe.prepTime;
      }
      
      // Extract numbers from the string
      const timeMatch = recipe.prepTime.match(/\d+/);
      if (timeMatch) {
        const minutes = parseInt(timeMatch[0], 10);
        
        // Format time appropriately based on length
        if (minutes >= 60) {
          const hours = Math.floor(minutes / 60);
          const remainingMinutes = minutes % 60;
          return remainingMinutes > 0 
            ? `${hours} hr ${remainingMinutes} min` 
            : `${hours} hr`;
        }
        
        return `${minutes} min`;
      }
    }
    
    // If a number was passed directly
    if (typeof recipe.prepTime === 'number') {
      const minutes = recipe.prepTime;
      if (minutes >= 60) {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return remainingMinutes > 0 
          ? `${hours} hr ${remainingMinutes} min` 
          : `${hours} hr`;
      }
      return `${minutes} min`;
    }
    
    return recipe.prepTime;
  };

  // Get difficulty class for visual styling
  const getDifficultyColor = () => {
    switch(recipe.difficulty) {
      case 'Easy': return 'text-emerald';
      case 'Medium': return 'text-amber';
      case 'Hard': return 'text-coral';
      default: return 'text-teal';
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-offwhite/70">
      <HoverCard>
        <HoverCardTrigger asChild>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-charcoal/20 backdrop-blur-sm rounded-full cursor-help transition-colors hover:bg-charcoal/30">
            <Clock className="h-4 w-4 text-coral" />
            <span>{getFormattedPrepTime()}</span>
          </div>
        </HoverCardTrigger>
        <HoverCardContent className="w-64 glass">
          <div className="flex flex-col gap-1">
            <h4 className="text-sm font-semibold">Prep & Cook Time</h4>
            <p className="text-xs">This is the total time needed to prepare and cook this recipe.</p>
          </div>
        </HoverCardContent>
      </HoverCard>
      
      <HoverCard>
        <HoverCardTrigger asChild>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-charcoal/20 backdrop-blur-sm rounded-full cursor-help transition-colors hover:bg-charcoal/30">
            <Utensils className="h-4 w-4 text-purple" />
            <span>{getIngredientsCount()} ingredients</span>
          </div>
        </HoverCardTrigger>
        <HoverCardContent className="w-64 glass">
          <div className="flex flex-col gap-1">
            <h4 className="text-sm font-semibold">Ingredient Count</h4>
            <p className="text-xs">Total number of unique ingredients required for this recipe.</p>
          </div>
        </HoverCardContent>
      </HoverCard>
      
      <HoverCard>
        <HoverCardTrigger asChild>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-charcoal/20 backdrop-blur-sm rounded-full cursor-help transition-colors hover:bg-charcoal/30">
            <ChefHat className={`h-4 w-4 ${getDifficultyColor()}`} />
            <span className={getDifficultyColor()}>{recipe.difficulty}</span>
          </div>
        </HoverCardTrigger>
        <HoverCardContent className="w-64 glass">
          <div className="flex flex-col gap-1">
            <h4 className="text-sm font-semibold">Recipe Difficulty</h4>
            <p className="text-xs">Difficulty is calculated based on preparation time, number of ingredients, and complexity of techniques.</p>
          </div>
        </HoverCardContent>
      </HoverCard>
      
      {recipe.category && (
        <HoverCard>
          <HoverCardTrigger asChild>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-charcoal/20 backdrop-blur-sm rounded-full cursor-help transition-colors hover:bg-charcoal/30">
              <TagIcon className="h-4 w-4 text-teal" />
              <span>{recipe.category}</span>
            </div>
          </HoverCardTrigger>
          <HoverCardContent className="w-64 glass">
            <div className="flex flex-col gap-1">
              <h4 className="text-sm font-semibold">Cuisine Category</h4>
              <p className="text-xs">This recipe belongs to the {recipe.category} cuisine tradition.</p>
            </div>
          </HoverCardContent>
        </HoverCard>
      )}
      
      <div className="flex items-center gap-1.5 ml-auto">
        <Star className="h-4 w-4 text-gold fill-gold" />
        <span className="text-gold">4.8</span>
      </div>
    </div>
  );
};

export default RecipeMetadata;
