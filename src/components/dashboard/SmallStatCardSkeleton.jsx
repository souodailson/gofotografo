import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const SmallStatCardSkeleton = () => {
  return (
    <div className="bg-card rounded-xl p-4 shadow-lg border border-border text-center h-full flex flex-col justify-center items-center">
      <Skeleton className="w-10 h-10 rounded-lg mx-auto mb-2" />
      <Skeleton className="h-7 w-16 mx-auto mb-1" />
      <Skeleton className="h-4 w-20 mx-auto" />
    </div>
  );
};

export default SmallStatCardSkeleton;