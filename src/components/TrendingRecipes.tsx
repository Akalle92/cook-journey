
import React, { useState } from 'react';
import { TrendingUp, Star } from 'lucide-react';
import { Recipe } from './RecipeCard';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useToast } from '@/hooks/use-toast';
import { GlassCard } from '@/components/ui/glass-card';
import { useBackground } from '@/components/BackgroundSystem/BackgroundContext';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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

// Map categories to material textures
const categoryToMaterial = {
  'Italian': 'material-marble',
  'Mediterranean': 'material-marble',
  'Japanese': 'material-ceramic',
  'Thai': 'material-ceramic', 
  'Chinese': 'material-ceramic',
  'Mexican': 'material-wood',
  'Indian': 'material-wood',
  'Nordic': 'material-wood',
  'Scandinavian': 'material-wood',
  // Default handled in component
};

const TrendingRecipes: React.FC<TrendingRecipesProps> = ({ recipes, onRecipeClick }) => {
  const { toast } = useToast();
  const { setCuisineType } = useBackground();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (recipes.length === 0) return null;

  // Get material class based on category
  const getMaterialClass = (category: string) => {
    return categoryToMaterial[category as keyof typeof categoryToMaterial] || 'material-ceramic';
  };

  // Set the cuisine type based on the recipe category when hovering over card
  const handleMouseEnter = (recipe: Recipe) => {
    const cuisineType = (categoryToCuisine[recipe.category as keyof typeof categoryToCuisine] || 'default') as any;
    setCuisineType(cuisineType);
    setHoveredId(recipe.id);
  };

  const handleMouseLeave = () => {
    setHoveredId(null);
  };

  // Get difficulty color
  const getDifficultyClass = (difficulty: string) => {
    switch(difficulty) {
      case 'Easy': return 'bg-emerald/20 text-emerald';
      case 'Medium': return 'bg-amber/20 text-amber';
      case 'Hard': return 'bg-coral/20 text-coral';
      default: return 'bg-teal/20 text-teal';
    }
  };

  return (
    <div className="mb-8 animate-diagonal-slide">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="text-coral h-5 w-5" />
        <h2 className="font-clash text-xl uppercase tracking-tight">Trending Recipes</h2>
      </div>
      
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex space-x-5 pb-4">
          {recipes.map((recipe) => (
            <GlassCard 
              key={recipe.id} 
              className={cn(
                "w-64 flex-shrink-0 overflow-hidden",
                getMaterialClass(recipe.category),
                hoveredId === recipe.id ? "shadow-card-hover transform scale-[1.02]" : "shadow-card",
                "transition-all duration-300"
              )}
              onClick={() => onRecipeClick(recipe)}
              onMouseEnter={() => handleMouseEnter(recipe)}
              onMouseLeave={handleMouseLeave}
              interactive={true}
              intensity="medium"
              accentPosition="bottom"
            >
              <div className="relative h-40 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal to-transparent z-10" />
                <img 
                  src={recipe.image} 
                  alt={recipe.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <Badge className="absolute top-3 right-3 z-20 bg-charcoal/70 backdrop-blur-sm text-offwhite font-mono text-xs">
                  {recipe.category}
                </Badge>
                <div className="absolute bottom-3 right-3 z-20 flex items-center">
                  <div className="flex items-center bg-charcoal/70 backdrop-blur-sm px-1.5 py-0.5 rounded text-xs font-mono">
                    <Star className="h-3 w-3 text-gold mr-1 fill-gold" />
                    <span>4.8</span>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-clash font-bold line-clamp-1 transition-all duration-300 group-hover:text-gradient">{recipe.title}</h3>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs font-mono text-offwhite/70">{recipe.prepTime}</p>
                  <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${getDifficultyClass(recipe.difficulty)}`}>
                    {recipe.difficulty}
                  </span>
                </div>
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
