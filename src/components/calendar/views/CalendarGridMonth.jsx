import React, { useMemo, useState, useRef } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, getDay, isSameDay } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ptBR } from 'date-fns/locale';

const CalendarGridMonth = ({ currentDate, selectedDate, setSelectedDate, combinedEvents, onEventClick, onDateClick }) => {
  const [hoveredDay, setHoveredDay] = useState(null);
  const openTimeout = useRef(null);
  const closeTimeout = useRef(null);

  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const firstDayOfMonth = startOfMonth(currentDate);
  const startingDayOfWeek = getDay(firstDayOfMonth);

  const getEventsForDay = (day) => {
    return combinedEvents.filter(event => {
      if (!event.start) return false;
      try {
        return isSameDay(event.start, day);
      } catch (e) {
        return false;
      }
    });
  };

  const eventColorClass = (event) => {
    switch (event.type) {
      case 'app-event': return 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 border-l-4 border-purple-400';
      case 'google-event': return 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-l-4 border-blue-400';
      case 'available-slot': return 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 border-l-4 border-green-400';
      case 'booked-slot': return 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 border-l-4 border-orange-400';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-l-4 border-gray-400';
    }
  };

  const handleMouseEnter = (day) => {
    clearTimeout(closeTimeout.current);
    openTimeout.current = setTimeout(() => {
      setHoveredDay(day.toString());
    }, 300);
  };

  const handleMouseLeave = () => {
    clearTimeout(openTimeout.current);
    closeTimeout.current = setTimeout(() => {
      setHoveredDay(null);
    }, 200);
  };

  const DayCell = ({ day }) => {
    const eventsOnDay = getEventsForDay(day);
    const eventsToShow = eventsOnDay.slice(0, 2);
    const dayString = day.toString();

    return (
      <Popover open={hoveredDay === dayString} onOpenChange={(isOpen) => setHoveredDay(isOpen ? dayString : null)}>
        <PopoverTrigger asChild>
          <div
            onMouseEnter={() => handleMouseEnter(day)}
            onMouseLeave={handleMouseLeave}
            onClick={() => {
              setSelectedDate(day);
              if (onDateClick) onDateClick(day, null);
            }}
            className={cn(
              'p-2 min-h-[80px] sm:min-h-[120px] cursor-pointer transition-colors group relative flex flex-col',
              isSameMonth(day, currentDate) ? 'bg-card hover:bg-accent' : 'bg-accent/30 text-muted-foreground hover:bg-accent/50',
              isToday(day) && 'ring-2 ring-primary dark:ring-primary z-10',
              selectedDate && isSameDay(day, selectedDate) && 'bg-primary/10 dark:bg-primary/20'
            )}
          >
            <span className={cn('text-sm', isToday(day) ? 'font-bold text-primary' : 'text-foreground')}>
              {format(day, 'd')}
            </span>
            <div className="flex-grow mt-1 space-y-0.5 overflow-hidden">
              <AnimatePresence>
                {eventsToShow.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn('p-0.5 rounded-sm text-xs truncate cursor-pointer', eventColorClass(event))}
                    title={event.title}
                    onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                  >
                    {event.title}
                  </motion.div>
                ))}
              </AnimatePresence>
              {eventsOnDay.length > 2 && (
                <div className="text-xs text-muted-foreground mt-0.5">
                  + {eventsOnDay.length - 2} mais
                </div>
              )}
            </div>
          </div>
        </PopoverTrigger>
        {eventsOnDay.length > 0 && (
          <PopoverContent 
            onMouseEnter={() => clearTimeout(closeTimeout.current)}
            onMouseLeave={handleMouseLeave}
            className="w-80 p-0" 
            side="top" 
            align="start"
          >
            <div className="p-4">
              <h4 className="font-medium capitalize">{format(day, "EEEE, dd 'de' MMMM", { locale: ptBR })}</h4>
            </div>
            <ScrollArea className="max-h-60">
              <div className="p-4 pt-0 space-y-2">
                {eventsOnDay.map(event => (
                  <div
                    key={event.id}
                    className={cn('p-2 rounded-md text-sm cursor-pointer', eventColorClass(event))}
                    onClick={() => onEventClick(event)}
                  >
                    <p className="font-semibold truncate">{event.title}</p>
                    <p className="text-xs opacity-80">{event.time || 'Dia todo'}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </PopoverContent>
        )}
      </Popover>
    );
  };

  return (
    <div className="grid grid-cols-7 gap-px bg-border border border-border rounded-lg overflow-hidden">
      {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
        <div key={day} className="py-2 text-center text-xs font-medium text-muted-foreground bg-accent/50">
          {day}
        </div>
      ))}
      {Array.from({ length: startingDayOfWeek }).map((_, i) => (
        <div key={`empty-${i}`} className="bg-accent/30 min-h-[80px] sm:min-h-[120px]"></div>
      ))}
      {daysInMonth.map((day) => (
        <DayCell key={day.toString()} day={day} />
      ))}
    </div>
  );
};

export default CalendarGridMonth;