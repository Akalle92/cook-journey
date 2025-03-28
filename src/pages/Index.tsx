
import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import InstagramUrlInput from '@/components/InstagramUrlInput';
import TrendingRecipes from '@/components/TrendingRecipes';
import RecipeGrid from '@/components/RecipeGrid';
import RecipeDetail from '@/components/RecipeDetail';
import { Recipe } from '@/components/RecipeCard';
import { fetchRecipes, extractRecipeFromInstagram } from '@/services/recipeService';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showRecipeDetail, setShowRecipeDetail] = useState(false);
  
  useEffect(() => {
    const loadRecipes = async () => {
      try {
        const data = await fetchRecipes();
        setRecipes(data);
      } catch (error) {
        console.error("Error loading recipes:", error);
        toast({
          title: "Error",
          description: "Failed to load recipes. Please try again later.",
          variant: "destructive",
        });
      }
    };
    
    loadRecipes();
  }, []);
  
  const handleRecipeExtraction = async (url: string) => {
    setIsLoading(true);
    
    try {
      const extractedRecipe = await extractRecipeFromInstagram(url);
      
      // Add new recipe to the beginning of the array
      setRecipes(prevRecipes => [extractedRecipe, ...prevRecipes]);
      
      toast({
        title: "Recipe Extracted",
        description: "Your recipe has been successfully extracted!",
        variant: "default",
      });
      
      // Open the recipe detail view
      setSelectedRecipe(extractedRecipe);
      setShowRecipeDetail(true);
    } catch (error) {
      console.error("Error extracting recipe:", error);
      toast({
        title: "Extraction Failed",
        description: "Failed to extract recipe from the provided URL.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRecipeClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setShowRecipeDetail(true);
  };
  
  const closeRecipeDetail = () => {
    setShowRecipeDetail(false);
  };

  return (
    <div className="min-h-screen grid-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-3xl mx-auto mb-12">
          <InstagramUrlInput onSubmit={handleRecipeExtraction} isLoading={isLoading} />
        </div>
        
        <TrendingRecipes recipes={recipes.slice(0, 5)} onRecipeClick={handleRecipeClick} />
        
        <div className="mb-8">
          <h2 className="font-mono text-xl uppercase tracking-tight mb-4">Your Recipes</h2>
          <RecipeGrid recipes={recipes} onRecipeClick={handleRecipeClick} />
        </div>
      </main>
      
      <RecipeDetail 
        recipe={selectedRecipe} 
        isOpen={showRecipeDetail} 
        onClose={closeRecipeDetail} 
      />
    </div>
  );
};

export default Index;
