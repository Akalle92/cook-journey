
import React, { useState } from 'react';
import { Recipe } from '@/components/RecipeCard';
import { Check, ShoppingCart, Printer, Download, Copy, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface ShoppingListProps {
  recipe?: Recipe;
  isOpen: boolean;
  onClose: () => void;
}

interface ShoppingItem {
  id: string;
  name: string;
  checked: boolean;
}

const ShoppingListGenerator: React.FC<ShoppingListProps> = ({
  recipe,
  isOpen,
  onClose,
}) => {
  const { toast } = useToast();
  const [items, setItems] = useState<ShoppingItem[]>([]);
  
  // Process recipe ingredients into shopping items when the recipe changes
  React.useEffect(() => {
    if (recipe && recipe.ingredients) {
      const newItems = recipe.ingredients.map((ingredient, index) => ({
        id: `item-${index}`,
        name: ingredient,
        checked: false,
      }));
      setItems(newItems);
    }
  }, [recipe]);
  
  const toggleItem = (id: string) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };
  
  const handlePrint = () => {
    const title = recipe?.title || 'Shopping List';
    const content = items.map(item => `${item.checked ? '✓' : '☐'} ${item.name}`).join('\n');
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${title} - Shopping List</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { font-size: 24px; }
              ul { list-style-type: none; padding: 0; }
              li { padding: 8px 0; border-bottom: 1px solid #eee; }
            </style>
          </head>
          <body>
            <h1>${title} - Shopping List</h1>
            <ul>
              ${items.map(item => `<li>${item.checked ? '✓' : '☐'} ${item.name}</li>`).join('')}
            </ul>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };
  
  const handleCopyToClipboard = () => {
    const title = recipe?.title || 'Shopping List';
    const content = `${title} - Shopping List\n\n${items.map(item => `${item.checked ? '✓' : '☐'} ${item.name}`).join('\n')}`;
    
    navigator.clipboard.writeText(content).then(() => {
      toast({
        title: "Copied to clipboard",
        description: "Shopping list has been copied to your clipboard",
      });
    }).catch(err => {
      console.error('Could not copy text: ', err);
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    });
  };
  
  const handleDownload = () => {
    const title = recipe?.title || 'Shopping List';
    const content = `${title} - Shopping List\n\n${items.map(item => `${item.checked ? '✓' : '☐'} ${item.name}`).join('\n')}`;
    
    const element = document.createElement('a');
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${title.replace(/\s+/g, '-').toLowerCase()}-shopping-list.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: "Shopping list downloaded",
      description: "Your shopping list has been downloaded as a text file",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <ShoppingCart className="mr-2 h-5 w-5" />
            Shopping List
          </DialogTitle>
          <DialogDescription>
            {recipe ? `Ingredients for ${recipe.title}` : 'Your shopping list'}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[400px] pr-4">
          {items.length > 0 ? (
            <ul className="space-y-2">
              {items.map((item) => (
                <li key={item.id} className="flex items-start space-x-2 p-2 hover:bg-muted/50 rounded-md">
                  <Checkbox 
                    id={item.id} 
                    checked={item.checked} 
                    onCheckedChange={() => toggleItem(item.id)}
                  />
                  <label 
                    htmlFor={item.id} 
                    className={`flex-1 cursor-pointer text-sm ${item.checked ? 'line-through text-muted-foreground' : ''}`}
                  >
                    {item.name}
                  </label>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No ingredients in the shopping list
            </div>
          )}
        </ScrollArea>
        
        <div className="flex items-center justify-between pt-4 space-x-2">
          <Button variant="outline" size="sm" onClick={handleCopyToClipboard} title="Copy to clipboard">
            <Copy className="h-4 w-4 mr-1" />
            Copy
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint} title="Print shopping list">
            <Printer className="h-4 w-4 mr-1" />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload} title="Download as text">
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
          <Button variant="default" size="sm" onClick={onClose}>
            <X className="h-4 w-4 mr-1" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShoppingListGenerator;
