
import React from 'react';
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from '@/components/ui/glass-card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { CategoryData } from '@/hooks/useDashboardStats';
import { useBackground } from '@/components/BackgroundSystem/BackgroundContext';

interface RecipeCategoriesChartProps {
  categories: CategoryData[];
}

// Custom color palettes based on time of day
const COLOR_PALETTES = {
  morning: ['#14b8a6', '#f43f5e', '#8b5cf6', '#f59e0b', '#3b82f6', '#ec4899'],
  afternoon: ['#06b6d4', '#0891b2', '#6366f1', '#8b5cf6', '#a855f7', '#ec4899'],
  evening: ['#f97316', '#f59e0b', '#eab308', '#84cc16', '#10b981', '#06b6d4'],
  night: ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e']
};

const RecipeCategoriesChart: React.FC<RecipeCategoriesChartProps> = ({ categories }) => {
  const { timeOfDay } = useBackground();
  const COLORS = COLOR_PALETTES[timeOfDay];
  
  // Add animation for first render
  const [isAnimating, setIsAnimating] = React.useState(true);
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <GlassCard className={`transition-all duration-700 ${isAnimating ? 'scale-95 opacity-80' : 'scale-100 opacity-100'}`}>
      <GlassCardHeader>
        <GlassCardTitle className="text-xl font-serif">Recipe Categories</GlassCardTitle>
      </GlassCardHeader>
      <GlassCardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categories}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                animationDuration={1500}
                animationBegin={300}
              >
                {categories.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                    className="transition-all duration-500"
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`${value} recipes`, 'Count']} 
                contentStyle={{ 
                  backgroundColor: 'rgba(23, 23, 23, 0.8)', 
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)' 
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                formatter={(value) => <span className="text-sm font-mono">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </GlassCardContent>
    </GlassCard>
  );
};

export default RecipeCategoriesChart;
