
import React, { useState } from 'react';
import { Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Recipe } from '@/components/RecipeCard';
import { useToast } from '@/hooks/use-toast';

interface RecipeContentProps {
  recipe: Recipe;
}

const RecipeContent: React.FC<RecipeContentProps> = ({ recipe }) => {
  const [activeTab, setActiveTab] = useState<'ingredients' | 'instructions'>('ingredients');
  const { toast } = useToast();
  
  console.log('Recipe content component - instructions:', recipe.instructions);
  
  return (
    <>
      <div className="px-6 pb-2">
        <div className="flex gap-6 font-mono text-sm">
          <button
            className={`pb-2 transition-colors ${activeTab === 'ingredients' ? 'text-teal border-b-2 border-teal' : 'text-muted-foreground hover:text-offwhite'}`}
            onClick={() => setActiveTab('ingredients')}
          >
            INGREDIENTS
          </button>
          <button
            className={`pb-2 transition-colors ${activeTab === 'instructions' ? 'text-teal border-b-2 border-teal' : 'text-muted-foreground hover:text-offwhite'}`}
            onClick={() => setActiveTab('instructions')}
          >
            INSTRUCTIONS
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto px-6 py-4">
        {activeTab === 'ingredients' ? (
          <IngredientsTab ingredients={recipe.ingredients} />
        ) : (
          <InstructionsTab 
            instructions={recipe.instructions} 
            onTimerClick={() => {
              toast({
                title: "Timer",
                description: "Timer feature will be available in the next update!",
                variant: "default",
              });
            }}
          />
        )}
      </div>
    </>
  );
};

interface IngredientsTabProps {
  ingredients: string[];
}

const IngredientsTab: React.FC<IngredientsTabProps> = ({ ingredients }) => {
  return (
    <ul className="space-y-3 font-mono">
      {ingredients && ingredients.length > 0 ? (
        ingredients.map((ingredient, index) => (
          <li key={index} className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 mt-2 bg-coral rounded-full"></div>
            <span>{ingredient}</span>
          </li>
        ))
      ) : (
        <li className="text-muted-foreground">No ingredients found</li>
      )}
    </ul>
  );
};

interface InstructionsTabProps {
  instructions: string[];
  onTimerClick: () => void;
}

const InstructionsTab: React.FC<InstructionsTabProps> = ({ instructions, onTimerClick }) => {
  return (
    <ol className="space-y-6">
      {instructions && instructions.length > 0 ? (
        instructions.map((instruction, index) => (
          <li key={index} className="flex gap-3">
            <div className="flex-shrink-0 bg-muted w-8 h-8 font-mono text-teal flex items-center justify-center">
              {index + 1}
            </div>
            <div>
              <p>{instruction}</p>
              {typeof instruction === 'string' && instruction.toLowerCase().includes('minute') && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 text-xs text-teal border-teal/30 hover:bg-teal/10 flex items-center gap-1.5"
                  onClick={onTimerClick}
                >
                  <Timer className="h-3 w-3" /> Set Timer
                </Button>
              )}
            </div>
          </li>
        ))
      ) : (
        <li className="text-muted-foreground">No instructions found</li>
      )}
    </ol>
  );
};

export default RecipeContent;
