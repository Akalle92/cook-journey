
import React, { useState } from 'react';
import { X, ChevronRight, Clock, Utensils, ChefHat, Timer } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Recipe } from './RecipeCard';
import { useToast } from '@/hooks/use-toast';

interface RecipeDetailProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
}

const RecipeDetail: React.FC<RecipeDetailProps> = ({ recipe, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'ingredients' | 'instructions'>('ingredients');
  const { toast } = useToast();
  
  if (!recipe) return null;
  
  const startCooking = () => {
    toast({
      title: "Cooking Mode",
      description: "Cooking mode will be available in the next update!",
      variant: "default",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <div className="relative h-56 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal to-transparent z-10" />
          <img 
            src={recipe.image} 
            alt={recipe.title} 
            className="w-full h-full object-cover"
          />
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-3 right-3 z-20 text-offwhite hover:text-offwhite/80 bg-charcoal/30 backdrop-blur-sm"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
          <Badge className="absolute top-3 left-3 z-20 bg-teal text-charcoal font-mono">
            {recipe.category}
          </Badge>
        </div>
        
        <DialogHeader className="px-6 pt-6 pb-3">
          <DialogTitle className="font-serif text-3xl font-bold">{recipe.title}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {recipe.prepTime} · {recipe.difficulty} difficulty
          </DialogDescription>
          
          <div className="flex items-center gap-4 mt-4 text-sm text-offwhite/70">
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
        </DialogHeader>
        
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
            <ul className="space-y-3 font-mono">
              {recipe.ingredients && recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 mt-2 bg-coral rounded-full"></div>
                  <span>{ingredient}</span>
                </li>
              ))}
            </ul>
          ) : (
            <ol className="space-y-6">
              {recipe.instructions && recipe.instructions.map((instruction, index) => (
                <li key={index} className="flex gap-3">
                  <div className="flex-shrink-0 bg-muted w-8 h-8 font-mono text-teal flex items-center justify-center">
                    {index + 1}
                  </div>
                  <div>
                    <p>{instruction}</p>
                    {instruction.toLowerCase().includes('minute') && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2 text-xs text-teal border-teal/30 hover:bg-teal/10 flex items-center gap-1.5"
                        onClick={() => {
                          toast({
                            title: "Timer",
                            description: "Timer feature will be available in the next update!",
                            variant: "default",
                          });
                        }}
                      >
                        <Timer className="h-3 w-3" /> Set Timer
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
        
        <div className="p-6 border-t border-muted">
          <Button 
            className="cta-button w-full flex items-center justify-center gap-2"
            onClick={startCooking}
          >
            Start Cooking <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RecipeDetail;
