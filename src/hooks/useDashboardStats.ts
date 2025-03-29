
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { fetchRecipes } from '@/services/recipeService';

export interface CategoryData {
  name: string;
  value: number;
}

export interface TimeData {
  name: string;
  value: number;
}

export interface Activity {
  date: string;
  recipeName: string;
  type: string;
  details: string;
}

export interface DashboardStats {
  totalRecipesCooked: number;
  recipesThisMonth: number;
  averageCookingTime: number;
  topCategory: string;
  topCategoryCount: number;
  categories: CategoryData[];
  cookingTimes: TimeData[];
  recentActivity: Activity[];
}

export const useDashboardStats = () => {
  const { user } = useAuth();

  const fetchDashboardStats = async (): Promise<DashboardStats> => {
    if (!user) {
      throw new Error('User is not authenticated');
    }

    // Fetch actual recipes from the service
    const recipes = await fetchRecipes();
    
    // Calculate total recipes
    const totalRecipesCooked = recipes.length;
    
    // Calculate recipes cooked this month
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const recipesThisMonth = recipes.filter(recipe => {
      const recipeDate = new Date(recipe.createdAt);
      return recipeDate >= startOfMonth;
    }).length;
    
    // Calculate average cooking time
    const totalCookingTime = recipes.reduce((total, recipe) => {
      return total + (recipe.cookTime || 0);
    }, 0);
    const averageCookingTime = totalRecipesCooked > 0 
      ? Math.round(totalCookingTime / totalRecipesCooked) 
      : 0;
    
    // Calculate categories
    const categoryCounts: Record<string, number> = {};
    recipes.forEach(recipe => {
      const category = recipe.cuisine || 'Uncategorized';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
    
    // Sort categories by count
    const sortedCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }));
    
    // Get top category
    const topCategory = sortedCategories.length > 0 ? sortedCategories[0].name : 'None';
    const topCategoryCount = sortedCategories.length > 0 ? sortedCategories[0].value : 0;
    
    // Generate cooking times data (last 6 months)
    const cookingTimes: TimeData[] = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentDate.getMonth() - i + 12) % 12;
      const monthName = monthNames[monthIndex];
      
      // Calculate average cooking time for this month
      const monthStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthEndDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0);
      
      const monthRecipes = recipes.filter(recipe => {
        const recipeDate = new Date(recipe.createdAt);
        return recipeDate >= monthStartDate && recipeDate <= monthEndDate;
      });
      
      const monthTotalTime = monthRecipes.reduce((total, recipe) => {
        return total + (recipe.cookTime || 0);
      }, 0);
      
      const monthAvgTime = monthRecipes.length > 0 
        ? Math.round(monthTotalTime / monthRecipes.length) 
        : 0;
      
      cookingTimes.push({ name: monthName, value: monthAvgTime });
    }
    
    // Generate recent activity from recipes
    const recentActivity: Activity[] = recipes
      .slice(0, 5)
      .map(recipe => {
        const date = new Date(recipe.createdAt).toLocaleDateString();
        return {
          date,
          recipeName: recipe.title,
          type: 'cooked',
          details: `Cooked in ${recipe.cookTime || 30} minutes`
        };
      });
    
    // Ensure we have at least some categories for visualization
    let categories = sortedCategories.slice(0, 6);
    if (categories.length === 0) {
      categories = [
        { name: 'Italian', value: 0 },
        { name: 'Asian', value: 0 },
        { name: 'Dessert', value: 0 }
      ];
    }
    
    return {
      totalRecipesCooked,
      recipesThisMonth,
      averageCookingTime,
      topCategory,
      topCategoryCount,
      categories,
      cookingTimes,
      recentActivity
    };
  };

  return useQuery({
    queryKey: ['dashboardStats', user?.id],
    queryFn: fetchDashboardStats,
    enabled: !!user,
  });
};
