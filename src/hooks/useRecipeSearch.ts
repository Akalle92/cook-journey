import { useState, useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Recipe, RecipeSearchParams, RecipeFilters, RecipeError, RecipeSortField, SortOrder, RecipeApiResponse } from '@/types/recipe';
import { fetchRecipes } from '@/services/recipeApiService';

const DEFAULT_FILTERS: RecipeFilters = {
  cuisines: ['Italian', 'Mexican', 'Chinese', 'Indian', 'Japanese', 'Thai', 'Mediterranean', 'American'],
  dietaryRestrictions: ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo'],
  difficulties: ['easy', 'medium', 'hard'],
  tags: ['Quick', 'Healthy', 'Budget', 'Family', 'Party', 'Breakfast', 'Lunch', 'Dinner', 'Dessert'],
};

const ITEMS_PER_PAGE = 9;

export const useRecipeSearch = () => {
  const [searchParams, setSearchParams] = useState<RecipeSearchParams>({
    page: 1,
    limit: ITEMS_PER_PAGE,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [error, setError] = useState<RecipeError | null>(null);

  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery<RecipeApiResponse, Error>({
    queryKey: ['recipes', searchParams],
    queryFn: ({ pageParam = 1 }) => fetchRecipes({ ...searchParams, page: pageParam }),
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    staleTime: 60000, // 1 minute
    retry: 2,
  });

  // Handle error state
  if (isError) {
    setError({
      message: 'Failed to fetch recipes',
      code: 'FETCH_ERROR',
    });
  } else {
    setError(null);
  }

  const handleSearch = useCallback((params: RecipeSearchParams) => {
    setSearchParams(prev => ({
      ...prev,
      ...params,
      page: 1, // Reset to first page when search params change
    }));
    setError(null);
  }, []);

  const handleSortChange = useCallback((field: RecipeSortField, order: SortOrder) => {
    setSearchParams(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: order,
      page: 1, // Reset to first page when sort changes
    }));
  }, []);

  const handleRetry = useCallback(() => {
    refetch();
    setError(null);
  }, [refetch]);

  const recipes = data?.pages.flatMap(page => page.data) || [];

  return {
    recipes,
    isLoading: isLoading || isFetchingNextPage,
    isError,
    error,
    searchParams,
    filters: DEFAULT_FILTERS,
    hasMore: hasNextPage,
    handleSearch,
    handleSortChange,
    handleRetry,
    loadMore: fetchNextPage,
  };
}; 