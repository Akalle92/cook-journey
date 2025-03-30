import { Recipe, RecipeSearchParams, RecipeApiResponse } from '@/types/recipe';
import { supabase } from '@/integrations/supabase/client';
import { mapToRecipe } from '@/utils/recipeMappers';
import { mockRecipes } from '@/data/mockRecipes';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export class ApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new ApiError(
      error.message || 'An error occurred',
      error.code || 'API_ERROR',
      error.details
    );
  }
  return response.json();
};

// Fetch recipes from Supabase
export const fetchRecipes = async (params: RecipeSearchParams): Promise<RecipeApiResponse> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.query) queryParams.append('query', params.query);
    if (params.cuisine) queryParams.append('cuisine', params.cuisine);
    if (params.difficulty) queryParams.append('difficulty', params.difficulty);
    if (params.maxPrepTime) queryParams.append('maxPrepTime', params.maxPrepTime.toString());
    if (params.maxCookTime) queryParams.append('maxCookTime', params.maxCookTime.toString());
    if (params.tags?.length) queryParams.append('tags', params.tags.join(','));
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const response = await fetch(`${API_BASE_URL}/recipes?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new ApiError(
        'Failed to fetch recipes',
        'FETCH_ERROR',
        await response.json()
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      'Failed to fetch recipes',
      'FETCH_ERROR',
      error
    );
  }
};

export const fetchRecipeById = async (id: string): Promise<Recipe> => {
  try {
    const response = await fetch(`${API_BASE_URL}/recipes/${id}`);
    
    if (!response.ok) {
      throw new ApiError(
        'Failed to fetch recipe',
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
      'Failed to fetch recipe',
      'FETCH_ERROR',
      error
    );
  }
};

export const createRecipe = async (recipe: Omit<Recipe, 'id'>): Promise<Recipe> => {
  try {
    const response = await fetch(`${API_BASE_URL}/recipes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(recipe),
    });
    
    if (!response.ok) {
      throw new ApiError(
        'Failed to create recipe',
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
      'Failed to create recipe',
      'CREATE_ERROR',
      error
    );
  }
};

export const updateRecipe = async (id: string, recipe: Partial<Recipe>): Promise<Recipe> => {
  try {
    const response = await fetch(`${API_BASE_URL}/recipes/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(recipe),
    });
    
    if (!response.ok) {
      throw new ApiError(
        'Failed to update recipe',
        'UPDATE_ERROR',
        await response.json()
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      'Failed to update recipe',
      'UPDATE_ERROR',
      error
    );
  }
};

export const deleteRecipe = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/recipes/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new ApiError(
        'Failed to delete recipe',
        'DELETE_ERROR',
        await response.json()
      );
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      'Failed to delete recipe',
      'DELETE_ERROR',
      error
    );
  }
};
