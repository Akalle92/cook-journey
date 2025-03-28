
import React from 'react';
import { TrendingUp } from 'lucide-react';
import { Recipe } from './RecipeCard';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useToast } from '@/hooks/use-toast';

interface TrendingRecipesProps {
  recipes: Recipe[];
  onRecipeClick: (recipe: Recipe) => void;
}

const TrendingRecipes: React.FC<TrendingRecipesProps> = ({ recipes, onRecipeClick }) => {
  const { toast } = useToast();

  if (recipes.length === 0) return null;

  return (
    <div className="mb-8 animate-diagonal-slide">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="text-coral h-5 w-5" />
        <h2 className="font-mono text-xl uppercase tracking-tight">Trending Recipes</h2>
      </div>
      
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex space-x-4 pb-2">
          {recipes.map((recipe) => (
            <div 
              key={recipe.id} 
              className="glass w-60 flex-shrink-0 cursor-pointer overflow-hidden group"
              onClick={() => onRecipeClick(recipe)}
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
                <h3 className="font-serif font-bold line-clamp-1">{recipe.title}</h3>
                <p className="text-xs text-offwhite/70 mt-1">{recipe.prepTime} • {recipe.difficulty}</p>
              </div>
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default TrendingRecipes;
