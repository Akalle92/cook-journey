import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, LayoutDashboard, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import AuthModal from '@/components/Auth/AuthModal';
import { useToast } from '@/hooks/use-toast';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const {
    user,
    signOut
  } = useAuth();
  const {
    profile
  } = useProfile();
  const {
    toast
  } = useToast();
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: 'Signed out successfully',
        description: 'You have been signed out of your account'
      });
    } catch (error: any) {
      toast({
        title: 'Error signing out',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const getInitials = () => {
    if (!user) return 'G';
    return (user.email?.charAt(0) || 'U').toUpperCase();
  };

  return <header className="border-b border-border backdrop-blur-md bg-background/75 sticky top-0 z-40">
    <div className="container mx-auto px-4 py-3 flex items-center justify-between bg-zinc-800">
      <div className="flex items-center gap-6">
        <Link to="/" className="font-serif text-2xl font-bold">
          RecipeKeeper
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className={`text-sm ${location.pathname === '/' ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}`}>
            Recipes
          </Link>
          {user && <Link to="/dashboard" className={`text-sm ${location.pathname === '/dashboard' ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}`}>
              Dashboard
            </Link>}
          <Link
            to="/favorites"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Heart className="h-5 w-5" />
            <span>Favorites</span>
          </Link>
        </nav>
      </div>
      
      <div className="flex items-center gap-2">
        {user ? <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url || ''} alt={user.email || ''} />
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to="/dashboard" className="cursor-pointer flex items-center">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/profile" className="cursor-pointer flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu> : <Button variant="ghost" onClick={() => setShowAuthModal(true)}>
            Sign In
          </Button>}
        
        {/* Mobile menu button */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMenu}>
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>
    </div>
    
    {/* Mobile Navigation */}
    {isMenuOpen && <div className="md:hidden p-4 pt-0 pb-4 border-t border-border">
        <nav className="flex flex-col space-y-4">
          <Link to="/" className={`text-sm ${location.pathname === '/' ? 'text-foreground font-medium' : 'text-muted-foreground'}`} onClick={() => setIsMenuOpen(false)}>
            Recipes
          </Link>
          {user && <Link to="/dashboard" className={`text-sm ${location.pathname === '/dashboard' ? 'text-foreground font-medium' : 'text-muted-foreground'}`} onClick={() => setIsMenuOpen(false)}>
              Dashboard
            </Link>}
          {user && <Link to="/profile" className={`text-sm ${location.pathname === '/profile' ? 'text-foreground font-medium' : 'text-muted-foreground'}`} onClick={() => setIsMenuOpen(false)}>
              Profile
            </Link>}
          <Link
            to="/favorites"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            <Heart className="h-5 w-5" />
            <span>Favorites</span>
          </Link>
        </nav>
      </div>}
    
    <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
  </header>;
};

export default Header;