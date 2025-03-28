
import React, { useState } from 'react';
import { Instagram, ArrowRight, Lock, Link2 } from 'lucide-react';
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
  const { toast } = useToast();
  const { user } = useAuth();

  // Check if URL is a valid Instagram URL
  const isValidInstagramUrl = (url: string): boolean => {
    const instagramUrlPattern = /instagram\.com\/(p|reel|stories)\/[^\/\s]+/i;
    return instagramUrlPattern.test(url);
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
        toast({
          title: "URL Pasted",
          description: "Instagram URL detected and pasted",
        });
      }
    } catch (err) {
      // Handle clipboard permission issues silently
      console.log("Clipboard access denied");
    }
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
                <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="url"
                  placeholder="https://www.instagram.com/p/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="pl-10 pr-4 py-6 bg-charcoal border-muted font-mono text-sm"
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
                disabled={isLoading}
                className="cta-button"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-pulse">Processing</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {!user && <Lock className="h-4 w-4" />}
                    Extract <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </div>
            
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
