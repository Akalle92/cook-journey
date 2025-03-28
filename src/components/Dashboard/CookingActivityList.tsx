
import React from 'react';
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from '@/components/ui/glass-card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Activity } from '@/hooks/useDashboardStats';
import { Calendar, Clock, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CookingActivityListProps {
  activities: Activity[];
}

const CookingActivityList: React.FC<CookingActivityListProps> = ({ activities }) => {
  // Add animation for first render
  const [isAnimating, setIsAnimating] = React.useState(true);
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 1400); // Slightly delayed from the other components
    
    return () => clearTimeout(timer);
  }, []);
  
  if (activities.length === 0) {
    return (
      <GlassCard className={`transition-all duration-700 ${isAnimating ? 'scale-95 opacity-80' : 'scale-100 opacity-100'}`}>
        <GlassCardHeader>
          <GlassCardTitle className="text-xl font-serif">Recent Activity</GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent>
          <p className="text-muted-foreground text-center py-6">No cooking activity recorded yet.</p>
        </GlassCardContent>
      </GlassCard>
    );
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'cooked':
        return <Clock className="h-4 w-4 text-teal" />;
      case 'rated':
        return <Trophy className="h-4 w-4 text-amber-400" />;
      default:
        return <Calendar className="h-4 w-4 text-coral" />;
    }
  };

  return (
    <GlassCard className={`transition-all duration-700 ${isAnimating ? 'scale-95 opacity-80' : 'scale-100 opacity-100'}`}>
      <GlassCardHeader>
        <GlassCardTitle className="text-xl font-serif">Recent Activity</GlassCardTitle>
      </GlassCardHeader>
      <GlassCardContent>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-white/5">
              <TableHead>Date</TableHead>
              <TableHead>Recipe</TableHead>
              <TableHead>Activity</TableHead>
              <TableHead className="hidden md:table-cell">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((activity, index) => (
              <TableRow 
                key={index} 
                className={`transition-all duration-500 hover:bg-white/5 ${
                  isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
                }`}
                style={{ transitionDelay: `${index * 100 + 300}ms` }}
              >
                <TableCell className="font-mono text-xs">{activity.date}</TableCell>
                <TableCell className="font-medium">{activity.recipeName}</TableCell>
                <TableCell>
                  <Badge className="flex items-center gap-1 capitalize">
                    {getActivityIcon(activity.type)}
                    {activity.type}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">{activity.details}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </GlassCardContent>
    </GlassCard>
  );
};

export default CookingActivityList;
