import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Link } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { scraperService } from '@/services/scraperService';
import { Recipe } from '@/types/recipe';

interface RecipeImporterProps {
  onImport: (recipe: Recipe) => void;
}

export function RecipeImporter({ onImport }: RecipeImporterProps) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleImport = async () => {
    if (!url) {
      toast({
        title: 'Error',
        description: 'Please enter a URL',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await scraperService.scrapeRecipe(url);
      
      if (!result.success || !result.recipe) {
        throw new Error(result.error || 'Failed to import recipe');
      }

      onImport(result.recipe);
      setIsOpen(false);
      setUrl('');
      
      toast({
        title: 'Success',
        description: 'Recipe imported successfully'
      });
    } catch (error) {
      console.error('Error importing recipe:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to import recipe',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Link className="h-4 w-4" />
          Import Recipe
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Recipe from URL</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="Enter recipe URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-sm text-muted-foreground">
              Supported websites: Instagram, Facebook, Twitter, Pinterest, YouTube, TikTok, and most recipe websites
            </p>
          </div>
          <Button
            onClick={handleImport}
            disabled={isLoading || !url}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              'Import Recipe'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 