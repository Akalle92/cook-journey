
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChefHat, Calendar, Clock, Utensils } from 'lucide-react';
import { DashboardStats } from '@/hooks/useDashboardStats';

interface CookingStatCardsProps {
  stats: DashboardStats;
}

const CookingStatCards: React.FC<CookingStatCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="glass">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <ChefHat className="text-teal h-5 w-5" />
            <CardTitle className="text-sm font-mono uppercase">Recipes Cooked</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{stats.totalRecipesCooked}</p>
          <CardDescription>all time</CardDescription>
        </CardContent>
      </Card>
      
      <Card className="glass">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Calendar className="text-coral h-5 w-5" />
            <CardTitle className="text-sm font-mono uppercase">This Month</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{stats.recipesThisMonth}</p>
          <CardDescription>recipes cooked</CardDescription>
        </CardContent>
      </Card>
      
      <Card className="glass">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Clock className="text-purple h-5 w-5" />
            <CardTitle className="text-sm font-mono uppercase">Avg. Cooking Time</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{stats.averageCookingTime}</p>
          <CardDescription>minutes per recipe</CardDescription>
        </CardContent>
      </Card>
      
      <Card className="glass">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Utensils className="text-amber-400 h-5 w-5" />
            <CardTitle className="text-sm font-mono uppercase">Top Category</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold font-serif">{stats.topCategory}</p>
          <CardDescription>{stats.topCategoryCount} recipes</CardDescription>
        </CardContent>
      </Card>
    </div>
  );
};

export default CookingStatCards;
