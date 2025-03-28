
import React from 'react';
import { TrendingUp } from 'lucide-react';
import { Recipe } from './RecipeCard';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useToast } from '@/hooks/use-toast';
import { GlassCard } from '@/components/ui/glass-card';
import { useBackground } from '@/components/BackgroundSystem/BackgroundContext';

interface TrendingRecipesProps {
  recipes: Recipe[];
  onRecipeClick: (recipe: Recipe) => void;
}

// Map categories to cuisine types (simplified mapping)
const categoryToCuisine = {
  'Italian': 'italian',
  'Japanese': 'japanese',
  'Mexican': 'mexican',
  'Nordic': 'nordic',
  'Scandinavian': 'nordic',
  'Thai': 'japanese',
  'Chinese': 'japanese',
  'Indian': 'mexican',
  'Mediterranean': 'italian',
  // Default handled in component
};

const TrendingRecipes: React.FC<TrendingRecipesProps> = ({ recipes, onRecipeClick }) => {
  const { toast } = useToast();
  const { setCuisineType } = useBackground();

  if (recipes.length === 0) return null;

  // Set the cuisine type based on the recipe category when hovering over card
  const handleMouseEnter = (recipe: Recipe) => {
    const cuisineType = (categoryToCuisine[recipe.category as keyof typeof categoryToCuisine] || 'default') as any;
    setCuisineType(cuisineType);
  };

  return (
    <div className="mb-8 animate-diagonal-slide">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="text-coral h-5 w-5" />
        <h2 className="font-mono text-xl uppercase tracking-tight">Trending Recipes</h2>
      </div>
      
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex space-x-4 pb-2">
          {recipes.map((recipe) => (
            <GlassCard 
              key={recipe.id} 
              className="w-60 flex-shrink-0 overflow-hidden"
              onClick={() => onRecipeClick(recipe)}
              onMouseEnter={() => handleMouseEnter(recipe)}
              interactive={true}
              intensity="high"
              accentPosition="bottom"
            >
              <div className="relative h-36 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal to-transparent z-10" />
                <img 
                  src={recipe.image} 
                  alt={recipe.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-3">
                <h3 className="font-serif font-bold line-clamp-1 transition-all duration-300 group-hover:text-teal">{recipe.title}</h3>
                <p className="text-xs text-offwhite/70 mt-1">{recipe.prepTime} • {recipe.difficulty}</p>
              </div>
            </GlassCard>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default TrendingRecipes;
