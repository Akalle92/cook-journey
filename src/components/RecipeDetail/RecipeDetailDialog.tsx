
import React from 'react';
import { Recipe } from '@/components/RecipeCard';
import { BookOpen, Trash2, ShoppingCart } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import RecipeContent from './RecipeContent';
import RecipeMetadata from './RecipeMetadata';
import { Button } from '@/components/ui/button';

interface RecipeDetailDialogProps {
  recipe: Recipe;
  isOpen: boolean;
  onClose: () => void;
  onDeleteClick: () => void;
  onStartCooking: () => void;
  onGenerateShoppingList: () => void;
}

const RecipeDetailDialog: React.FC<RecipeDetailDialogProps> = ({
  recipe,
  isOpen,
  onClose,
  onDeleteClick,
  onStartCooking,
  onGenerateShoppingList
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto pb-4">
          <RecipeMetadata recipe={recipe} />
          <RecipeContent recipe={recipe} />
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t">
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={onDeleteClick}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={onGenerateShoppingList}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Shopping List
            </Button>
            
            <Button 
              variant="default" 
              size="sm"
              onClick={onStartCooking}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Start Cooking
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RecipeDetailDialog;
