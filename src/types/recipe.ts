export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime: string | number;
  cookTime: string | number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  cuisine: string;
  dietaryRestrictions: string[];
  calories: number;
  imageUrl: string;
  imageUrls: string[];
  tags: string[];
  createdAt: Date | string;
  updatedAt: Date | string;
  category: string;
  confidence: number;
  method: string;
  extractionResults: any;
  debugInfo: any;
  data: any;
}

export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  notes?: string;
}

export interface RecipeFormData {
  title: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  imageUrl?: string;
  tags: string[];
  cuisine?: string;
  dietaryRestrictions?: string[];
  calories?: number;
  category?: string;
}

export type RecipeSortField = 'title' | 'prepTime' | 'cookTime' | 'difficulty' | 'createdAt' | 'updatedAt';
export type SortOrder = 'asc' | 'desc';

export interface RecipeSearchParams {
  query?: string;
  cuisine?: string;
  dietaryRestrictions?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  maxPrepTime?: number;
  maxCookTime?: number;
  tags?: string[];
  page?: number;
  limit?: number;
  sortBy?: RecipeSortField;
  sortOrder?: SortOrder;
}

export interface RecipeApiResponse {
  data: Recipe[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RecipeError {
  message: string;
  code: string;
  details?: unknown;
}

export interface RecipeFilters {
  cuisines: string[];
  dietaryRestrictions: string[];
  difficulties: ('easy' | 'medium' | 'hard')[];
  tags: string[];
}

export interface FavoriteRecipe {
  id: string;
  recipeId: string;
  userId: string;
  createdAt: Date;
  recipe: Recipe;
}

export interface FavoriteRecipeResponse {
  data: FavoriteRecipe[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} 