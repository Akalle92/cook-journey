import React, { useState } from 'react';
import { Recipe } from '@/types/recipe';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Share2, Facebook, Twitter, Pin, MessageCircle, Link } from 'lucide-react';
import { shareRecipe, shareToSocialMedia, generateShareUrl } from '@/utils/recipeSharer';
import { useToast } from '@/hooks/use-toast';

interface RecipeShareProps {
  recipe: Recipe;
}

export const RecipeShare: React.FC<RecipeShareProps> = ({ recipe }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [includeImage, setIncludeImage] = useState(true);
  const [includeNutrition, setIncludeNutrition] = useState(true);
  const { toast } = useToast();

  const handleShare = async () => {
    try {
      await shareRecipe(recipe, { includeImage, includeNutrition });
      toast({
        title: 'Recipe shared!',
        description: 'The recipe has been copied to your clipboard.',
      });
      setIsOpen(false);
    } catch (error) {
      toast({
        title: 'Error sharing recipe',
        description: error instanceof Error ? error.message : 'Failed to share recipe',
        variant: 'destructive',
      });
    }
  };

  const handleSocialShare = (platform: 'facebook' | 'twitter' | 'pinterest' | 'whatsapp') => {
    shareToSocialMedia(recipe, platform);
  };

  const handleCopyLink = async () => {
    try {
      const shareUrl = generateShareUrl(recipe);
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: 'Link copied!',
        description: 'The recipe link has been copied to your clipboard.',
      });
    } catch (error) {
      toast({
        title: 'Error copying link',
        description: 'Failed to copy recipe link',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Recipe</DialogTitle>
            <DialogDescription>
              Share this recipe with your friends and family
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
            <Button onClick={handleShare} className="w-full">
              Copy to Clipboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share to
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => handleSocialShare('facebook')}>
            <Facebook className="h-4 w-4 mr-2" />
            Facebook
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSocialShare('twitter')}>
            <Twitter className="h-4 w-4 mr-2" />
            Twitter
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSocialShare('pinterest')}>
            <Pin className="h-4 w-4 mr-2" />
            Pinterest
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSocialShare('whatsapp')}>
            <MessageCircle className="h-4 w-4 mr-2" />
            WhatsApp
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleCopyLink}>
            <Link className="h-4 w-4 mr-2" />
            Copy Link
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}; 