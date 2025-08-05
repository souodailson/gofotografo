import React from 'react';
import { format, parseISO, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { Clock, MapPin, ExternalLink } from 'lucide-react';

const CalendarViewAgenda = ({ combinedEvents, onEventClick }) => {
  const groupedEvents = combinedEvents.reduce((acc, event) => {
    if (!event.date) return acc;
    const eventDate = parseISO(event.date);
    const dateKey = format(eventDate, 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(event);
    return acc;
  }, {});

  const sortedDateKeys = Object.keys(groupedEvents).sort();

  return (
    <div className="space-y-6 p-1">
      {sortedDateKeys.length === 0 && (
        <p className="text-muted-foreground text-center py-8">Nenhum evento agendado.</p>
      )}
      {sortedDateKeys.map((dateKey, groupIndex) => {
        const eventsForDay = groupedEvents[dateKey];
        const dayDate = parseISO(dateKey);
        return (
          <motion.div 
            key={dateKey}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: groupIndex * 0.1 }}
          >
            <h3 className="text-lg font-semibold text-foreground mb-3 capitalize">
              {format(dayDate, 'EEEE, dd MMMM yyyy', { locale: ptBR })}
            </h3>
            <div className="space-y-2">
              {eventsForDay.map((event, eventIndex) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (groupIndex * 0.1) + (eventIndex * 0.05) }}
                  className="flex items-center justify-between p-3 bg-accent/50 dark:bg-accent/30 rounded-lg hover:shadow-md dark:hover:bg-accent/50 transition-all cursor-pointer"
                  onClick={() => onEventClick(event)}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                      event.isGoogleEvent ? 'bg-blue-500' : 'bg-purple-500'
                    }`} />
                    
                    <div className="flex-grow">
                      <h4 className="font-medium text-sm text-foreground truncate" title={event.title}>
                        {event.title}
                      </h4>
                      <div className="flex items-center space-x-3 text-xs text-muted-foreground mt-0.5">
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {event.time || 'Dia todo'}
                        </div>
                        {event.location && (
                          <div className="flex items-center truncate" title={event.location}>
                            <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                            <span className="truncate">{event.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {event.isGoogleEvent && event.htmlLink && (
                    <a href={event.htmlLink} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                      <ExternalLink className="w-4 h-4 text-blue-500 hover:text-blue-600" />
                    </a>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default CalendarViewAgenda;