
import React from 'react';
import { Menu, PlusCircle, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const Header: React.FC = () => {
  const { toast } = useToast();

  const handleNotImplemented = () => {
    toast({
      title: "Not implemented",
      description: "This feature is coming soon!",
      variant: "default",
    });
  };

  return (
    <header className="glass z-50 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-teal hover:text-teal/80"
          onClick={handleNotImplemented}
        >
          <Menu className="h-6 w-6" />
        </Button>
        <h1 className="font-serif font-bold text-xl md:text-2xl tracking-tight">
          Recipe<span className="text-teal">Keeper</span>
        </h1>
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-teal hover:text-teal/80"
          onClick={handleNotImplemented}
        >
          <Search className="h-5 w-5" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-teal hover:text-teal/80"
          onClick={handleNotImplemented}
        >
          <PlusCircle className="h-5 w-5" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-teal hover:text-teal/80"
          onClick={handleNotImplemented}
        >
          <User className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};

export default Header;
