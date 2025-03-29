import React from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GlassCard, GlassCardContent, GlassCardDescription, GlassCardHeader, GlassCardTitle } from '@/components/ui/glass-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import AuthModal from '@/components/Auth/AuthModal';
import { Link } from 'react-router-dom';
import CookingActivityList from '@/components/Dashboard/CookingActivityList';
import CookingStatCards from '@/components/Dashboard/CookingStatCards';
import RecipeCategoriesChart from '@/components/Dashboard/RecipeCategoriesChart';
import CookingTimeChart from '@/components/Dashboard/CookingTimeChart';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { TextureOverlay } from '@/components/BackgroundSystem/TextureOverlay';
const Dashboard = () => {
  const {
    user
  } = useAuth();
  const {
    profile,
    isLoading: isProfileLoading
  } = useProfile();
  const {
    data: stats,
    isLoading: isStatsLoading
  } = useDashboardStats();
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  React.useEffect(() => {
    if (!user) {
      setShowAuthModal(true);
    }
  }, [user]);
  const isLoading = isProfileLoading || isStatsLoading;
  return <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-6 relative bg-zinc-950">
        <TextureOverlay type="paper" opacity={0.05} />
        
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-serif text-3xl font-bold text-gradient">Cooking Dashboard</h1>
          {!isLoading && user && <Button variant="ghost" asChild className="group">
              <Link to="/" className="flex items-center gap-1">
                View All Recipes <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>}
        </div>
        
        {!user && <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle>Authentication Required</GlassCardTitle>
              <GlassCardDescription>
                Please sign in to access your dashboard
              </GlassCardDescription>
            </GlassCardHeader>
            <GlassCardContent>
              <Button onClick={() => setShowAuthModal(true)} className="animated-gradient bg-gradient-to-r from-teal via-purple to-coral text-charcoal">Sign In</Button>
            </GlassCardContent>
          </GlassCard>}
        
        {isLoading && user && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, index) => <GlassCard key={index} className="floating" style={{
          animationDelay: `${index * 0.2}s`
        }}>
                <GlassCardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </GlassCardHeader>
                <GlassCardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </GlassCardContent>
              </GlassCard>)}
          </div>}
        
        {!isLoading && user && stats && <>
            <CookingStatCards stats={stats} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="relative overflow-hidden rounded-lg">
                <TextureOverlay type="fine" blend="soft-light" opacity={0.07} />
                <RecipeCategoriesChart categories={stats.categories} />
              </div>
              
              <div className="relative overflow-hidden rounded-lg">
                <TextureOverlay type="food" blend="overlay" opacity={0.05} />
                <CookingTimeChart timeData={stats.cookingTimes} />
              </div>
            </div>
            
            <div className="relative overflow-hidden rounded-lg">
              <TextureOverlay type="medium" blend="soft-light" opacity={0.07} />
              <CookingActivityList activities={stats.recentActivity} />
            </div>
          </>}
      </main>
      
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>;
};
export default Dashboard;