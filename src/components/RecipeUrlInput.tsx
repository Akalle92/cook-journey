
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { InfoCircledIcon } from '@radix-ui/react-icons';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface RecipeUrlInputProps {
  onSubmit: (url: string, useClaude?: boolean) => void;
  isLoading: boolean;
}

const RecipeUrlInput = ({ onSubmit, isLoading }: RecipeUrlInputProps) => {
  const [url, setUrl] = useState('');
  const [useClaude, setUseClaude] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url, useClaude);
    }
  };
  
  return (
    <Card className="p-6 backdrop-blur-md bg-black/70 border-gray-800">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <Label htmlFor="recipe-url" className="text-xl font-mono">
              Add a Recipe
            </Label>
            <p className="text-muted-foreground text-sm mb-4">
              Paste a URL to instantly extract and save a recipe
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                id="recipe-url"
                placeholder="https://example.com/recipe"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="bg-gray-900 border-gray-700 h-12"
              />
            </div>
            <Button 
              type="submit" 
              className="h-12 px-8" 
              disabled={isLoading || !url.trim()}
            >
              {isLoading ? 'Processing...' : 'Extract Recipe'}
            </Button>
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Switch 
              id="use-claude" 
              checked={useClaude} 
              onCheckedChange={setUseClaude} 
            />
            <Label htmlFor="use-claude" className="text-sm">Use Claude AI to enhance recipe</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoCircledIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">Claude AI can enhance recipe details, format instructions, and even generate recipes from content that isn't in a standard recipe format.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </form>
    </Card>
  );
};

export default RecipeUrlInput;
