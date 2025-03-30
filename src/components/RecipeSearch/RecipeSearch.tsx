import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RecipeSearchParams, RecipeFilters } from '@/types/recipe';
import { Search, X } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

interface RecipeSearchProps {
  onSearch: (params: RecipeSearchParams) => void;
  filters: RecipeFilters;
  currentFilters: RecipeSearchParams;
  isLoading?: boolean;
}

export const RecipeSearch: React.FC<RecipeSearchProps> = ({
  onSearch,
  filters,
  currentFilters,
  isLoading = false,
}) => {
  const [searchQuery, setSearchQuery] = React.useState(currentFilters.query || '');
  const [selectedCuisine, setSelectedCuisine] = React.useState(currentFilters.cuisine || '');
  const [selectedDifficulty, setSelectedDifficulty] = React.useState(currentFilters.difficulty || '');
  const [selectedTags, setSelectedTags] = React.useState<string[]>(currentFilters.tags || []);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  React.useEffect(() => {
    onSearch({
      query: debouncedSearchQuery,
      cuisine: selectedCuisine || undefined,
      difficulty: selectedDifficulty as 'easy' | 'medium' | 'hard' || undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
    });
  }, [debouncedSearchQuery, selectedCuisine, selectedDifficulty, selectedTags, onSearch]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCuisine('');
    setSelectedDifficulty('');
    setSelectedTags([]);
    onSearch({});
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Search Recipes</CardTitle>
        <CardDescription>
          Find your perfect recipe using filters and search
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search recipes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={selectedCuisine} onValueChange={setSelectedCuisine}>
              <SelectTrigger>
                <SelectValue placeholder="Select cuisine" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All cuisines</SelectItem>
                {filters.cuisines.map((cuisine) => (
                  <SelectItem key={cuisine} value={cuisine}>
                    {cuisine}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All difficulties</SelectItem>
                {filters.difficulties.map((difficulty) => (
                  <SelectItem key={difficulty} value={difficulty}>
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Tags</h4>
              {selectedTags.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTags([])}
                  className="h-8 px-2"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {(searchQuery || selectedCuisine || selectedDifficulty || selectedTags.length > 0) && (
            <Button
              type="button"
              variant="outline"
              onClick={handleClearFilters}
              className="w-full"
            >
              Clear all filters
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}; 