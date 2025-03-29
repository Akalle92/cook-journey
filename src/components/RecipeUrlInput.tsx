
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Switch } from "@/components/ui/switch";
import { InfoIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from '@/hooks/use-toast';

interface RecipeUrlInputProps {
  onSubmit: (url: string, useAI?: boolean) => void;
  isLoading: boolean;
}

const RecipeUrlInput = ({ onSubmit, isLoading }: RecipeUrlInputProps) => {
  const [url, setUrl] = useState('');
  const [useAI, setUseAI] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorDetails(null);
    
    if (url.trim()) {
      try {
        // Validate URL format
        new URL(url); // Will throw if URL is invalid
        onSubmit(url, useAI);
      } catch (error) {
        toast({
          title: "Invalid URL",
          description: "Please enter a valid URL including http:// or https://",
          variant: "destructive"
        });
        setErrorDetails("URL format is invalid. Make sure it includes http:// or https://");
      }
    }
  };
  
  const clearForm = () => {
    setUrl('');
    setErrorDetails(null);
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
          
          {errorDetails && (
            <div className="bg-red-900/30 border border-red-800 rounded-md p-4 flex items-start gap-3">
              <InfoIcon className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-300 font-medium text-sm">URL Error</p>
                <p className="text-red-200/80 text-xs mt-1">{errorDetails}</p>
              </div>
            </div>
          )}
          
          <div className="flex flex-col space-y-2 pt-2">
            <div className="flex items-center space-x-2">
              <Switch 
                id="use-ai" 
                checked={useAI} 
                onCheckedChange={setUseAI} 
              />
              <Label htmlFor="use-ai" className="text-sm">Use AI to enhance recipe extraction</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">AI can enhance recipe details, format instructions, and even generate recipes from content that isn't in a standard recipe format.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </form>
    </Card>
  );
};

export default RecipeUrlInput;
