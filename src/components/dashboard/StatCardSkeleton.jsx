import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const StatCardSkeleton = () => {
  return (
    <div className="bg-card rounded-xl p-4 sm:p-6 shadow-lg border border-border h-full flex flex-col justify-center">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-32" />
        </div>
        <Skeleton className="w-12 h-12 rounded-lg" />
      </div>
    </div>
  );
};

export default StatCardSkeleton;