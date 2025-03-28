
import React from 'react';
import { GlassCard, GlassCardContent, GlassCardDescription, GlassCardHeader, GlassCardTitle } from '@/components/ui/glass-card';
import { ChefHat, Calendar, Clock, Utensils } from 'lucide-react';
import { DashboardStats } from '@/hooks/useDashboardStats';
import { useBackground } from '@/components/BackgroundSystem/BackgroundContext';
import { TextureOverlay } from '@/components/BackgroundSystem/TextureOverlay';

interface CookingStatCardsProps {
  stats: DashboardStats;
}

const CookingStatCards: React.FC<CookingStatCardsProps> = ({ stats }) => {
  const { timeOfDay } = useBackground();
  
  // Card animation on load
  const [isAnimating, setIsAnimating] = React.useState(true);
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <GlassCard className={`transform transition-all duration-700 ${isAnimating ? 'translate-y-4 opacity-0' : 'translate-y-0 opacity-100'}`} style={{ transitionDelay: '100ms' }}>
        <div className="relative overflow-hidden rounded-lg">
          <TextureOverlay type="fine" blend="soft-light" opacity={0.07} />
          <GlassCardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <ChefHat className="text-teal h-5 w-5" />
              <GlassCardTitle className="text-sm font-mono uppercase">Recipes Cooked</GlassCardTitle>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            <p className="text-3xl font-bold text-gradient">{stats.totalRecipesCooked}</p>
            <GlassCardDescription>all time</GlassCardDescription>
          </GlassCardContent>
        </div>
      </GlassCard>
      
      <GlassCard className={`transform transition-all duration-700 ${isAnimating ? 'translate-y-4 opacity-0' : 'translate-y-0 opacity-100'}`} style={{ transitionDelay: '200ms' }}>
        <div className="relative overflow-hidden rounded-lg">
          <TextureOverlay type="medium" blend="soft-light" opacity={0.05} />
          <GlassCardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Calendar className="text-coral h-5 w-5" />
              <GlassCardTitle className="text-sm font-mono uppercase">This Month</GlassCardTitle>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            <p className="text-3xl font-bold text-gradient">{stats.recipesThisMonth}</p>
            <GlassCardDescription>recipes cooked</GlassCardDescription>
          </GlassCardContent>
        </div>
      </GlassCard>
      
      <GlassCard className={`transform transition-all duration-700 ${isAnimating ? 'translate-y-4 opacity-0' : 'translate-y-0 opacity-100'}`} style={{ transitionDelay: '300ms' }}>
        <div className="relative overflow-hidden rounded-lg">
          <TextureOverlay type="coarse" blend="soft-light" opacity={0.05} />
          <GlassCardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Clock className="text-purple h-5 w-5" />
              <GlassCardTitle className="text-sm font-mono uppercase">Avg. Cooking Time</GlassCardTitle>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            <p className="text-3xl font-bold text-gradient">{stats.averageCookingTime}</p>
            <GlassCardDescription>minutes per recipe</GlassCardDescription>
          </GlassCardContent>
        </div>
      </GlassCard>
      
      <GlassCard className={`transform transition-all duration-700 ${isAnimating ? 'translate-y-4 opacity-0' : 'translate-y-0 opacity-100'}`} style={{ transitionDelay: '400ms' }}>
        <div className="relative overflow-hidden rounded-lg">
          <TextureOverlay type="paper" blend="soft-light" opacity={0.05} />
          <GlassCardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Utensils className="text-amber-400 h-5 w-5" />
              <GlassCardTitle className="text-sm font-mono uppercase">Top Category</GlassCardTitle>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            <p className="text-3xl font-bold font-serif text-gradient">{stats.topCategory}</p>
            <GlassCardDescription>{stats.topCategoryCount} recipes</GlassCardDescription>
          </GlassCardContent>
        </div>
      </GlassCard>
    </div>
  );
};

export default CookingStatCards;
