import { useMemo } from 'react';

export const useVirtualization = (items, itemHeight, containerHeight, scrollTop) => {
  return useMemo(() => {
    const itemCount = items.length;
    const visibleStart = Math.floor(scrollTop / itemHeight);
    const visibleEnd = Math.min(
      visibleStart + Math.ceil(containerHeight / itemHeight) + 2,
      itemCount
    );

    const visibleItems = items.slice(visibleStart, visibleEnd).map((item, index) => ({
      ...item,
      virtualIndex: visibleStart + index,
      top: (visibleStart + index) * itemHeight,
    }));

    return {
      visibleItems,
      totalHeight: itemCount * itemHeight,
      startIndex: visibleStart,
      endIndex: visibleEnd,
    };
  }, [items, itemHeight, containerHeight, scrollTop]);
};