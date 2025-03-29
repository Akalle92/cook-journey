
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
            prepTime={recipe.prepTime}
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
  // Format ingredients to remove any erratic formatting
  const formattedIngredients = ingredients
    .filter(ingredient => ingredient && ingredient.trim().length > 0)
    .map(ingredient => {
      // Clean up whitespace and formatting issues
      let cleaned = ingredient.trim();
      
      // Capitalize first letter if it's not
      if (cleaned && cleaned.length > 0) {
        cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
      }
      
      // Make sure there's no double spaces
      cleaned = cleaned.replace(/\s\s+/g, ' ');
      
      return cleaned;
    });
  
  return (
    <ul className="space-y-3 font-mono">
      {formattedIngredients && formattedIngredients.length > 0 ? (
        formattedIngredients.map((ingredient, index) => (
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
  prepTime?: string;
  onTimerClick: () => void;
}

const InstructionsTab: React.FC<InstructionsTabProps> = ({ instructions, prepTime, onTimerClick }) => {
  // Format instructions to remove any erratic formatting
  const formattedInstructions = instructions
    .filter(instruction => instruction && instruction.trim().length > 0)
    .map(instruction => {
      // Clean up whitespace and formatting issues
      let cleaned = instruction.trim();
      
      // Capitalize first letter if it's not
      if (cleaned && cleaned.length > 0) {
        cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
      }
      
      // Make sure there's a period at the end if missing
      if (cleaned && !cleaned.endsWith('.') && !cleaned.endsWith('!') && !cleaned.endsWith('?')) {
        cleaned += '.';
      }
      
      // Make sure there's no double spaces
      cleaned = cleaned.replace(/\s\s+/g, ' ');
      
      return cleaned;
    });
  
  // Extract cooking time from prep time
  const getCookingTime = () => {
    if (!prepTime) return '30 min';
    
    const timeMatch = prepTime.match(/\d+/);
    if (timeMatch) {
      return `${timeMatch[0]} minutes`;
    }
    
    return '30 minutes';
  };
  
  return (
    <ol className="space-y-6">
      {formattedInstructions && formattedInstructions.length > 0 ? (
        formattedInstructions.map((instruction, index) => (
          <li key={index} className="flex gap-3">
            <div className="flex-shrink-0 bg-muted w-8 h-8 font-mono text-teal flex items-center justify-center rounded-full">
              {index + 1}
            </div>
            <div className="flex-1">
              <p>{instruction}</p>
              {((typeof instruction === 'string' && instruction.toLowerCase().includes('minute')) ||
                (index === formattedInstructions.length - 1)) && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 text-xs text-teal border-teal/30 hover:bg-teal/10 flex items-center gap-1.5"
                  onClick={onTimerClick}
                >
                  <Timer className="h-3 w-3" /> Set Timer ({getCookingTime()})
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
