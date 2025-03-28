
import React from 'react';
import { Clock, Utensils, ChefHat } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { GlassCard, GlassCardContent } from '@/components/ui/glass-card';
import { useBackground } from '@/components/BackgroundSystem/BackgroundContext';

export interface Recipe {
  id: string;
  title: string;
  image: string;
  category: string;
  prepTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  ingredients: string[];
  instructions: string[];
}

interface RecipeCardProps {
  recipe: Recipe;
  onClick: (recipe: Recipe) => void;
}

// Map categories to cuisine types (simplified mapping)
const categoryToCuisine = {
  'Italian': 'italian',
  'Japanese': 'japanese',
  'Mexican': 'mexican',
  'Nordic': 'nordic',
  'Scandinavian': 'nordic',
  'Thai': 'japanese',  // Simplification - could be more specific
  'Chinese': 'japanese', // Simplification - could be more specific
  'Indian': 'mexican',  // Simplification based on vibrant colors
  'Mediterranean': 'italian',
  // Default handled in component
};

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onClick }) => {
  const { setCuisineType } = useBackground();
  
  // Set the cuisine type based on the recipe category when hovering over card
  const handleMouseEnter = () => {
    const cuisineType = (categoryToCuisine[recipe.category as keyof typeof categoryToCuisine] || 'default') as any;
    setCuisineType(cuisineType);
  };

  // Get accent position based on difficulty
  const getAccentPosition = () => {
    switch (recipe.difficulty) {
      case 'Easy': return 'bottom';
      case 'Medium': return 'left';
      case 'Hard': return 'top';
      default: return 'none';
    }
  };

  return (
    <GlassCard 
      className="w-full overflow-hidden group"
      onClick={() => onClick(recipe)}
      onMouseEnter={handleMouseEnter}
      interactive={true}
      accentPosition={getAccentPosition()}
    >
      <div className="relative h-48 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal to-transparent z-10" />
        <img 
          src={recipe.image} 
          alt={recipe.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <Badge className="absolute top-3 right-3 z-20 bg-teal text-charcoal font-mono text-xs">
          {recipe.category}
        </Badge>
      </div>
      
      <GlassCardContent className="p-4">
        <h3 className="font-serif text-xl font-bold mb-2 line-clamp-2 transition-all duration-300 group-hover:text-teal">{recipe.title}</h3>
        
        <div className="flex items-center gap-3 text-sm text-offwhite/70 mt-4">
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-coral transition-transform duration-300 group-hover:scale-110" />
            <span>{recipe.prepTime}</span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <Utensils className="h-4 w-4 text-purple transition-transform duration-300 group-hover:scale-110" />
            <span>{recipe.ingredients.length} ingredients</span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <ChefHat className="h-4 w-4 text-teal transition-transform duration-300 group-hover:scale-110" />
            <span>{recipe.difficulty}</span>
          </div>
        </div>
      </GlassCardContent>
    </GlassCard>
  );
};

export default RecipeCard;
