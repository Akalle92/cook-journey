
import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const StartCookingButton: React.FC = () => {
  const { toast } = useToast();
  
  const startCooking = () => {
    toast({
      title: "Cooking Mode",
      description: "Cooking mode will be available in the next update!",
      variant: "default",
    });
  };
  
  return (
    <Button 
      className="cta-button w-full flex items-center justify-center gap-2"
      onClick={startCooking}
    >
      Start Cooking <ChevronRight className="h-4 w-4" />
    </Button>
  );
};

export default StartCookingButton;
