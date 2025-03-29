import React, { useState, useEffect } from 'react';
import { Recipe } from '@/components/RecipeCard';
import { ChevronLeft, ChevronRight, X, BookOpen, ListChecks } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import RecipeImage from '@/components/RecipeImage';

interface CookingModeViewProps {
  recipe: Recipe;
  onClose: () => void;
  onGenerateShoppingList: () => void;
}

const CookingModeView: React.FC<CookingModeViewProps> = ({ 
  recipe, 
  onClose,
  onGenerateShoppingList
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  
  const totalSteps = recipe.instructions.length;
  
  // Keep screen awake during cooking mode
  useEffect(() => {
    const wakeLock = async () => {
      if ('wakeLock' in navigator) {
        try {
          // @ts-ignore - TypeScript doesn't know about wakeLock API yet
          const wakeLock = await navigator.wakeLock.request('screen');
          return wakeLock;
        } catch (err) {
          console.error(`Error requesting wake lock: ${err}`);
        }
      }
      return null;
    };
    
    // Request wake lock
    let lock: any = null;
    wakeLock().then((acquiredLock) => {
      lock = acquiredLock;
    });
    
    // Release wake lock when component unmounts
    return () => {
      if (lock) {
        lock.release().then(() => {
          console.log('Wake lock released');
        });
      }
    };
  }, []);
  
  const goToNextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
      setTimeLeft(null);
    }
  };
  
  const goToPrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setTimeLeft(null);
    }
  };
  
  const toggleInstructionsView = () => {
    setShowInstructions(!showInstructions);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="bg-charcoal p-4 flex items-center justify-between shadow-md">
        <Button variant="ghost" onClick={onClose} className="text-offwhite">
          <X className="h-5 w-5 mr-2" />
          Exit
        </Button>
        <h2 className="text-lg font-bold text-center text-offwhite">{recipe.title}</h2>
        <Button variant="ghost" onClick={onGenerateShoppingList} className="text-offwhite">
          <ListChecks className="h-5 w-5 mr-2" />
          Shopping List
        </Button>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Recipe image */}
        <div className="relative h-48">
          <RecipeImage
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-full object-cover"
            priority={true}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
            <div className="text-white font-mono text-sm">
              Step {currentStep + 1} of {totalSteps}
            </div>
            <Button variant="outline" onClick={toggleInstructionsView} className="h-8 px-2 py-1 bg-charcoal/70 backdrop-blur-sm text-offwhite border-muted">
              <BookOpen className="h-4 w-4 mr-1" />
              {showInstructions ? "Show Ingredients" : "Show Instructions"}
            </Button>
          </div>
        </div>
        
        {/* Instructions or Ingredients */}
        <div className="flex-1 p-4 overflow-y-auto bg-charcoal/90">
          {showInstructions ? (
            <div className="space-y-6">
              <div className="p-4 bg-charcoal/80 backdrop-blur-sm rounded-lg shadow-inner">
                <h3 className="text-2xl font-bold text-offwhite mb-4">Step {currentStep + 1}</h3>
                <p className="text-lg text-offwhite">
                  {recipe.instructions[currentStep]}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-offwhite">Ingredients</h3>
              <ul className="space-y-2">
                {recipe.ingredients.map((ingredient, index) => (
                  <li 
                    key={index} 
                    className={cn(
                      "p-2 rounded-md",
                      "border border-muted text-offwhite"
                    )}
                  >
                    {ingredient}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      
      {/* Navigation Footer */}
      <div className="bg-charcoal p-4 flex items-center justify-between shadow-inner">
        <Button 
          onClick={goToPrevStep} 
          disabled={currentStep === 0}
          className="p-2"
          variant="outline"
        >
          <ChevronLeft className="h-6 w-6" />
          <span className="ml-2">Previous</span>
        </Button>
        
        <div className="text-center text-offwhite font-mono">
          {timeLeft !== null ? (
            <span>{timeLeft}s</span>
          ) : null}
        </div>
        
        <Button 
          onClick={goToNextStep} 
          disabled={currentStep === totalSteps - 1}
          className="p-2"
          variant="default"
        >
          <span className="mr-2">Next</span>
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default CookingModeView;
