
import React, { useState } from 'react';
import { Link, ArrowRight, Lock, Link2, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import AuthModal from './Auth/AuthModal';
import { Badge } from '@/components/ui/badge';

interface RecipeUrlInputProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

// Source type identification
type UrlSourceType = 'instagram' | 'recipe-website' | 'general-website' | 'youtube' | 'social-media' | 'food-blog' | null;

// Popular recipe websites
const RECIPE_WEBSITES = [
  { domain: 'allrecipes.com', name: 'AllRecipes' },
  { domain: 'foodnetwork.com', name: 'Food Network' },
  { domain: 'epicurious.com', name: 'Epicurious' },
  { domain: 'bonappetit.com', name: 'Bon Appétit' },
  { domain: 'taste.com', name: 'Taste' },
  { domain: 'delish.com', name: 'Delish' },
  { domain: 'seriouseats.com', name: 'Serious Eats' },
  { domain: 'cookinglight.com', name: 'Cooking Light' },
  { domain: 'eatingwell.com', name: 'EatingWell' },
  { domain: 'simplyrecipes.com', name: 'Simply Recipes' },
  { domain: 'food52.com', name: 'Food52' },
  { domain: 'thekitchn.com', name: 'The Kitchn' },
  { domain: 'tasty.co', name: 'Tasty' },
  { domain: 'bbcgoodfood.com', name: 'BBC Good Food' },
  { domain: 'cooking.nytimes.com', name: 'NYT Cooking' },
  { domain: 'smittenkitchen.com', name: 'Smitten Kitchen' },
  { domain: 'budgetbytes.com', name: 'Budget Bytes' },
  { domain: 'kingarthurbaking.com', name: 'King Arthur Baking' },
  { domain: 'sallysbakingaddiction.com', name: 'Sally\'s Baking Addiction' },
  { domain: 'minimalistbaker.com', name: 'Minimalist Baker' }
];

// Social media patterns
const SOCIAL_MEDIA_PATTERNS = [
  { pattern: /instagram\.com\/(p|reel|stories)\/[^\/\s]+/i, type: 'instagram', name: 'Instagram' },
  { pattern: /facebook\.com\/[^\/\s]+\/posts\/|facebook\.com\/permalink\.php/i, type: 'social-media', name: 'Facebook' },
  { pattern: /twitter\.com\/[^\/\s]+\/status\//i, type: 'social-media', name: 'Twitter' },
  { pattern: /pinterest\.com\/pin\//i, type: 'social-media', name: 'Pinterest' },
  { pattern: /tiktok\.com\/@[^\/\s]+\/video\//i, type: 'social-media', name: 'TikTok' },
  { pattern: /youtube\.com\/watch\?v=|youtu\.be\//i, type: 'youtube', name: 'YouTube' }
];

const RecipeUrlInput: React.FC<RecipeUrlInputProps> = ({ onSubmit, isLoading }) => {
  const [url, setUrl] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isValidUrl, setIsValidUrl] = useState<boolean | null>(null);
  const [urlSource, setUrlSource] = useState<{ type: UrlSourceType; name: string } | null>(null);
  const [urlConfidence, setUrlConfidence] = useState<'high' | 'medium' | 'low' | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Check if URL is valid for recipe extraction
  const isValidRecipeUrl = (url: string): boolean => {
    // General URL validation - must be http/https
    const generalUrlPattern = /^(https?:\/\/)[^\s$.?#].[^\s]*$/i;
    if (!generalUrlPattern.test(url)) {
      setUrlSource(null);
      setUrlConfidence(null);
      return false;
    }
    
    // Check for social media sources
    for (const { pattern, type, name } of SOCIAL_MEDIA_PATTERNS) {
      if (pattern.test(url)) {
        setUrlSource({ type: type as UrlSourceType, name });
        setUrlConfidence(type === 'instagram' ? 'high' : 'medium');
        return true;
      }
    }
    
    // Check for known recipe websites
    const urlLower = url.toLowerCase();
    for (const { domain, name } of RECIPE_WEBSITES) {
      if (urlLower.includes(domain)) {
        setUrlSource({ type: 'recipe-website', name });
        setUrlConfidence('high');
        return true;
      }
    }
    
    // Accept any valid URL as a general website
    setUrlSource({ type: 'general-website', name: 'Website' });
    setUrlConfidence('low');
    return true;
  };

  // Update validation state when URL changes
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    
    if (newUrl.trim() === '') {
      setIsValidUrl(null);
      setUrlSource(null);
      setUrlConfidence(null);
    } else {
      setIsValidUrl(isValidRecipeUrl(newUrl));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to extract and save recipes",
        variant: "destructive",
      });
      setShowAuthModal(true);
      return;
    }
    
    if (!url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a recipe URL",
        variant: "destructive",
      });
      return;
    }
    
    if (!isValidRecipeUrl(url)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }
    
    // If URL confidence is low, show a warning toast but still proceed
    if (urlConfidence === 'low') {
      toast({
        title: "Generic Website Detected",
        description: "We'll try our best to extract recipe content from this page",
        variant: "default",
      });
    }
    
    onSubmit(url);
  };

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText) {
        setUrl(clipboardText);
        const isValid = isValidRecipeUrl(clipboardText);
        setIsValidUrl(isValid);
        
        if (isValid && urlSource) {
          toast({
            title: "URL Pasted",
            description: `${urlSource.name} URL detected and pasted`,
          });
        } else if (!isValid) {
          toast({
            title: "Not a Valid URL",
            description: "The pasted text doesn't appear to be a valid URL",
            variant: "destructive",
          });
        }
      }
    } catch (err) {
      console.log("Clipboard access denied");
      toast({
        title: "Clipboard Access Denied",
        description: "Please allow clipboard access or paste the URL manually",
        variant: "destructive",
      });
    }
  };

  // Get the input's border color based on validation state
  const getInputBorderClass = () => {
    if (isValidUrl === null) return "border-muted";
    return isValidUrl ? "border-green-500" : "border-red-500";
  };

  // Get source indicator color based on confidence
  const getConfidenceColor = () => {
    if (!urlConfidence) return "bg-muted";
    
    return {
      high: "bg-green-500",
      medium: "bg-yellow-500",
      low: "bg-orange-500"
    }[urlConfidence];
  };

  // Get source description text
  const getSourceDescription = () => {
    if (!urlSource) return null;
    
    const descriptions = {
      'instagram': 'Instagram post or reel',
      'recipe-website': `Recipe from ${urlSource.name}`,
      'youtube': 'YouTube cooking video',
      'social-media': `${urlSource.name} post`,
      'food-blog': 'Food blog recipe',
      'general-website': 'General website content'
    };
    
    return descriptions[urlSource.type] || 'Web content';
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative animate-diagonal-slide">
          <div className="glass p-6 relative overflow-hidden">
            <h2 className="font-mono text-xl mb-4 uppercase tracking-tight text-teal">Extract Recipe</h2>
            <p className="text-offwhite/70 mb-6">
              Paste any URL and we'll try to extract the complete recipe
            </p>
            
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Link className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isValidUrl === false ? 'text-red-500' : isValidUrl ? 'text-green-500' : 'text-muted-foreground'}`} />
                <Input
                  type="url"
                  placeholder="https://www.example.com/recipe/..."
                  value={url}
                  onChange={handleUrlChange}
                  className={`pl-10 pr-12 py-6 bg-charcoal font-mono text-sm ${getInputBorderClass()} transition-colors`}
                  aria-invalid={isValidUrl === false}
                />
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon"
                  onClick={handlePaste}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-offwhite"
                >
                  <Link2 className="h-4 w-4" />
                </Button>
              </div>
              
              <Button 
                type="submit" 
                disabled={isLoading || (url.trim() !== '' && !isValidUrl)}
                className="cta-button"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <RotateCw className="h-4 w-4 animate-spin" />
                    <span>Processing</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {!user && <Lock className="h-4 w-4" />}
                    Extract <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </div>
            
            {isValidUrl === false && url.trim() !== '' && (
              <p className="text-xs text-red-500 mt-2">
                Please enter a valid URL
              </p>
            )}
            
            {isValidUrl && urlSource && (
              <div className="mt-3 flex items-center gap-2">
                <span className={`inline-block w-2 h-2 rounded-full ${getConfidenceColor()}`}></span>
                <Badge variant="outline" className="text-xs py-0 h-5">
                  {getSourceDescription()}
                </Badge>
                
                {urlConfidence === 'high' && (
                  <span className="text-xs text-green-500">High confidence</span>
                )}
                {urlConfidence === 'medium' && (
                  <span className="text-xs text-yellow-500">Medium confidence</span>
                )}
                {urlConfidence === 'low' && (
                  <span className="text-xs text-orange-500">We'll try our best</span>
                )}
              </div>
            )}
            
            {!user && (
              <p className="text-xs text-offwhite/50 mt-3">
                <Lock className="inline h-3 w-3 mr-1" />
                Sign in required to save recipes to your account
              </p>
            )}
          </div>
        </div>
      </form>
      
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
};

export default RecipeUrlInput;
