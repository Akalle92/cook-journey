
import React from 'react';
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from '@/components/ui/glass-card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TimeData } from '@/hooks/useDashboardStats';
import { useBackground } from '@/components/BackgroundSystem/BackgroundContext';

interface CookingTimeChartProps {
  timeData: TimeData[];
}

// Custom color palettes based on time of day
const BAR_COLORS = {
  morning: '#f97316',
  afternoon: '#06b6d4',
  evening: '#f59e0b',
  night: '#8b5cf6'
};

const CookingTimeChart: React.FC<CookingTimeChartProps> = ({ timeData }) => {
  const { timeOfDay } = useBackground();
  const barColor = BAR_COLORS[timeOfDay];
  
  // Add animation for first render
  const [isAnimating, setIsAnimating] = React.useState(true);
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 1200); // Slightly delayed from the categories chart
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <GlassCard className={`transition-all duration-700 ${isAnimating ? 'scale-95 opacity-80' : 'scale-100 opacity-100'}`}>
      <GlassCardHeader>
        <GlassCardTitle className="text-xl font-serif">Cooking Time Trends</GlassCardTitle>
      </GlassCardHeader>
      <GlassCardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={timeData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#f2f2f2' }} 
                axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
              />
              <YAxis 
                label={{ 
                  value: 'Minutes', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fill: '#f2f2f2', fontSize: 12 }
                }} 
                tick={{ fill: '#f2f2f2' }}
                axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
              />
              <Tooltip 
                formatter={(value) => [`${value} min`, 'Time']}
                contentStyle={{ 
                  backgroundColor: 'rgba(23, 23, 23, 0.8)', 
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)' 
                }}
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              />
              <Bar 
                dataKey="value" 
                fill={barColor} 
                radius={[4, 4, 0, 0]} 
                className="transition-colors duration-500"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCardContent>
    </GlassCard>
  );
};

export default CookingTimeChart;
