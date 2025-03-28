
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Activity } from '@/hooks/useDashboardStats';
import { Calendar, Clock, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CookingActivityListProps {
  activities: Activity[];
}

const CookingActivityList: React.FC<CookingActivityListProps> = ({ activities }) => {
  if (activities.length === 0) {
    return (
      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-xl font-serif">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-6">No cooking activity recorded yet.</p>
        </CardContent>
      </Card>
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
    <Card className="glass">
      <CardHeader>
        <CardTitle className="text-xl font-serif">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Recipe</TableHead>
              <TableHead>Activity</TableHead>
              <TableHead className="hidden md:table-cell">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((activity, index) => (
              <TableRow key={index}>
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
      </CardContent>
    </Card>
  );
};

export default CookingActivityList;
