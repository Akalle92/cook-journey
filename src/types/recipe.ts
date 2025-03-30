export interface Recipe {
  id: string;
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
  createdAt: Date;
  updatedAt: Date;
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
}

export interface RecipeApiResponse {
  data: Recipe[];
  total: number;
  page: number;
  limit: number;
}

export interface RecipeError {
  message: string;
  code: string;
  details?: unknown;
} 