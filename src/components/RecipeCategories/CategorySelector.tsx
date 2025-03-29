
import React from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

export type Category = {
  id: string;
  name: string;
  color?: string;
};

interface CategorySelectorProps {
  categories: Category[];
  selectedCategory?: string;
  onSelectCategory: (categoryId: string) => void;
  className?: string;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  className,
}) => {
  const [open, setOpen] = React.useState(false);
  const selectedCategoryObj = categories.find(c => c.id === selectedCategory);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between w-full max-w-[200px]", className)}
        >
          {selectedCategoryObj ? (
            <Badge 
              className={cn(
                "mr-2", 
                selectedCategoryObj.color ? selectedCategoryObj.color : "bg-slate-500"
              )}
            >
              {selectedCategoryObj.name}
            </Badge>
          ) : (
            "Select category"
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search categories..." />
          <CommandList>
            <CommandEmpty>No categories found.</CommandEmpty>
            <CommandGroup>
              {categories.map((category) => (
                <CommandItem
                  key={category.id}
                  value={category.name}
                  onSelect={() => {
                    onSelectCategory(category.id);
                    setOpen(false);
                  }}
                >
                  <Badge className={cn("mr-2", category.color ? category.color : "bg-slate-500")}>
                    {category.name}
                  </Badge>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      selectedCategory === category.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default CategorySelector;
