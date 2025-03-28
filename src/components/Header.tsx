
import React, { useState } from 'react';
import { BookOpen, LogIn, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AuthModal from './Auth/AuthModal';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Header = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: 'Signed out',
        description: 'You have been successfully signed out.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred during sign out.',
        variant: 'destructive',
      });
    }
  };

  return (
    <header className="bg-charcoal/80 backdrop-blur-sm py-4 border-b border-offwhite/10">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center">
          <BookOpen className="text-teal mr-2 h-6 w-6" />
          <span className="font-serif font-bold text-xl">RecipeKeeper</span>
        </div>
        
        <div>
          {user ? (
            <div className="flex items-center gap-3">
              <div className="text-sm text-offwhite/70">
                <span className="mr-2">{user.email}</span>
              </div>
              
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-1" />
                Sign Out
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => setShowAuthModal(true)}>
              <LogIn className="h-4 w-4 mr-1" />
              Sign In
            </Button>
          )}
        </div>
      </div>
      
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </header>
  );
};

export default Header;
