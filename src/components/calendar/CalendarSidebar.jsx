import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CalendarSidebar = ({ isOpen, currentDate, setCurrentDate, onAddEvent }) => {
  if (!isOpen) {
    return null;
  }
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ width: 0, opacity: 0, padding: 0 }}
          animate={{ width: 280, opacity: 1, padding: '1rem' }}
          exit={{ width: 0, opacity: 0, padding: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="bg-card border-r border-border flex-shrink-0 overflow-hidden"
        >
          <div className="space-y-6">
            <Button onClick={onAddEvent} className="w-full btn-custom-gradient shadow-lg">
              <Plus className="w-4 h-4 mr-2" />
              Criar
            </Button>

            <DayPicker
              mode="single"
              selected={currentDate}
              onSelect={setCurrentDate}
              locale={ptBR}
              className="!m-0"
              classNames={{
                root: 'w-full',
                caption: 'flex justify-between items-center',
                nav_button: 'h-8 w-8 hover:bg-accent rounded-full',
                head_cell: 'w-8 font-normal text-muted-foreground',
                cell: 'w-8 h-8 text-center',
                day: 'w-8 h-8 rounded-full hover:bg-accent',
                day_today: 'font-bold text-primary',
                day_selected: 'bg-primary text-primary-foreground hover:bg-primary/90',
              }}
            />
          
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Minhas Agendas</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="trabalhos" defaultChecked />
                  <label htmlFor="trabalhos" className="text-sm">Trabalhos</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="disponivel" defaultChecked />
                  <label htmlFor="disponivel" className="text-sm">Horários Disponíveis</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="google" defaultChecked />
                  <label htmlFor="google" className="text-sm">Google Calendar</label>
                </div>
              </div>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

export default CalendarSidebar;