import React from 'react';
import { Recipe, RecipeSortField, SortOrder } from '@/types/recipe';
import { RecipeCard } from '@/components/RecipeCard';
import { RecipeCardSkeleton } from '@/components/RecipeCard/RecipeCardSkeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface RecipeDisplaySectionProps {
  recipes: Recipe[];
  isLoading: boolean;
  isError: boolean;
  onRecipeClick: (recipe: Recipe) => void;
  onLoadMore: () => void;
  hasMore: boolean;
  sortBy: RecipeSortField;
  sortOrder: SortOrder;
  onSortChange: (field: RecipeSortField, order: SortOrder) => void;
}

const sortOptions: { value: RecipeSortField; label: string }[] = [
  { value: 'title', label: 'Title' },
  { value: 'prepTime', label: 'Prep Time' },
  { value: 'cookTime', label: 'Cook Time' },
  { value: 'difficulty', label: 'Difficulty' },
  { value: 'createdAt', label: 'Date Added' },
  { value: 'updatedAt', label: 'Last Updated' },
];

const RecipeDisplaySection: React.FC<RecipeDisplaySectionProps> = ({
  recipes,
  isLoading,
  isError,
  onRecipeClick,
  onLoadMore,
  hasMore,
  sortBy,
  sortOrder,
  onSortChange,
}) => {
  const { lastElementRef } = useInfiniteScroll({
    onLoadMore,
    hasMore,
    isLoading,
  });

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load recipes. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (recipes.length === 0 && !isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No recipes found. Try adjusting your search filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-4">
        <Select
          value={sortBy}
          onValueChange={(value: RecipeSortField) => onSortChange(value, sortOrder)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={sortOrder}
          onValueChange={(value: SortOrder) => onSortChange(sortBy, value)}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Ascending</SelectItem>
            <SelectItem value="desc">Descending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe, index) => (
          <div
            key={recipe.id}
            ref={index === recipes.length - 1 ? lastElementRef : undefined}
          >
            <RecipeCard recipe={recipe} onClick={onRecipeClick} />
          </div>
        ))}
        {isLoading && (
          <>
            {Array.from({ length: 3 }).map((_, index) => (
              <RecipeCardSkeleton key={`skeleton-${index}`} />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default RecipeDisplaySection;
