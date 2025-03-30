import { FavoriteRecipe, FavoriteRecipeResponse } from '@/types/recipe';
import { ApiError } from './recipeApiService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const fetchFavorites = async (params: { page?: number; limit?: number } = {}): Promise<FavoriteRecipeResponse> => {
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const response = await fetch(`${API_BASE_URL}/favorites?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new ApiError(
        'Failed to fetch favorites',
        'FETCH_ERROR',
        await response.json()
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      'Failed to fetch favorites',
      'FETCH_ERROR',
      error
    );
  }
};

export const addFavorite = async (recipeId: string): Promise<FavoriteRecipe> => {
  try {
    const response = await fetch(`${API_BASE_URL}/favorites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ recipeId }),
    });
    
    if (!response.ok) {
      throw new ApiError(
        'Failed to add favorite',
        'CREATE_ERROR',
        await response.json()
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      'Failed to add favorite',
      'CREATE_ERROR',
      error
    );
  }
};

export const removeFavorite = async (favoriteId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/favorites/${favoriteId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new ApiError(
        'Failed to remove favorite',
        'DELETE_ERROR',
        await response.json()
      );
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      'Failed to remove favorite',
      'DELETE_ERROR',
      error
    );
  }
};

export const isFavorite = async (recipeId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/favorites/check/${recipeId}`);
    
    if (!response.ok) {
      throw new ApiError(
        'Failed to check favorite status',
        'FETCH_ERROR',
        await response.json()
      );
    }

    const data = await response.json();
    return data.isFavorite;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      'Failed to check favorite status',
      'FETCH_ERROR',
      error
    );
  }
}; 