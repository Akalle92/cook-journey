
import React from 'react';
import { X, ChevronRight, Trash2, Share2, BookmarkIcon, PrinterIcon, Clock, ArrowLeft } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Recipe } from '@/components/RecipeCard';
import RecipeImage from '@/components/RecipeImage';
import RecipeMetadata from './RecipeMetadata';
import RecipeContent from './RecipeContent';
import StartCookingButton from './StartCookingButton';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  
  const handleShare = () => {
    toast({
      title: "Share Recipe",
      description: "Sharing functionality will be available in the next update!",
      variant: "default",
    });
  };
  
  const handleSave = () => {
    toast({
      title: "Recipe Saved",
      description: "Recipe saved to your collection",
      variant: "default",
    });
  };
  
  // Extraction confidence indicator
  const getConfidenceDisplay = () => {
    if (recipe.confidence) {
      if (recipe.confidence >= 0.8) return { color: 'text-emerald', label: 'High Confidence' };
      if (recipe.confidence >= 0.5) return { color: 'text-amber', label: 'Medium Confidence' };
      return { color: 'text-coral', label: 'Low Confidence' };
    }
    return null;
  };
  
  const confidenceInfo = getConfidenceDisplay();

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
          
          {/* Quick action buttons */}
          <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5">
            <Button
              variant="ghost" 
              size="sm"
              className="h-8 px-3 rounded-full bg-charcoal/60 backdrop-blur-sm text-offwhite hover:bg-charcoal/80 flex items-center gap-1.5"
              onClick={handleSave}
            >
              <BookmarkIcon className="h-4 w-4" />
              <span className="text-xs">Save</span>
            </Button>
            <Button
              variant="ghost" 
              size="sm"
              className="h-8 px-3 rounded-full bg-charcoal/60 backdrop-blur-sm text-offwhite hover:bg-charcoal/80 flex items-center gap-1.5"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
              <span className="text-xs">Share</span>
            </Button>
          </div>
        </div>
        
        <DialogHeader className="px-6 pt-6 pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <DialogTitle className="font-serif text-3xl font-bold">{recipe.title}</DialogTitle>
            
            {confidenceInfo && (
              <Badge variant="outline" className={`${confidenceInfo.color} border-current`}>
                {confidenceInfo.label}
              </Badge>
            )}
          </div>
          
          <DialogDescription className="text-sm text-muted-foreground flex items-center gap-1.5">
            <Clock className="h-4 w-4 inline text-muted-foreground" /> 
            {typeof recipe.prepTime === 'string' && recipe.prepTime.includes('min') 
              ? recipe.prepTime 
              : `${recipe.prepTime} min`} · {recipe.difficulty} difficulty
          </DialogDescription>
          
          <RecipeMetadata recipe={recipe} />
        </DialogHeader>
        
        <RecipeContent recipe={recipe} />
        
        <div className="p-6 border-t border-muted flex items-center justify-between">
          <Button
            variant="ghost"
            className="text-offwhite/70 hover:text-offwhite flex items-center gap-1.5"
            onClick={onClose}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Recipes</span>
          </Button>
          <StartCookingButton />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RecipeDetailDialog;
