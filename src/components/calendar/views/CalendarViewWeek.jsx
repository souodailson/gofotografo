import React from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, parseISO, isSameDay, getHours, getMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';

const CalendarViewWeek = ({ currentDate, combinedEvents, onEventClick, onDateClick }) => {
  const weekStart = startOfWeek(currentDate, { locale: ptBR });
  const weekEnd = endOfWeek(currentDate, { locale: ptBR });
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getEventsForHour = (day, hour) => {
    return combinedEvents.filter(event => {
      if (!event.start || !isSameDay(event.start, day)) return false;
      const eventHour = getHours(event.start);
      return eventHour === hour;
    });
  };
  
  const handleCellClick = (day, hour) => {
    const time = format(new Date(0, 0, 0, hour), 'HH:mm');
    if (onDateClick) onDateClick(day, time);
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="grid grid-cols-[auto_repeat(7,1fr)]">
        <div className="p-2 text-xs font-medium text-muted-foreground bg-accent/50 sticky top-0 z-10 border-b border-r border-border">Hora</div>
        {daysInWeek.map(day => (
          <div 
            key={day.toString()}
            className="p-2 text-center text-xs font-medium text-muted-foreground bg-accent/50 sticky top-0 z-10 border-b border-border cursor-pointer hover:bg-accent/80"
            onClick={() => onDateClick(day, null)}
          >
            <span className="block sm:hidden">{format(day, 'E', { locale: ptBR })}</span>
            <span className="hidden sm:block">{format(day, 'EEE dd/MM', { locale: ptBR })}</span>
          </div>
        ))}
        {hours.map(hour => (
          <React.Fragment key={hour}>
            <div 
              className="p-2 text-xs text-center text-muted-foreground bg-accent/50 border-r border-border h-16 flex items-center justify-center cursor-pointer hover:bg-accent/80"
              onClick={() => handleCellClick(currentDate, hour)}
            >
              {format(new Date(0, 0, 0, hour), 'HH:mm')}
            </div>
            {daysInWeek.map(day => {
              const eventsInHour = getEventsForHour(day, hour);
              return (
                <div
                  key={`${day.toString()}-${hour}`}
                  className="border-b border-l border-border p-1 h-16 overflow-y-auto space-y-0.5 relative cursor-pointer hover:bg-accent/30"
                  onClick={() => handleCellClick(day, hour)}
                >
                  {eventsInHour.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-0.5 rounded-sm text-[10px] leading-tight truncate cursor-pointer ${
                        event.isGoogleEvent ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                      }`}
                      title={`${event.title} (${event.time})`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                    >
                      <span className="font-medium">{event.time}</span> {event.title}
                    </motion.div>
                  ))}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default CalendarViewWeek;