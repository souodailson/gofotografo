import React, { useState } from 'react';
import { format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Search, Settings, Calendar, UserCircle, X, ListChecks } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useData } from '@/contexts/DataContext';
import { useModalState } from '@/contexts/ModalStateContext';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import GoogleAuthControls from '@/components/calendar/GoogleAuthControls';

const CalendarHeader = ({ 
  currentDate, 
  setCurrentDate, 
  currentView, 
  setCurrentView, 
  isMobile,
  onSearch,
}) => {
  const { settings: userSettings } = useData();
  const { openModal } = useModalState();
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handlePrev = () => {
    let newDate;
    switch (currentView) {
      case 'month': newDate = subMonths(currentDate, 1); break;
      case 'week': newDate = subWeeks(currentDate, 1); break;
      case 'day': newDate = subDays(currentDate, 1); break;
      default: newDate = subMonths(currentDate, 1);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    let newDate;
    switch (currentView) {
      case 'month': newDate = addMonths(currentDate, 1); break;
      case 'week': newDate = addWeeks(currentDate, 1); break;
      case 'day': newDate = addDays(currentDate, 1); break;
      default: newDate = addMonths(currentDate, 1);
    }
    setCurrentDate(newDate);
  };
  
  const getFormattedDate = () => {
    if (currentView === 'day') {
      return format(currentDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    }
    return format(currentDate, 'MMMM yyyy', { locale: ptBR });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    onSearch(e.target.value);
  };

  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible);
    if (isSearchVisible) {
      setSearchTerm('');
      onSearch('');
    }
  };

  return (
    <header className="flex items-center justify-between p-2 md:p-4 border-b border-border flex-shrink-0 relative">
      <div className="flex items-center space-x-2 md:space-x-4">
        <div className="flex items-center gap-2">
          <Calendar size={32} className="text-blue-500"/>
          <span className="text-xl text-foreground/80">Agenda</span>
        </div>
      </div>

      <AnimatePresence>
        {isSearchVisible && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            className="absolute left-1/2 -translate-x-1/2 flex items-center"
          >
            <Input
              type="text"
              placeholder="Buscar eventos..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-64 md:w-96"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center space-x-2" style={{ visibility: isSearchVisible ? 'hidden' : 'visible' }}>
        <Button variant="outline" onClick={() => setCurrentDate(new Date())}>Hoje</Button>
        <Button variant="ghost" size="icon" onClick={handlePrev}><ChevronLeft className="h-5 w-5" /></Button>
        <Button variant="ghost" size="icon" onClick={handleNext}><ChevronRight className="h-5 w-5" /></Button>
        <h2 className="text-lg md:text-xl font-medium text-foreground capitalize w-auto md:w-48 text-center">
          {getFormattedDate()}
        </h2>
      </div>

      <div className="flex items-center space-x-1 md:space-x-2">
        <Button variant="ghost" size="icon" className="hidden md:inline-flex" onClick={toggleSearch}>
          {isSearchVisible ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
        </Button>
        <GoogleAuthControls />
        <Button 
          variant="ghost" 
          size="icon" 
          className="hidden md:inline-flex" 
          onClick={() => navigate('/availability-manager')}
          title="Gerenciar Disponibilidade"
        >
          <ListChecks className="h-5 w-5" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="hidden md:inline-flex" 
          onClick={() => openModal('bookingSettings')}
          title="Configurações da Agenda PRO"
        >
          <Settings className="h-5 w-5" />
        </Button>
        
        <Select value={currentView} onValueChange={setCurrentView}>
          <SelectTrigger className="w-auto min-w-[80px] md:min-w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Dia</SelectItem>
            <SelectItem value="week">Semana</SelectItem>
            <SelectItem value="month">Mês</SelectItem>
            <SelectItem value="agenda">Agenda</SelectItem>
          </SelectContent>
        </Select>

        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
          {userSettings?.profile_photo ? (
            <img src={userSettings.profile_photo} alt="Foto de Perfil" className="w-full h-full object-cover" />
          ) : (
            <UserCircle className="w-6 h-6 text-muted-foreground" />
          )}
        </div>
      </div>
    </header>
  );
};

export default CalendarHeader;