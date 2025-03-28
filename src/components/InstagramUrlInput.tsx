
import React, { useState } from 'react';
import { Instagram, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface InstagramUrlInputProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

const InstagramUrlInput: React.FC<InstagramUrlInputProps> = ({ onSubmit, isLoading }) => {
  const [url, setUrl] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter an Instagram post URL",
        variant: "destructive",
      });
      return;
    }
    
    if (!url.includes('instagram.com')) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid Instagram URL",
        variant: "destructive",
      });
      return;
    }
    
    onSubmit(url);
  };

  return (
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
                  Extract <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default InstagramUrlInput;
