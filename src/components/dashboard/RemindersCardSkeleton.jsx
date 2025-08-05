import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const RemindersCardSkeleton = () => {
  return (
    <Card className="h-full flex flex-col shadow-lg border-border bg-card/80 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-4">
        <div className="flex items-center">
          <Skeleton className="w-5 h-5 mr-2" />
          <Skeleton className="h-5 w-48" />
        </div>
      </CardHeader>
      <CardContent className="px-2 pb-4 flex-grow overflow-hidden">
        <div className="space-y-3 p-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start space-x-3 p-1 rounded-lg">
              <Skeleton className="w-9 h-9 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RemindersCardSkeleton;