
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

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

    // This would ideally come from Supabase, but we're creating mock data for now
    // In a real implementation, we would query the ratings table to get actual cooking activity
    
    const mockStats: DashboardStats = {
      totalRecipesCooked: 24,
      recipesThisMonth: 7,
      averageCookingTime: 42,
      topCategory: "Italian",
      topCategoryCount: 8,
      categories: [
        { name: 'Italian', value: 8 },
        { name: 'Asian', value: 6 },
        { name: 'Dessert', value: 4 },
        { name: 'Mexican', value: 3 },
        { name: 'American', value: 2 },
        { name: 'Other', value: 1 },
      ],
      cookingTimes: [
        { name: 'Jan', value: 35 },
        { name: 'Feb', value: 40 },
        { name: 'Mar', value: 30 },
        { name: 'Apr', value: 45 },
        { name: 'May', value: 50 },
        { name: 'Jun', value: 42 },
      ],
      recentActivity: [
        { 
          date: new Date().toLocaleDateString(), 
          recipeName: 'Spaghetti Carbonara', 
          type: 'cooked', 
          details: 'Cooked in 45 minutes' 
        },
        { 
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString(), 
          recipeName: 'Chocolate Cake', 
          type: 'rated', 
          details: 'Rated 4.5 stars' 
        },
        { 
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toLocaleDateString(), 
          recipeName: 'Thai Green Curry', 
          type: 'cooked', 
          details: 'Cooked in 35 minutes' 
        },
        { 
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString(), 
          recipeName: 'Apple Pie', 
          type: 'cooked', 
          details: 'Cooked in 60 minutes' 
        },
        { 
          date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toLocaleDateString(), 
          recipeName: 'Beef Tacos', 
          type: 'rated', 
          details: 'Rated 5 stars' 
        },
      ]
    };

    // In a real implementation, we would query Supabase tables to get this data
    // const { data: ratings, error } = await supabase
    //   .from('ratings')
    //   .select('*, recipes(*)')
    //   .eq('user_id', user.id)
    //   .order('cook_date', { ascending: false });

    return mockStats;
  };

  return useQuery({
    queryKey: ['dashboardStats', user?.id],
    queryFn: fetchDashboardStats,
    enabled: !!user,
  });
};
