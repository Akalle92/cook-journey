import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FavoriteRecipe, Recipe } from '@/types/recipe';
import { fetchFavorites, addFavorite, removeFavorite, isFavorite } from '@/services/favoriteService';
import { useToast } from '@/hooks/use-toast';

export const useFavorites = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const {
    data: favoritesData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => fetchFavorites(),
  });

  const addFavoriteMutation = useMutation({
    mutationFn: addFavorite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      toast({
        title: 'Recipe Added',
        description: 'Recipe has been added to your favorites.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: removeFavorite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      toast({
        title: 'Recipe Removed',
        description: 'Recipe has been removed from your favorites.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const toggleFavorite = useCallback(async (recipe: Recipe) => {
    try {
      const isFav = await isFavorite(recipe.id);
      if (isFav) {
        const favorite = favoritesData?.data.find(f => f.recipeId === recipe.id);
        if (favorite) {
          await removeFavoriteMutation.mutateAsync(favorite.id);
        }
      } else {
        await addFavoriteMutation.mutateAsync(recipe.id);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  }, [favoritesData, addFavoriteMutation, removeFavoriteMutation]);

  const checkIsFavorite = useCallback(async (recipeId: string): Promise<boolean> => {
    try {
      return await isFavorite(recipeId);
    } catch (error) {
      console.error('Error checking favorite status:', error);
      return false;
    }
  }, []);

  return {
    favorites: favoritesData?.data || [],
    isLoading,
    isError,
    error,
    selectedRecipe,
    setSelectedRecipe,
    toggleFavorite,
    checkIsFavorite,
  };
}; 