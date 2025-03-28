
import React, { useState } from 'react';
import { Instagram, ArrowRight, Lock, Link2, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import AuthModal from './Auth/AuthModal';

interface InstagramUrlInputProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

const InstagramUrlInput: React.FC<InstagramUrlInputProps> = ({ onSubmit, isLoading }) => {
  const [url, setUrl] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isValidUrl, setIsValidUrl] = useState<boolean | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Check if URL is a valid Instagram URL
  const isValidInstagramUrl = (url: string): boolean => {
    const instagramUrlPattern = /instagram\.com\/(p|reel|stories)\/[^\/\s]+/i;
    return instagramUrlPattern.test(url);
  };

  // Update validation state when URL changes
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    
    if (newUrl.trim() === '') {
      setIsValidUrl(null); // No validation for empty input
    } else {
      setIsValidUrl(isValidInstagramUrl(newUrl));
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
        description: "Please enter an Instagram post URL",
        variant: "destructive",
      });
      return;
    }
    
    if (!isValidInstagramUrl(url)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid Instagram URL (post, reel, or story)",
        variant: "destructive",
      });
      return;
    }
    
    onSubmit(url);
  };

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText && clipboardText.includes('instagram.com')) {
        setUrl(clipboardText);
        setIsValidUrl(isValidInstagramUrl(clipboardText));
        toast({
          title: "URL Pasted",
          description: "Instagram URL detected and pasted",
        });
      } else if (clipboardText) {
        setUrl(clipboardText);
        setIsValidUrl(isValidInstagramUrl(clipboardText));
        if (!isValidInstagramUrl(clipboardText)) {
          toast({
            title: "Not an Instagram URL",
            description: "The pasted URL doesn't appear to be from Instagram",
            variant: "destructive",
          });
        }
      }
    } catch (err) {
      // Handle clipboard permission issues silently
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

  return (
    <>
      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative animate-diagonal-slide">
          <div className="glass p-6 relative overflow-hidden">
            <h2 className="font-mono text-xl mb-4 uppercase tracking-tight text-teal">Extract Recipe</h2>
            <p className="text-offwhite/70 mb-6">
              Paste an Instagram post URL to extract the complete recipe
            </p>
            
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Instagram className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isValidUrl === false ? 'text-red-500' : isValidUrl ? 'text-green-500' : 'text-muted-foreground'}`} />
                <Input
                  type="url"
                  placeholder="https://www.instagram.com/p/..."
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
                Please enter a valid Instagram post, reel, or story URL
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

export default InstagramUrlInput;
