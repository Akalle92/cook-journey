import React, { useState } from 'react';
import { Timer, Plus, Minus, PrinterIcon, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Recipe } from '@/components/RecipeCard';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

interface RecipeContentProps {
  recipe: Recipe;
}

const RecipeContent: React.FC<RecipeContentProps> = ({ recipe }) => {
  const [activeTab, setActiveTab] = useState<'ingredients' | 'instructions'>('ingredients');
  const [servings, setServings] = useState<number>(4); // Default serving size
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const { toast } = useToast();
  
  const handleServingAdjustment = (increment: boolean) => {
    if (increment && servings < 12) {
      setServings(servings + 1);
    } else if (!increment && servings > 1) {
      setServings(servings - 1);
    }
  };
  
  const handlePrint = () => {
    toast({
      title: "Print Recipe",
      description: "Preparing print-friendly version...",
    });
    window.print();
  };
  
  const toggleStepCompletion = (index: number) => {
    if (completedSteps.includes(index)) {
      setCompletedSteps(completedSteps.filter(step => step !== index));
    } else {
      setCompletedSteps([...completedSteps, index]);
    }
  };
  
  // Calculate progress percentage
  const progressPercentage = recipe.instructions && recipe.instructions.length > 0
    ? (completedSteps.length / recipe.instructions.length) * 100
    : 0;
  
  return (
    <>
      <div className="px-6 pb-2 sticky top-0 bg-charcoal/80 backdrop-blur-lg z-10">
        <div className="flex justify-between items-center">
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
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-offwhite/70 hover:text-offwhite"
              onClick={handlePrint}
            >
              <PrinterIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {activeTab === 'instructions' && (
          <div className="pt-2 pb-3">
            <div className="flex justify-between items-center text-xs text-offwhite/70 mb-1">
              <span>Progress</span>
              <span>{completedSteps.length} of {recipe.instructions.length} steps</span>
            </div>
            <Progress value={progressPercentage} className="h-1.5" />
          </div>
        )}
      </div>
      
      <div className="flex-1 overflow-auto px-6 py-4">
        {activeTab === 'ingredients' ? (
          <IngredientsTab 
            ingredients={recipe.ingredients} 
            servings={servings}
            onServingAdjustment={handleServingAdjustment}
          />
        ) : (
          <InstructionsTab 
            instructions={recipe.instructions} 
            prepTime={recipe.prepTime}
            completedSteps={completedSteps}
            onStepToggle={toggleStepCompletion}
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
  servings: number;
  onServingAdjustment: (increment: boolean) => void;
}

const IngredientsTab: React.FC<IngredientsTabProps> = ({ ingredients, servings, onServingAdjustment }) => {
  // Extract and format ingredients with better parsing logic
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
      
      // Try to extract the quantity part
      const quantityMatch = cleaned.match(/^([\d\.\/\s]+)(\s+)([^\s]+)?/);
      if (quantityMatch) {
        // We'll keep the original ingredient text but highlight the parts
        return {
          fullText: cleaned,
          hasQuantity: true
        };
      }
      
      return {
        fullText: cleaned,
        hasQuantity: false
      };
    });
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-sm uppercase text-offwhite/70">Servings</h3>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 rounded-full"
            onClick={() => onServingAdjustment(false)}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="text-lg font-mono">{servings}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 rounded-full"
            onClick={() => onServingAdjustment(true)}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      <ul className="space-y-3 font-mono">
        {formattedIngredients && formattedIngredients.length > 0 ? (
          formattedIngredients.map((ingredient, index) => (
            <li key={index} className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 mt-2 bg-coral rounded-full" />
              <span className={ingredient.hasQuantity ? 'font-medium' : ''}>
                {ingredient.fullText}
              </span>
            </li>
          ))
        ) : (
          <li className="text-muted-foreground">No ingredients found</li>
        )}
      </ul>
      
      <div className="text-xs text-offwhite/50 p-3 glass rounded-lg">
        <p>Ingredient quantities are approximate. Adjust to your taste preferences.</p>
      </div>
    </div>
  );
};

interface InstructionsTabProps {
  instructions: string[];
  prepTime?: string;
  completedSteps: number[];
  onStepToggle: (index: number) => void;
  onTimerClick: () => void;
}

const InstructionsTab: React.FC<InstructionsTabProps> = ({ 
  instructions, 
  prepTime, 
  completedSteps,
  onStepToggle,
  onTimerClick 
}) => {
  // Format instructions with enhanced parsing and cleaning
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
  
  // Extract cooking time from prep time with improved parsing
  const getCookingTime = () => {
    if (!prepTime) return '30 min';
    
    if (typeof prepTime === 'string') {
      const timeMatch = prepTime.match(/\d+/);
      if (timeMatch) {
        return `${timeMatch[0]} minutes`;
      }
    } else if (typeof prepTime === 'number') {
      return `${prepTime} minutes`;
    }
    
    return '30 minutes';
  };
  
  return (
    <ol className="space-y-6">
      {formattedInstructions && formattedInstructions.length > 0 ? (
        formattedInstructions.map((instruction, index) => {
          const isCompleted = completedSteps.includes(index);
          
          return (
            <li key={index} className="flex gap-3">
              <button 
                onClick={() => onStepToggle(index)}
                className={`flex-shrink-0 ${isCompleted ? 'bg-teal/20' : 'bg-muted'} w-8 h-8 font-mono text-teal flex items-center justify-center rounded-full transition-colors hover:bg-teal/30`}
                aria-label={isCompleted ? `Mark step ${index + 1} as incomplete` : `Mark step ${index + 1} as complete`}
              >
                {index + 1}
              </button>
              <div className="flex-1">
                <p className={isCompleted ? 'text-offwhite/50 line-through' : ''}>{instruction}</p>
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
          );
        })
      ) : (
        <li className="text-muted-foreground">No instructions found</li>
      )}
      
      <div className="text-xs text-offwhite/50 p-3 glass rounded-lg">
        <p>For best results, read all instructions before starting. Preparation is key to success!</p>
      </div>
    </ol>
  );
};

export default RecipeContent;
