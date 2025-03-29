
import React, { useState } from 'react';
import { Recipe } from '@/components/RecipeCard';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { deleteRecipe } from '@/services/recipeApiService';
import RecipeDetailDialog from './RecipeDetailDialog';
import DeleteRecipeDialog from './DeleteRecipeDialog';

interface RecipeDetailProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
}

const RecipeDetail: React.FC<RecipeDetailProps> = ({ recipe, isOpen, onClose }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  if (!recipe) return null;
  
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
      <RecipeDetailDialog 
        recipe={recipe}
        isOpen={isOpen}
        onClose={onClose}
        onDeleteClick={handleDeleteClick}
      />

      <DeleteRecipeDialog
        recipeName={recipe.title}
        isOpen={deleteDialogOpen}
        isDeleting={isDeleting}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
};

export default RecipeDetail;
