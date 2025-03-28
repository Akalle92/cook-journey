
import React from 'react';
import { Clock, Utensils, ChefHat } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

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

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onClick }) => {
  return (
    <Card 
      className="glass w-full overflow-hidden group cursor-pointer hover:scale-[1.02] transition-all duration-300"
      onClick={() => onClick(recipe)}
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
      
      <CardContent className="p-4">
        <h3 className="font-serif text-xl font-bold mb-2 line-clamp-2">{recipe.title}</h3>
        
        <div className="flex items-center gap-3 text-sm text-offwhite/70 mt-4">
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-coral" />
            <span>{recipe.prepTime}</span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <Utensils className="h-4 w-4 text-purple" />
            <span>{recipe.ingredients.length} ingredients</span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <ChefHat className="h-4 w-4 text-teal" />
            <span>{recipe.difficulty}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecipeCard;
