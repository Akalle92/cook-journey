
import React from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { ChefHat, Calendar, Clock, Utensils, TrendingUp, ArrowRight } from 'lucide-react';
import AuthModal from '@/components/Auth/AuthModal';
import { Link } from 'react-router-dom';
import CookingActivityList from '@/components/Dashboard/CookingActivityList';
import CookingStatCards from '@/components/Dashboard/CookingStatCards';
import RecipeCategoriesChart from '@/components/Dashboard/RecipeCategoriesChart';
import CookingTimeChart from '@/components/Dashboard/CookingTimeChart';
import { useDashboardStats } from '@/hooks/useDashboardStats';

const Dashboard = () => {
  const { user } = useAuth();
  const { profile, isLoading: isProfileLoading } = useProfile();
  const { stats, isLoading: isStatsLoading } = useDashboardStats();
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  
  React.useEffect(() => {
    if (!user) {
      setShowAuthModal(true);
    }
  }, [user]);

  const isLoading = isProfileLoading || isStatsLoading;

  return (
    <div className="min-h-screen grid-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-serif text-3xl font-bold">Cooking Dashboard</h1>
          {!isLoading && user && (
            <Button variant="ghost" asChild>
              <Link to="/" className="flex items-center gap-1">
                View All Recipes <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
        
        {!user && (
          <Card>
            <CardHeader>
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>
                Please sign in to access your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setShowAuthModal(true)}>Sign In</Button>
            </CardContent>
          </Card>
        )}
        
        {isLoading && user && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, index) => (
              <Card key={index} className="glass">
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {!isLoading && user && (
          <>
            <CookingStatCards stats={stats} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <RecipeCategoriesChart categories={stats.categories} />
              <CookingTimeChart timeData={stats.cookingTimes} />
            </div>
            
            <CookingActivityList activities={stats.recentActivity} />
          </>
        )}
      </main>
      
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
};

export default Dashboard;
