
import React, { useState } from 'react';
import { Link, ArrowRight, Lock, Link2, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import AuthModal from './Auth/AuthModal';

interface RecipeUrlInputProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

const RecipeUrlInput: React.FC<RecipeUrlInputProps> = ({ onSubmit, isLoading }) => {
  const [url, setUrl] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isValidUrl, setIsValidUrl] = useState<boolean | null>(null);
  const [urlSource, setUrlSource] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Check if URL is valid for recipe extraction
  const isValidRecipeUrl = (url: string): boolean => {
    // Instagram URLs
    const instagramPattern = /instagram\.com\/(p|reel|stories)\/[^\/\s]+/i;
    
    // Common recipe websites
    const recipeWebsites = [
      /allrecipes\.com/i,
      /foodnetwork\.com/i,
      /epicurious\.com/i,
      /bonappetit\.com/i,
      /taste\.com/i,
      /delish\.com/i,
      /seriouseats\.com/i,
      /cookinglight\.com/i,
      /eatingwell\.com/i,
      /simplyrecipes\.com/i,
      /food52\.com/i,
      /thekitchn\.com/i,
      /tasty\.co/i
    ];
    
    // General URL validation - must be http/https
    const generalUrlPattern = /^(https?:\/\/)[^\s$.?#].[^\s]*$/i;
    
    // Detect URL source
    if (instagramPattern.test(url)) {
      setUrlSource('instagram');
      return true;
    }
    
    for (const pattern of recipeWebsites) {
      if (pattern.test(url)) {
        setUrlSource('recipe-website');
        return true;
      }
    }
    
    if (generalUrlPattern.test(url)) {
      setUrlSource('general-website');
      return true;
    }
    
    setUrlSource(null);
    return false;
  };

  // Update validation state when URL changes
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    
    if (newUrl.trim() === '') {
      setIsValidUrl(null);
      setUrlSource(null);
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
        description: "Please enter a valid recipe URL",
        variant: "destructive",
      });
      return;
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
            description: `${urlSource.charAt(0).toUpperCase() + urlSource.slice(1).replace('-', ' ')} URL detected and pasted`,
          });
        } else if (!isValid) {
          toast({
            title: "Not a Recipe URL",
            description: "The pasted URL doesn't appear to be from a supported recipe source",
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

  // Get source icon and text for display
  const getSourceInfo = () => {
    if (!urlSource) return null;
    
    return {
      instagram: { color: 'text-purple', text: 'Instagram recipe' },
      'recipe-website': { color: 'text-coral', text: 'Recipe website' },
      'general-website': { color: 'text-teal', text: 'Website content' }
    }[urlSource] || null;
  };

  const sourceInfo = getSourceInfo();

  return (
    <>
      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative animate-diagonal-slide">
          <div className="glass p-6 relative overflow-hidden">
            <h2 className="font-mono text-xl mb-4 uppercase tracking-tight text-teal">Extract Recipe</h2>
            <p className="text-offwhite/70 mb-6">
              Paste a recipe URL to extract the complete recipe
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
                Please enter a valid recipe URL
              </p>
            )}
            
            {isValidUrl && sourceInfo && (
              <p className={`text-xs ${sourceInfo.color} mt-2 flex items-center gap-1`}>
                <span className="block w-1.5 h-1.5 rounded-full bg-current"></span>
                {sourceInfo.text} detected
              </p>
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
