import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Settings, ListChecks } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useData } from '@/contexts/DataContext';
import { format, parseISO, isValid } from 'date-fns';
import { 
  getGoogleAuthUrl, 
  listGoogleCalendarEvents, 
  refreshGoogleAccessToken,
} from '@/lib/googleCalendar';
import CalendarHeader from '@/components/calendar/CalendarHeader';
import CalendarGridMonth from '@/components/calendar/views/CalendarGridMonth';
import CalendarViewAgenda from '@/components/calendar/views/CalendarViewAgenda';
import CalendarViewWeek from '@/components/calendar/views/CalendarViewWeek';
import CalendarViewDay from '@/components/calendar/views/CalendarViewDay';
import UpcomingEventsList from '@/components/calendar/UpcomingEventsList';
import GoogleAuthControls from '@/components/calendar/GoogleAuthControls';
import { useModalState } from '@/contexts/ModalStateContext';
import BookingSettingsModal from '@/components/modals/BookingSettingsModal';
import AvailabilityModal from '@/components/modals/AvailabilityModal';
import useMobileLayout from '@/hooks/useMobileLayout';
import { useNavigate } from 'react-router-dom';

const CalendarComponent = ({ isMobile: propIsMobile, setActiveTab }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { 
    workflowCards, 
    getClientById, 
    getServicePackageById, 
    importGoogleEventsAsWorkflowCards,
    refreshData, 
    user,
    planStatus,
    availabilitySlots,
    settings,
  } = useData(); 
  const { openModal, closeModal, openModals } = useModalState();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [googleEvents, setGoogleEvents] = useState([]);
  const [isGoogleAuthInProgress, setIsGoogleAuthInProgress] = useState(false);
  const [calendarViewMode, setCalendarViewMode] = useState(propIsMobile ? 'month' : 'month');
  
  const googleTokens = useMemo(() => settings?.google_tokens, [settings]);
  const { isMobile } = useMobileLayout();

  const storeTokens = useCallback(async (tokens) => {
    try {
      await refreshData('settings');
    } catch (error) {
      console.error("Error storing Google tokens in DB", error);
    }
  }, [refreshData]);

  const clearTokens = useCallback(async () => {
    try {
      await refreshData('settings');
      setGoogleEvents([]);
    } catch (error) {
      console.error("Error clearing Google tokens from DB", error);
    }
  }, [refreshData]);
  
  const combinedEvents = useMemo(() => {
    const appEvents = workflowCards
      .filter(card => card.date && !card.archived && card.status === 'agendado')
      .map(card => {
        const client = card.client_id ? getClientById(card.client_id) : null;
        const servicePackage = card.service_package_id ? getServicePackageById(card.service_package_id) : null;
        const eventTime = card.time || '00:00';
        
        let startDateTime;
        try {
            startDateTime = parseISO(`${card.date}T${eventTime}:00`);
            if (!isValid(startDateTime)) {
                startDateTime = new Date();
            }
        } catch(e) {
            startDateTime = new Date();
        }
        
        return {
          id: `app-${card.id}`,
          title: card.title || (client ? client.name : 'Evento App'),
          date: card.date, 
          time: eventTime, 
          start: startDateTime,
          end: new Date(startDateTime.getTime() + (1 * 60 * 60 * 1000)), 
          description: card.description || 'Não especificado',
          type: 'app-event',
          isGoogleEvent: false,
          rawCard: card,
          clientData: client, 
          packageData: servicePackage,
          google_event_id: card.google_event_id
        };
      });

    const gEvents = googleEvents.map(event => ({
      id: `google-${event.id}`,
      title: event.summary || 'Evento Google',
      date: event.start?.date || (event.start?.dateTime ? event.start.dateTime.split('T')[0] : new Date().toISOString().split('T')[0]),
      time: event.start?.dateTime ? format(parseISO(event.start.dateTime), 'HH:mm') : 'Dia todo',
      start: event.start?.dateTime ? parseISO(event.start.dateTime) : (event.start?.date ? parseISO(event.start.date) : new Date()),
      end: event.end?.dateTime ? parseISO(event.end.dateTime) : (event.end?.date ? parseISO(event.end.date) : new Date()),
      location: event.location || 'Não especificado',
      type: 'google-event',
      isGoogleEvent: true,
      rawEvent: event,
      htmlLink: event.htmlLink,
      google_event_id: event.id
    }));
    
    const availabilityEvents = availabilitySlots.map(slot => ({
      id: `avail-${slot.id}`,
      title: slot.is_booked ? 'Horário Reservado' : 'Disponível',
      start: parseISO(slot.start_time),
      end: parseISO(slot.end_time),
      type: slot.is_booked ? 'booked-slot' : 'available-slot',
      isGoogleEvent: false,
      rawSlot: slot
    }));

    return [...appEvents, ...gEvents, ...availabilityEvents].sort((a,b) => a.start - b.start);
  }, [workflowCards, googleEvents, getClientById, getServicePackageById, availabilitySlots]);


  const fetchGoogleEventsCallback = useCallback(async (currentTokens, shouldImport = false) => {
    if (!(planStatus === 'PROFISSIONAL' || planStatus === 'STUDIO_PRO')) return;
    if (!currentTokens || !currentTokens.access_token) {
      toast({ title: "Autenticação Necessária", description: "Por favor, autentique com o Google Calendar primeiro." });
      return;
    }
    toast({ title: "Sincronizando...", description: "Buscando eventos do Google Calendar."});
    try {
      const events = await listGoogleCalendarEvents(currentTokens.access_token);
      setGoogleEvents(events || []);
      toast({ title: "Eventos do Google Calendar Carregados!" });

      if (shouldImport && events && events.length > 0) {
        const importedCount = await importGoogleEventsAsWorkflowCards(events);
        if (importedCount > 0) {
          toast({ title: "Eventos Importados!", description: `${importedCount} novo(s) evento(s) do Google Calendar foram adicionados ao fluxo de trabalho.` });
        } else {
          toast({ title: "Nenhum Novo Evento", description: "Nenhum novo evento do Google Calendar para importar." });
        }
        await refreshData();
      }

    } catch (error) {
      console.error("Error fetching Google Calendar events:", error);
      toast({ title: "Erro ao buscar eventos", description: error.message, variant: "destructive" });
      if (error.message.toLowerCase().includes('token') || error.message.toLowerCase().includes('auth')) {
        if (currentTokens.refresh_token) {
          toast({ title: "Token Expirado", description: "Tentando atualizar token de acesso...", variant: "default" });
          try {
            const { newTokens } = await refreshGoogleAccessToken(currentTokens.refresh_token);
            const updatedTokens = { ...currentTokens, access_token: newTokens.access_token, expiry_date: Date.now() + newTokens.expires_in * 1000 };
            await storeTokens(updatedTokens);
            toast({ title: "Token Atualizado!", description: "Tentando buscar eventos novamente.", variant: "success" });
            await fetchGoogleEventsCallback(updatedTokens, shouldImport);
          } catch (refreshError) {
            console.error("Error refreshing access token:", refreshError);
            toast({ title: "Falha ao Atualizar Token", description: `Não foi possível atualizar a sessão com o Google. Por favor, autentique novamente: ${refreshError.message}`, variant: "destructive" });
            await clearTokens();
          }
        } else {
           toast({ title: "Sessão Expirada", description: "Sua autenticação com o Google expirou e não há refresh token. Por favor, autentique novamente.", variant: "warning" });
           await clearTokens();
        }
      }
    }
  }, [toast, importGoogleEventsAsWorkflowCards, refreshData, planStatus, storeTokens, clearTokens]);


  useEffect(() => {
    if (!(planStatus === 'PROFISSIONAL' || planStatus === 'STUDIO_PRO')) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const authSuccess = urlParams.get('google_auth_success');
    const authError = urlParams.get('google_auth_error');

    if (authError) {
      toast({ title: "Erro de Autenticação Google", description: `O Google retornou um erro: ${authError}`, variant: "destructive" });
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (authSuccess) {
      toast({ title: "Google Calendar Autenticado!", description: "Agora você pode sincronizar seus eventos." });
      refreshData('settings').then(() => {
        if (settings?.google_tokens) {
          fetchGoogleEventsCallback(settings.google_tokens, true);
        }
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (googleTokens && googleEvents.length === 0 && !isGoogleAuthInProgress) {
        fetchGoogleEventsCallback(googleTokens, false);
    }
  }, [googleTokens, toast, fetchGoogleEventsCallback, isGoogleAuthInProgress, planStatus, refreshData, settings]);


  const handleAddEventOnDate = (date, time = null) => {
    setSelectedDate(date);
    const initialData = {
      date: format(date, 'yyyy-MM-dd'),
      time: time,
      status: 'agendado',
    };
    openModal('workflow', { cardId: null, initialData });
  };
  
  const handleAddEvent = () => {
    handleAddEventOnDate(selectedDate || new Date());
  };


  const handleEventClick = (event) => {
    if (event.isGoogleEvent) {
       if (event.htmlLink) {
        window.open(event.htmlLink, '_blank');
      } else {
        toast({ title: "Evento do Google", description: "Detalhes do evento: " + event.title });
      }
    } else if (event.type === 'available-slot' || event.type === 'booked-slot') {
      openModal('availability', { 
        existingSlot: event.rawSlot,
        date: event.start,
      });
    } else {
      openModal('workflow', { cardId: event.rawCard.id });
    }
  };
  
  const handleGoogleAuth = async () => {
    if (!user) {
      toast({ title: "Erro", description: "Usuário não encontrado.", variant: "destructive" });
      return;
    }
    setIsGoogleAuthInProgress(true);
    toast({ title: "Iniciando autenticação com Google...", description: "Você será redirecionado." });
    try {
      const { authUrl } = await getGoogleAuthUrl(user.id);
      if (authUrl) {
        window.location.href = authUrl;
      } else {
        throw new Error("URL de autenticação não recebida.");
      }
    } catch (error) {
      toast({ title: "Erro de Autenticação", description: `Não foi possível obter a URL de autenticação do Google: ${error.message}`, variant: "destructive" });
      setIsGoogleAuthInProgress(false);
    }
  };
  
  const handleDateClick = (date, time) => {
    openModal('availability', { date, time });
  };

  const renderCalendarView = () => {
    switch (calendarViewMode) {
      case 'month':
        return <CalendarGridMonth
                  currentDate={currentDate}
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  combinedEvents={combinedEvents}
                  onEventClick={handleEventClick}
                  onDateClick={handleDateClick}
               />;
      case 'week':
        return <CalendarViewWeek
                  currentDate={currentDate}
                  combinedEvents={combinedEvents}
                  onEventClick={handleEventClick}
                  onDateClick={handleDateClick}
               />;
      case 'day':
        return <CalendarViewDay
                  currentDate={currentDate}
                  combinedEvents={combinedEvents}
                  onEventClick={handleEventClick}
                  onDateClick={handleDateClick}
              />;
      case 'agenda':
        return <CalendarViewAgenda 
                  combinedEvents={combinedEvents} 
                  onEventClick={handleEventClick} 
               />;
      default:
        return <CalendarGridMonth
                 currentDate={currentDate}
                 selectedDate={selectedDate}
                 setSelectedDate={setSelectedDate}
                 combinedEvents={combinedEvents}
                 onEventClick={handleEventClick}
                 onDateClick={handleDateClick}
               />;
    }
  };

  return (
    <>
      <BookingSettingsModal
        isOpen={!!openModals.bookingSettings}
        onClose={() => closeModal('bookingSettings')}
      />
      <AvailabilityModal
        isOpen={!!openModals.availability}
        onClose={() => closeModal('availability')}
        initialData={openModals.availability}
      />
      <div className="space-y-4 sm:space-y-6">
        <div className={`flex flex-col ${isMobile ? 'items-center text-center' : 'sm:flex-row sm:items-center sm:justify-between'} gap-4`}>
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className={isMobile ? "hidden" : ""}>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground titulo-gradiente">Calendário</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">Gerencie seus agendamentos e compromissos</p>
          </motion.div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
            <Button 
              variant="outline"
              onClick={() => navigate('/availability-manager')}
              className="w-full sm:w-auto"
            >
              <ListChecks className="w-4 h-4 mr-2" />
              Gerenciar Horários
            </Button>
            <Button 
              variant="outline"
              onClick={() => openModal('bookingSettings')}
              className="w-full sm:w-auto"
            >
              <Settings className="w-4 h-4 mr-2" />
              Agenda PRO
            </Button>
            <GoogleAuthControls
              googleTokens={googleTokens}
              isGoogleAuthInProgress={isGoogleAuthInProgress}
              onAuth={handleGoogleAuth}
              onSync={() => fetchGoogleEventsCallback(googleTokens, true)}
              onLogout={clearTokens}
              className="w-full sm:w-auto"
            />
            <Button 
              onClick={handleAddEvent}
              className="btn-custom-gradient text-white shadow-lg w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Novo Agendamento</span>
              <span className="sm:hidden">Agendar</span>
            </Button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl p-3 sm:p-6 shadow-lg border border-border"
        >
          <CalendarHeader
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            currentView={calendarViewMode}
            setCurrentView={setCalendarViewMode}
            isMobile={isMobile}
          />
          {renderCalendarView()}
        </motion.div>

        <UpcomingEventsList
            combinedEvents={combinedEvents.filter(event => event.type !== 'available-slot')}
            onEventClick={handleEventClick}
        />
      </div>
    </>
  );
};

export default CalendarComponent;