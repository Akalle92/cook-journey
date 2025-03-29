
import React from 'react';
import { X, ChevronRight, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Recipe } from '@/components/RecipeCard';
import RecipeImage from '@/components/RecipeImage';
import RecipeMetadata from './RecipeMetadata';
import RecipeContent from './RecipeContent';
import StartCookingButton from './StartCookingButton';

interface RecipeDetailDialogProps {
  recipe: Recipe;
  isOpen: boolean;
  onClose: () => void;
  onDeleteClick: () => void;
}

const RecipeDetailDialog: React.FC<RecipeDetailDialogProps> = ({ 
  recipe, 
  isOpen, 
  onClose,
  onDeleteClick
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <div className="relative h-56 md:h-64 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal to-transparent z-10" />
          <RecipeImage 
            src={recipe.image} 
            alt={recipe.title} 
            className="w-full h-full"
            aspectRatio={16/9}
            priority={true}
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
            onClick={onDeleteClick}
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
        
        <DialogHeader className="px-6 pt-6 pb-3">
          <DialogTitle className="font-serif text-3xl font-bold">{recipe.title}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {recipe.prepTime} · {recipe.difficulty} difficulty
          </DialogDescription>
          
          <RecipeMetadata recipe={recipe} />
        </DialogHeader>
        
        <RecipeContent recipe={recipe} />
        
        <div className="p-6 border-t border-muted">
          <StartCookingButton />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RecipeDetailDialog;
