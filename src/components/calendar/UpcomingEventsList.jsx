import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Users, Briefcase } from 'lucide-react';
import { format, parseISO, isToday, isTomorrow, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const UpcomingEventsList = ({ combinedEvents, onEventClick }) => {
  const now = new Date();
  
  const upcomingEvents = combinedEvents
    .filter(event => {
      if (!event.start || !isValid(new Date(event.start))) return false;
      const eventStart = new Date(event.start);
      return eventStart >= now && event.type !== 'available-slot';
    })
    .sort((a, b) => new Date(a.start) - new Date(b.start))
    .slice(0, 7);

  if (upcomingEvents.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 p-6 bg-card rounded-xl shadow-lg border border-border text-center"
      >
        <Calendar size={48} className="mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2 text-foreground">Sem Próximos Eventos</h3>
        <p className="text-muted-foreground">Não há eventos agendados para os próximos dias.</p>
      </motion.div>
    );
  }

  const formatDateDisplay = (date) => {
    const d = new Date(date);
    if (!isValid(d)) return 'Data inválida';
    if (isToday(d)) return 'Hoje';
    if (isTomorrow(d)) return 'Amanhã';
    return format(d, "EEEE, dd 'de' MMMM", { locale: ptBR });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6"
    >
      <h2 className="text-xl font-semibold text-foreground mb-4">Próximos Eventos</h2>
      <div className="space-y-4">
        {upcomingEvents.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onEventClick(event)}
            className="bg-card p-4 rounded-lg shadow-md border border-border cursor-pointer hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
              <h3 className="font-semibold text-foreground text-base sm:text-lg">{event.title}</h3>
              <span className={`text-xs px-2 py-1 rounded-full font-medium
                ${event.isGoogleEvent ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' 
                                     : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'}`}>
                {event.isGoogleEvent ? 'Google Calendar' : 'GO.Fotógrafo'}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <div className="flex items-center">
                <Calendar size={14} className="mr-2" />
                <span>{formatDateDisplay(event.start)}</span>
              </div>
              <div className="flex items-center">
                <Clock size={14} className="mr-2" />
                <span>{event.time || format(new Date(event.start), 'HH:mm')}</span>
              </div>
              {event.location && (
                <div className="flex items-center sm:col-span-2">
                  <MapPin size={14} className="mr-2" />
                  <span>{event.location}</span>
                </div>
              )}
              {!event.isGoogleEvent && event.clientData && (
                <div className="flex items-center">
                  <Users size={14} className="mr-2" />
                  <span>Cliente: {event.clientData.name}</span>
                </div>
              )}
               {!event.isGoogleEvent && event.packageData && (
                <div className="flex items-center">
                  <Briefcase size={14} className="mr-2" />
                  <span>Pacote: {event.packageData.name}</span>
                </div>
              )}
            </div>
            {event.description && !event.isGoogleEvent && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{event.description}</p>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default UpcomingEventsList;