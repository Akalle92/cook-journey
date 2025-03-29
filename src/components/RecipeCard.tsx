
import React, { useState } from 'react';
import { Clock, Utensils, ChefHat, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { GlassCard, GlassCardContent } from '@/components/ui/glass-card';
import { useBackground } from '@/components/BackgroundSystem/BackgroundContext';
import { cn } from '@/lib/utils';
import RecipeImage from '@/components/RecipeImage';

export interface ExtractionMethod {
  method: string;
  success: boolean;
  confidence?: number;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  data?: any;
}

export interface Recipe {
  id: string;
  title: string;
  image: string;
  category: string;
  prepTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  ingredients: string[];
  instructions: string[];
  
  // Additional properties for extraction and debugging
  method?: string;
  confidence?: number;
  extractionResults?: ExtractionMethod[];
  debugInfo?: any;
  // For API responses
  data?: any;
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

// Map difficulty to accent positions
const difficultyToAccent: Record<string, "bottom" | "left" | "top" | "right" | "none"> = {
  'Easy': 'bottom',
  'Medium': 'left',
  'Hard': 'top',
};

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onClick }) => {
  const { setCuisineType } = useBackground();
  const [isHovered, setIsHovered] = useState(false);
  
  // Set the cuisine type based on the recipe category when hovering over card
  const handleMouseEnter = () => {
    const cuisineType = (categoryToCuisine[recipe.category as keyof typeof categoryToCuisine] || 'default') as any;
    setCuisineType(cuisineType);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // Get accent position based on difficulty
  const getAccentPosition = (): "bottom" | "left" | "top" | "right" | "none" => {
    return difficultyToAccent[recipe.difficulty] || 'none';
  };

  // Get material class based on category
  const getMaterialClass = () => {
    return categoryToMaterial[recipe.category as keyof typeof categoryToMaterial] || 'material-ceramic';
  };

  // Get difficulty color
  const getDifficultyColor = () => {
    switch(recipe.difficulty) {
      case 'Easy': return 'text-emerald';
      case 'Medium': return 'text-amber';
      case 'Hard': return 'text-coral';
      default: return 'text-teal';
    }
  };

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
    <GlassCard 
      className={cn(
        "w-full overflow-hidden group transition-all duration-500",
        getMaterialClass(),
        isHovered ? "shadow-card-hover transform scale-[1.02]" : "shadow-card"
      )}
      onClick={() => onClick(recipe)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      interactive={true}
      accentPosition={getAccentPosition()}
    >
      <div className="relative h-48 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal to-transparent z-10" />
        <RecipeImage 
          src={recipe.image} 
          alt={recipe.title} 
          className="w-full h-full object-cover"
          withZoomEffect={true}
        />
        <Badge className="absolute top-3 right-3 z-20 bg-gradient-primary text-charcoal font-mono text-xs">
          {recipe.category}
        </Badge>
        <div className="absolute bottom-3 right-3 z-20 flex items-center">
          <div className="flex items-center bg-charcoal/70 backdrop-blur-sm px-1.5 py-0.5 rounded text-xs font-mono">
            <Star className="h-3 w-3 text-gold mr-1 fill-gold" />
            <span>4.5</span>
          </div>
        </div>
      </div>
      
      <GlassCardContent className="p-4">
        <h3 className="font-clash text-xl font-bold mb-2 line-clamp-2 transition-all duration-300 group-hover:text-gradient">{recipe.title}</h3>
        
        <div className="flex items-center gap-3 text-xs font-mono text-offwhite/70 mt-4">
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-coral transition-transform duration-300 group-hover:scale-110" />
            <span>{getFormattedPrepTime()}</span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <Utensils className="h-4 w-4 text-purple transition-transform duration-300 group-hover:scale-110" />
            <span>{getIngredientsCount()} ingredients</span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <ChefHat className={`h-4 w-4 transition-transform duration-300 group-hover:scale-110 ${getDifficultyColor()}`} />
            <span className={getDifficultyColor()}>{recipe.difficulty}</span>
          </div>
        </div>
      </GlassCardContent>
    </GlassCard>
  );
};

export default RecipeCard;
