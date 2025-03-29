
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCategories, createCategory, addRecipeToCategory } from '@/services/categoryService';
import { Category } from '@/components/RecipeCategories/CategorySelector';
import { useToast } from '@/hooks/use-toast';

export const useCategories = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch all categories
  const {
    data: categories = [],
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 300000, // 5 minutes
    meta: {
      onError: (error: any) => {
        console.error('Failed to load categories:', error);
        toast({
          title: 'Error loading categories',
          description: error?.message || 'Failed to load categories. Please try again.',
          variant: 'destructive',
        });
      }
    }
  });
  
  // Create a new category
  const createCategoryMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: (newCategory) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: 'Category created',
        description: `${newCategory.name} has been added to your categories.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error creating category',
        description: error?.message || 'Failed to create category. Please try again.',
        variant: 'destructive',
      });
    }
  });
  
  // Assign a recipe to a category
  const assignCategoryMutation = useMutation({
    mutationFn: ({ recipeId, categoryId }: { recipeId: string, categoryId: string }) => 
      addRecipeToCategory(recipeId, categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: 'Recipe categorized',
        description: 'The recipe has been added to the selected category.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error categorizing recipe',
        description: error?.message || 'Failed to categorize recipe. Please try again.',
        variant: 'destructive',
      });
    }
  });
  
  const handleCreateCategory = (data: { name: string, color?: string }) => {
    createCategoryMutation.mutate(data);
  };
  
  const handleAssignCategory = (recipeId: string, categoryId: string) => {
    assignCategoryMutation.mutate({ recipeId, categoryId });
  };
  
  return {
    categories,
    isLoading,
    isError,
    error,
    createCategory: handleCreateCategory,
    assignCategory: handleAssignCategory,
    isCreating: createCategoryMutation.isPending,
    isAssigning: assignCategoryMutation.isPending
  };
};
