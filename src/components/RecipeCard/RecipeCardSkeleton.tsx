import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const RecipeCardSkeleton: React.FC = () => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="aspect-video relative mb-4 rounded-lg overflow-hidden">
          <Skeleton className="w-full h-full" />
        </div>
        <Skeleton className="h-6 w-3/4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-4" />
        <Skeleton className="h-4 w-2/3 mb-4" />
        <div className="flex flex-wrap gap-2 mb-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-6 w-20" />
          ))}
        </div>
        <div className="flex items-center gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-1">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
}; 