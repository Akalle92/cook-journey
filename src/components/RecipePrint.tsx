import React, { useState } from 'react';
import { Recipe } from '@/types/recipe';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Printer } from 'lucide-react';
import { printRecipe } from '@/utils/recipePrinter';
import { useToast } from '@/hooks/use-toast';

interface RecipePrintProps {
  recipe: Recipe;
}

export const RecipePrint: React.FC<RecipePrintProps> = ({ recipe }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [includeImage, setIncludeImage] = useState(true);
  const [includeNutrition, setIncludeNutrition] = useState(true);
  const [includeTags, setIncludeTags] = useState(true);
  const [includeDietaryRestrictions, setIncludeDietaryRestrictions] = useState(true);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [pageSize, setPageSize] = useState<'A4' | 'Letter' | 'Legal'>('A4');
  const { toast } = useToast();

  const handlePrint = () => {
    try {
      printRecipe(recipe, {
        includeImage,
        includeNutrition,
        includeTags,
        includeDietaryRestrictions,
        fontSize,
        pageSize
      });
      setIsOpen(false);
      toast({
        title: 'Printing started',
        description: 'The recipe print dialog has been opened.',
      });
    } catch (error) {
      toast({
        title: 'Error printing recipe',
        description: error instanceof Error ? error.message : 'Failed to print recipe',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Printer className="h-4 w-4 mr-2" />
          Print
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Print Recipe</DialogTitle>
          <DialogDescription>
            Customize how you want to print this recipe
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeImage"
              checked={includeImage}
              onCheckedChange={(checked) => setIncludeImage(checked as boolean)}
            />
            <Label htmlFor="includeImage">Include image</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeNutrition"
              checked={includeNutrition}
              onCheckedChange={(checked) => setIncludeNutrition(checked as boolean)}
            />
            <Label htmlFor="includeNutrition">Include nutrition info</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeTags"
              checked={includeTags}
              onCheckedChange={(checked) => setIncludeTags(checked as boolean)}
            />
            <Label htmlFor="includeTags">Include tags</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeDietaryRestrictions"
              checked={includeDietaryRestrictions}
              onCheckedChange={(checked) => setIncludeDietaryRestrictions(checked as boolean)}
            />
            <Label htmlFor="includeDietaryRestrictions">Include dietary restrictions</Label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="fontSize">Font Size</Label>
            <Select value={fontSize} onValueChange={(value: 'small' | 'medium' | 'large') => setFontSize(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pageSize">Page Size</Label>
            <Select value={pageSize} onValueChange={(value: 'A4' | 'Letter' | 'Legal') => setPageSize(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A4">A4</SelectItem>
                <SelectItem value="Letter">Letter</SelectItem>
                <SelectItem value="Legal">Legal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handlePrint} className="w-full">
            Print Recipe
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 