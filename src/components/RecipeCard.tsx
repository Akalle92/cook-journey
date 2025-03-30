import React, { useState, useEffect } from 'react';
import { Clock, Utensils, ChefHat, Star, Heart, Share2, BookmarkIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { GlassCard, GlassCardContent } from '@/components/ui/glass-card';
import { useBackground } from '@/components/BackgroundSystem/BackgroundContext';
import { cn } from '@/lib/utils';
import RecipeImage from '@/components/RecipeImage';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getCategoriesForRecipe } from '@/services/categoryService';
import { Category } from '@/components/RecipeCategories/CategorySelector';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Recipe } from '@/types/recipe';
import { Users } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';

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
const difficultyToAccent: Record<'easy' | 'medium' | 'hard', "bottom" | "left" | "top" | "right" | "none"> = {
  'easy': 'bottom',
  'medium': 'left',
  'hard': 'top',
};

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onClick }) => {
  const { setCuisineType } = useBackground();
  const [isHovered, setIsHovered] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [recipeCategories, setRecipeCategories] = useState<Category[]>([]);
  const { toast } = useToast();
  const { toggleFavorite, checkIsFavorite } = useFavorites();
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categories = await getCategoriesForRecipe(recipe.id);
        if (categories.length > 0) {
          setRecipeCategories(categories);
        }
      } catch (error) {
        console.error("Error fetching recipe categories:", error);
      }
    };
    
    fetchCategories();
  }, [recipe.id]);

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      const isFav = await checkIsFavorite(recipe.id);
      setIsSaved(isFav);
    };
    checkFavoriteStatus();
  }, [recipe.id, checkIsFavorite]);

  const handleMouseEnter = () => {
    const cuisineType = (categoryToCuisine[recipe.category as keyof typeof categoryToCuisine] || 'default') as any;
    setCuisineType(cuisineType);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleFavorite(recipe);
    setIsSaved(!isSaved);
  };
  
  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast({
      title: "Share Recipe",
      description: "Sharing functionality will be available in the next update!",
      variant: "default",
    });
  };

  const getAccentPosition = (): "bottom" | "left" | "top" | "right" | "none" => {
    return difficultyToAccent[recipe.difficulty] || 'none';
  };

  const getMaterialClass = () => {
    return categoryToMaterial[recipe.category as keyof typeof categoryToMaterial] || 'material-ceramic';
  };

  const getDifficultyColor = () => {
    switch (recipe.difficulty) {
      case 'easy':
        return 'text-green-500';
      case 'medium':
        return 'text-yellow-500';
      case 'hard':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getIngredientsCount = () => {
    return recipe.ingredients.length;
  };

  const getFormattedPrepTime = () => {
    const minutes = recipe.prepTime;
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 
        ? `${hours}h ${remainingMinutes}m` 
        : `${hours}h`;
    }
    return `${minutes}m`;
  };

  const getConfidenceIndicator = () => {
    if (recipe.confidence) {
      if (recipe.confidence >= 0.8) return { color: 'bg-green-500/20', label: 'High' };
      if (recipe.confidence >= 0.5) return { color: 'bg-amber-500/20', label: 'Medium' };
      return { color: 'bg-red-500/20', label: 'Low' };
    }
    return null;
  };
  
  const confidenceInfo = getConfidenceIndicator();

  const totalTime = recipe.prepTime + recipe.cookTime;

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onClick(recipe)}>
      <CardHeader>
        <div className="aspect-video relative mb-4 rounded-lg overflow-hidden">
          {recipe.imageUrl ? (
            <img
              src={recipe.imageUrl}
              alt={recipe.title}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <Utensils className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          {recipe.category && (
            <Badge className="absolute top-2 left-2">
              {recipe.category}
            </Badge>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-background/80 hover:bg-background/90"
            onClick={handleSave}
          >
            <Heart className={cn("h-5 w-5", isSaved ? "fill-current text-red-500" : "text-muted-foreground")} />
          </Button>
        </div>
        <CardTitle className="line-clamp-2">{recipe.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {recipe.description}
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {recipe.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{totalTime} min</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{recipe.servings} servings</span>
          </div>
          <div className="flex items-center gap-1">
            <ChefHat className={`h-4 w-4 ${getDifficultyColor()}`} />
            <span className={`capitalize ${getDifficultyColor()}`}>{recipe.difficulty}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          View Recipe
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RecipeCard;
