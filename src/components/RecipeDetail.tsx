import React, { useState } from 'react';
import { Recipe } from '@/types/recipe';
import { RecipeScaler } from './RecipeScaler';
import { RecipeShare } from './RecipeShare';
import { RecipePrint } from './RecipePrint';
import { RecipeImporter } from './RecipeImporter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Users, ChefHat, Utensils, Tag, AlertCircle, X } from 'lucide-react';

interface RecipeDetailProps {
  recipe: Recipe;
  onClose: () => void;
}

export const RecipeDetail: React.FC<RecipeDetailProps> = ({ recipe, onClose }) => {
  const [displayedRecipe, setDisplayedRecipe] = useState(recipe);

  const handleScale = (scaledRecipe: Recipe) => {
    setDisplayedRecipe(scaledRecipe);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-2">
              <RecipeShare recipe={displayedRecipe} />
              <RecipePrint recipe={displayedRecipe} />
              <RecipeImporter onImport={(importedRecipe) => {
                // Handle imported recipe
                console.log('Imported recipe:', importedRecipe);
              }} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Recipe Image */}
            {displayedRecipe.imageUrl && (
              <div className="relative aspect-video rounded-lg overflow-hidden">
                <img
                  src={displayedRecipe.imageUrl}
                  alt={displayedRecipe.title}
                  className="object-cover w-full h-full"
                />
              </div>
            )}

            {/* Recipe Scaler */}
            <RecipeScaler recipe={displayedRecipe} onScale={handleScale} />

            {/* Recipe Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Prep Time</p>
                  <p className="font-medium">{displayedRecipe.prepTime}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Utensils className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Cook Time</p>
                  <p className="font-medium">{displayedRecipe.cookTime}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Servings</p>
                  <p className="font-medium">{displayedRecipe.servings}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ChefHat className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Difficulty</p>
                  <p className="font-medium capitalize">{displayedRecipe.difficulty}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            {displayedRecipe.description && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">{displayedRecipe.description}</p>
              </div>
            )}

            {/* Ingredients */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Ingredients</h3>
              <ul className="space-y-2">
                {displayedRecipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="text-muted-foreground">•</span>
                    <span>{ingredient}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Instructions */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Instructions</h3>
              <ol className="space-y-4">
                {displayedRecipe.instructions.map((instruction, index) => (
                  <li key={index} className="flex gap-4">
                    <span className="font-semibold text-muted-foreground">{index + 1}.</span>
                    <span>{instruction}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Tags */}
            {displayedRecipe.tags.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {displayedRecipe.tags.map((tag, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 bg-muted px-2 py-1 rounded-full text-sm"
                    >
                      <Tag className="h-3 w-3" />
                      <span>{tag}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dietary Restrictions */}
            {displayedRecipe.dietaryRestrictions.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Dietary Restrictions</h3>
                <div className="flex flex-wrap gap-2">
                  {displayedRecipe.dietaryRestrictions.map((restriction, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 bg-destructive/10 text-destructive px-2 py-1 rounded-full text-sm"
                    >
                      <AlertCircle className="h-3 w-3" />
                      <span>{restriction}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 