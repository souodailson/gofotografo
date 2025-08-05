import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const ChartCardSkeleton = ({ isList = false }) => {
  return (
    <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden flex flex-col h-full">
      <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border">
        <div className="flex items-center">
          <Skeleton className="w-5 h-5 mr-3" />
          <Skeleton className="h-5 w-32" />
        </div>
      </div>
      <div className="p-2 sm:p-4 flex-grow">
        {isList ? (
          <div className="space-y-3 px-2 py-2">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg">
                <div className="flex-1 min-w-0">
                  <Skeleton className="h-4 w-4/5 mb-2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
                <div className="flex items-center ml-2">
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Skeleton className="h-full w-full" />
        )}
      </div>
    </div>
  );
};

export default ChartCardSkeleton;