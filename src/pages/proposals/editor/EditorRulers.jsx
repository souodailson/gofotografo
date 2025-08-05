import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

const Ruler = ({ type, scrollPos, containerSize }) => {
  const rulerRef = useRef(null);
  const [marks, setMarks] = useState([]);

  useEffect(() => {
    if (!rulerRef.current) return;
    const size = type === 'horizontal' ? rulerRef.current.offsetWidth : rulerRef.current.offsetHeight;
    const newMarks = [];
    const interval = 100;
    const smallInterval = 10;

    for (let i = 0; i < size + 2000; i += smallInterval) {
      if (i % interval === 0) {
        newMarks.push({ pos: i, type: 'large' });
      } else if (i % (interval / 2) === 0) {
        newMarks.push({ pos: i, type: 'medium' });
      } else {
        newMarks.push({ pos: i, type: 'small' });
      }
    }
    setMarks(newMarks);
  }, [type, containerSize]);

  const offset = type === 'horizontal' ? -scrollPos.x : -scrollPos.y;

  return (
    <div
      ref={rulerRef}
      className={cn(
        'absolute bg-background text-muted-foreground text-[10px] pointer-events-none',
        type === 'horizontal' ? 'w-full h-6 top-0 left-0' : 'h-full w-6 top-0 left-0'
      )}
    >
      <div
        className="relative w-full h-full"
        style={{ transform: type === 'horizontal' ? `translateX(${offset}px)` : `translateY(${offset}px)` }}
      >
        {marks.map((mark) => (
          <div
            key={mark.pos}
            className={cn(
              'absolute bg-muted-foreground',
              type === 'horizontal'
                ? 'bottom-0'
                : 'right-0',
              {
                'h-4 w-px': type === 'horizontal' && mark.type === 'large',
                'h-2 w-px': type === 'horizontal' && mark.type === 'medium',
                'h-1 w-px': type === 'horizontal' && mark.type === 'small',
                'w-4 h-px': type === 'vertical' && mark.type === 'large',
                'w-2 h-px': type === 'vertical' && mark.type === 'medium',
                'w-1 h-px': type === 'vertical' && mark.type === 'small',
              }
            )}
            style={type === 'horizontal' ? { left: mark.pos } : { top: mark.pos }}
          >
            {mark.type === 'large' && mark.pos > 0 && (
              <span
                className="absolute"
                style={
                  type === 'horizontal'
                    ? { left: '2px', bottom: '100%' }
                    : { top: '-6px', right: '100%', marginRight: '2px', writingMode: 'vertical-rl', textOrientation: 'sideways' }
                }
              >
                {mark.pos}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const EditorRulers = ({ scrollContainerRef }) => {
  const [scrollPos, setScrollPos] = useState({ x: 0, y: 0 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setScrollPos({ x: container.scrollLeft, y: container.scrollTop });
    };

    const resizeObserver = new ResizeObserver(() => {
        setContainerSize({ width: container.offsetWidth, height: container.offsetHeight });
    });

    container.addEventListener('scroll', handleScroll);
    resizeObserver.observe(container);

    handleScroll();
    setContainerSize({ width: container.offsetWidth, height: container.offsetHeight });

    return () => {
      container.removeEventListener('scroll', handleScroll);
      resizeObserver.unobserve(container);
    };
  }, [scrollContainerRef]);

  return (
    <div className="absolute -top-4 -left-4 right-0 bottom-0 pointer-events-none z-20">
      <div className="sticky top-0 left-0 w-full h-6 z-10">
        <Ruler type="horizontal" scrollPos={scrollPos} containerSize={containerSize} />
      </div>
      <div className="sticky top-0 left-0 h-full w-6 z-10">
        <Ruler type="vertical" scrollPos={scrollPos} containerSize={containerSize} />
      </div>
      <div className="absolute top-0 left-0 w-6 h-6 bg-background z-20" />
    </div>
  );
};

export default EditorRulers;