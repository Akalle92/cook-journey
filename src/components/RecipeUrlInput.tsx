
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { InfoIcon, AlertTriangle, Bug } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from '@/hooks/use-toast';

interface RecipeUrlInputProps {
  onSubmit: (url: string, useClaude?: boolean, debugMode?: boolean) => void;
  isLoading: boolean;
}

const RecipeUrlInput = ({ onSubmit, isLoading }: RecipeUrlInputProps) => {
  const [url, setUrl] = useState('');
  const [useClaude, setUseClaude] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [retries, setRetries] = useState(0);
  const maxRetries = 3;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorDetails(null);
    
    if (url.trim()) {
      try {
        // Validate URL format
        new URL(url); // Will throw if URL is invalid
        onSubmit(url, useClaude, debugMode);
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
  
  const handleRetry = () => {
    if (retries < maxRetries) {
      // Calculate exponential backoff delay
      const delay = Math.pow(2, retries) * 1000; // 1s, 2s, 4s...
      
      toast({
        title: "Retrying extraction",
        description: `Attempt ${retries + 1} of ${maxRetries}. Waiting ${delay/1000}s...`,
      });
      
      setTimeout(() => {
        setRetries(retries + 1);
        onSubmit(url, useClaude, debugMode);
      }, delay);
    } else {
      toast({
        title: "Maximum retries reached",
        description: "Please try with Claude AI enhancement enabled instead.",
        variant: "destructive"
      });
    }
  };
  
  const clearForm = () => {
    setUrl('');
    setErrorDetails(null);
    setRetries(0);
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
              <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-300 font-medium text-sm">Extraction failed</p>
                <p className="text-red-200/80 text-xs mt-1">{errorDetails}</p>
                
                <div className="flex gap-2 mt-3">
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    onClick={handleRetry}
                    disabled={retries >= maxRetries || isLoading}
                  >
                    Retry Extraction
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => {
                      setUseClaude(true);
                      handleSubmit(new Event('submit') as unknown as React.FormEvent);
                    }}
                    disabled={isLoading}
                  >
                    Try with Claude AI
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex flex-col space-y-2 pt-2">
            <div className="flex items-center space-x-2">
              <Switch 
                id="use-claude" 
                checked={useClaude} 
                onCheckedChange={setUseClaude} 
              />
              <Label htmlFor="use-claude" className="text-sm">Use Claude AI to enhance recipe</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Claude AI can enhance recipe details, format instructions, and even generate recipes from content that isn't in a standard recipe format.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="debug-mode" 
                checked={debugMode} 
                onCheckedChange={setDebugMode} 
              />
              <Label htmlFor="debug-mode" className="text-sm">Enable debug mode</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Bug className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Debug mode provides detailed information about the extraction process, including which methods were attempted and what data was found.</p>
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
