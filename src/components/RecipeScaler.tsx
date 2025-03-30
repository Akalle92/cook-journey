import React, { useState } from 'react';
import { Recipe } from '@/types/recipe';
import { scaleRecipe, formatTime } from '@/utils/recipeScaler';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Minus } from 'lucide-react';

interface RecipeScalerProps {
  recipe: Recipe;
  onScale: (scaledRecipe: Recipe) => void;
}

export const RecipeScaler: React.FC<RecipeScalerProps> = ({ recipe, onScale }) => {
  const [servings, setServings] = useState(recipe.servings);
  const [isScaled, setIsScaled] = useState(false);

  const handleScale = (newServings: number) => {
    setServings(newServings);
    const scaledRecipe = scaleRecipe(recipe, newServings);
    onScale(scaledRecipe as Recipe);
    setIsScaled(true);
  };

  const handleReset = () => {
    setServings(recipe.servings);
    onScale(recipe);
    setIsScaled(false);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Adjust Servings</span>
          {isScaled && (
            <Button variant="outline" size="sm" onClick={handleReset}>
              Reset
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleScale(Math.max(1, servings - 1))}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              type="number"
              min={1}
              value={servings}
              onChange={(e) => handleScale(parseInt(e.target.value) || 1)}
              className="w-20 text-center"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleScale(servings + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Servings</span>
              <span>{servings}</span>
            </div>
            <Slider
              value={[servings]}
              min={1}
              max={50}
              step={1}
              onValueChange={([value]) => handleScale(value)}
              className="w-full"
            />
          </div>
          {isScaled && (
            <div className="text-sm text-muted-foreground">
              <p>Prep time: {formatTime(Number(recipe.prepTime))}</p>
              <p>Cook time: {formatTime(Number(recipe.cookTime))}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}; 