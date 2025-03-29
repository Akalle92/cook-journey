
import React, { useState } from 'react';
import { Clock, Utensils, ChefHat, Star, Heart, Share2, BookmarkIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { GlassCard, GlassCardContent } from '@/components/ui/glass-card';
import { useBackground } from '@/components/BackgroundSystem/BackgroundContext';
import { cn } from '@/lib/utils';
import RecipeImage from '@/components/RecipeImage';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

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
  const [isSaved, setIsSaved] = useState(false);
  const { toast } = useToast();
  
  // Set the cuisine type based on the recipe category when hovering over card
  const handleMouseEnter = () => {
    const cuisineType = (categoryToCuisine[recipe.category as keyof typeof categoryToCuisine] || 'default') as any;
    setCuisineType(cuisineType);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // Handle save/bookmark action
  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
    toast({
      title: isSaved ? "Recipe Removed" : "Recipe Saved",
      description: isSaved ? "Recipe removed from your collection" : "Recipe saved to your collection",
      variant: "default",
    });
  };
  
  // Handle share action
  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast({
      title: "Share Recipe",
      description: "Sharing functionality will be available in the next update!",
      variant: "default",
    });
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

  // Format ingredients count with improved validation
  const getIngredientsCount = () => {
    return recipe.ingredients?.filter(item => item && item.trim().length > 0).length || 0;
  };

  // Format prep time to be more readable with better parsing
  const getFormattedPrepTime = () => {
    if (!recipe.prepTime) return '30 min';
    
    // Handle string format
    if (typeof recipe.prepTime === 'string') {
      // If it's already formatted with time units, return as is
      if (recipe.prepTime.toLowerCase().includes('min') || 
          recipe.prepTime.toLowerCase().includes('hour')) {
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
            ? `${hours}h ${remainingMinutes}m` 
            : `${hours}h`;
        }
        
        return `${minutes}m`;
      }
    }
    
    // Handle numeric format
    if (typeof recipe.prepTime === 'number') {
      const minutes = recipe.prepTime;
      if (minutes >= 60) {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return remainingMinutes > 0 
          ? `${hours}h ${remainingMinutes}m` 
          : `${hours}h`;
      }
      return `${minutes}m`;
    }
    
    return recipe.prepTime;
  };

  // Get the extraction confidence display
  const getConfidenceIndicator = () => {
    if (recipe.confidence) {
      if (recipe.confidence >= 0.8) return { color: 'bg-green-500/20', label: 'High' };
      if (recipe.confidence >= 0.5) return { color: 'bg-amber-500/20', label: 'Medium' };
      return { color: 'bg-red-500/20', label: 'Low' };
    }
    return null;
  };
  
  const confidenceInfo = getConfidenceIndicator();

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
          priority={false}
        />
        <Badge className="absolute top-3 left-3 z-20 bg-gradient-primary text-charcoal font-mono text-xs">
          {recipe.category}
        </Badge>
        
        {confidenceInfo && (
          <Badge className={`absolute top-3 right-3 z-20 ${confidenceInfo.color} text-charcoal font-mono text-xs`}>
            {confidenceInfo.label} Confidence
          </Badge>
        )}
        
        {/* Quick action buttons that appear on hover */}
        <div className={`absolute right-3 bottom-3 z-20 flex items-center gap-1.5 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <Button
            variant="ghost" 
            size="icon"
            className="h-8 w-8 rounded-full bg-charcoal/60 backdrop-blur-sm text-offwhite hover:bg-charcoal/80"
            onClick={handleSave}
          >
            <BookmarkIcon className={`h-4 w-4 ${isSaved ? 'fill-teal text-teal' : ''}`} />
          </Button>
          <Button
            variant="ghost" 
            size="icon"
            className="h-8 w-8 rounded-full bg-charcoal/60 backdrop-blur-sm text-offwhite hover:bg-charcoal/80"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="absolute bottom-3 left-3 z-20 flex items-center">
          <div className="flex items-center bg-charcoal/70 backdrop-blur-sm px-1.5 py-0.5 rounded text-xs font-mono">
            <Star className="h-3 w-3 text-gold mr-1 fill-gold" />
            <span>4.5</span>
          </div>
        </div>
      </div>
      
      <GlassCardContent className="p-4">
        <h3 className="font-clash text-xl font-bold mb-2 line-clamp-2 transition-all duration-300 group-hover:text-gradient">{recipe.title}</h3>
        
        <div className="flex items-center gap-3 text-xs font-mono text-offwhite/70 mt-4">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-charcoal/20">
            <Clock className="h-4 w-4 text-coral transition-transform duration-300 group-hover:scale-110" />
            <span>{getFormattedPrepTime()}</span>
          </div>
          
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-charcoal/20">
            <Utensils className="h-4 w-4 text-purple transition-transform duration-300 group-hover:scale-110" />
            <span>{getIngredientsCount()}</span>
          </div>
          
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-charcoal/20">
            <ChefHat className={`h-4 w-4 transition-transform duration-300 group-hover:scale-110 ${getDifficultyColor()}`} />
            <span className={getDifficultyColor()}>{recipe.difficulty}</span>
          </div>
        </div>
      </GlassCardContent>
    </GlassCard>
  );
};

export default RecipeCard;
