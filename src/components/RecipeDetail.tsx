
import React, { useState } from 'react';
import { X, ChevronRight, Clock, Utensils, ChefHat, Timer, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Recipe } from './RecipeCard';
import { useToast } from '@/hooks/use-toast';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteRecipe } from '@/services/recipeService';
import { useQueryClient } from '@tanstack/react-query';

interface RecipeDetailProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
}

const RecipeDetail: React.FC<RecipeDetailProps> = ({ recipe, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'ingredients' | 'instructions'>('ingredients');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  if (!recipe) return null;
  
  console.log('Recipe detail component - instructions:', recipe.instructions);
  
  const startCooking = () => {
    toast({
      title: "Cooking Mode",
      description: "Cooking mode will be available in the next update!",
      variant: "default",
    });
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!recipe) return;
    
    setIsDeleting(true);
    try {
      await deleteRecipe(recipe.id);
      
      // Close dialogs and refetch recipes
      setDeleteDialogOpen(false);
      onClose();
      
      // Invalidate the recipes query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      
      toast({
        title: "Recipe Deleted",
        description: "The recipe has been successfully deleted.",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Deletion Failed",
        description: error.message || "Failed to delete recipe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
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
              {recipe.category || 'Uncategorized'}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-12 z-20 text-offwhite hover:text-coral bg-charcoal/30 backdrop-blur-sm"
              onClick={handleDeleteClick}
            >
              <Trash2 className="h-5 w-5" />
            </Button>
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
                <span>{recipe.ingredients?.length || 0} ingredients</span>
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
                {recipe.ingredients && recipe.ingredients.length > 0 ? (
                  recipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 mt-2 bg-coral rounded-full"></div>
                      <span>{ingredient}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-muted-foreground">No ingredients found</li>
                )}
              </ul>
            ) : (
              <ol className="space-y-6">
                {recipe.instructions && recipe.instructions.length > 0 ? (
                  recipe.instructions.map((instruction, index) => (
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
                  ))
                ) : (
                  <li className="text-muted-foreground">No instructions found</li>
                )}
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="glass">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Recipe</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{recipe.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm} 
              className="bg-coral hover:bg-coral/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default RecipeDetail;
