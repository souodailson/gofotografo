import React from 'react';
import { format, parseISO, isSameDay, getHours, getMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';

const CalendarViewDay = ({ currentDate, combinedEvents, onEventClick, onDateClick }) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getEventsForHour = (hour) => {
    return combinedEvents.filter(event => {
      if (!event.start || !isSameDay(event.start, currentDate)) return false;
      const eventHour = getHours(event.start);
      return eventHour === hour;
    }).sort((a,b) => getMinutes(a.start) - getMinutes(b.start));
  };

  const handleHourClick = (hour) => {
    const time = format(new Date(0,0,0, hour), 'HH:mm');
    if (onDateClick) onDateClick(currentDate, time);
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="grid grid-cols-[auto_1fr]">
        <div className="p-2 text-xs font-medium text-muted-foreground bg-accent/50 sticky top-0 z-10 border-b border-r border-border col-span-2 text-center">
          {format(currentDate, 'EEEE, dd MMMM yyyy', { locale: ptBR })}
        </div>
        {hours.map(hour => (
          <React.Fragment key={hour}>
            <div 
              className="p-2 text-xs text-center text-muted-foreground bg-accent/50 border-r border-b border-border h-20 flex items-center justify-center cursor-pointer hover:bg-accent/80 transition-colors"
              onClick={() => handleHourClick(hour)}
            >
              {format(new Date(0, 0, 0, hour), 'HH:mm')}
            </div>
            <div
              className="border-b border-border p-1 h-20 overflow-y-auto space-y-1 relative cursor-pointer hover:bg-accent/30 transition-colors"
              onClick={() => handleHourClick(hour)}
            >
              {getEventsForHour(hour).map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-1 rounded text-xs leading-tight cursor-pointer ${
                    event.isGoogleEvent ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                  }`}
                  title={`${event.title} (${event.time})`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventClick(event);
                  }}
                >
                  <div className="font-semibold">{event.time} - {event.title}</div>
                  {event.description && <div className="text-[10px] opacity-80 truncate">{event.description}</div>}
                </motion.div>
              ))}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default CalendarViewDay;