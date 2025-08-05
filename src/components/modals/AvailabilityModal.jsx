import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { useData } from '@/contexts/DataContext';
import { Loader2, Plus, Trash2, Repeat, Calendar as CalendarIcon, Clock, AlertTriangle } from 'lucide-react';
import { format, parse, parseISO, setHours, setMinutes, addDays, getDay, eachDayOfInterval, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const WEEKDAYS = [
  { id: 1, label: 'Seg', name: 'monday' },
  { id: 2, label: 'Ter', name: 'tuesday' },
  { id: 3, label: 'Qua', name: 'wednesday' },
  { id: 4, label: 'Qui', name: 'thursday' },
  { id: 5, label: 'Sex', name: 'friday' },
  { id: 6, label: 'Sáb', name: 'saturday' },
  { id: 0, label: 'Dom', name: 'sunday' },
];

const AvailabilityModal = ({ isOpen, onClose, initialData }) => {
  const { user, refreshData, availabilitySlots } = useData();
  const { toast } = useToast();
  const [date, setDate] = useState(new Date());
  const [timeSlots, setTimeSlots] = useState([{ start: '09:00', end: '10:00' }]);
  const [isSaving, setIsSaving] = useState(false);
  const [repeatSettings, setRepeatSettings] = useState({
    enabled: false,
    days: [],
    until: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
  });
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isDuplicateAlertOpen, setIsDuplicateAlertOpen] = useState(false);
  const [slotsToInsert, setSlotsToInsert] = useState([]);

  const isEditing = initialData?.existingSlot;

  const resetState = useCallback(() => {
    const baseDate = initialData?.date && isValid(new Date(initialData.date)) ? new Date(initialData.date) : new Date();
    setDate(baseDate);

    if (initialData?.existingSlot) {
      const { start_time, end_time } = initialData.existingSlot;
      setTimeSlots([{ 
        start: format(parseISO(start_time), 'HH:mm'),
        end: format(parseISO(end_time), 'HH:mm'),
        id: initialData.existingSlot.id
      }]);
    } else {
       setTimeSlots([{ start: initialData?.time || '09:00', end: '10:00' }]);
    }
    
    setRepeatSettings({
      enabled: false,
      days: [],
      until: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
    });
  }, [initialData]);

  useEffect(() => {
    if (isOpen) {
      resetState();
    }
  }, [isOpen, resetState]);

  const handleTimeChange = (index, field, value) => {
    setTimeSlots(prev => {
      const newTimeSlots = [...prev];
      newTimeSlots[index][field] = value;
      return newTimeSlots;
    });
  };

  const addTimeSlot = () => setTimeSlots([...timeSlots, { start: '10:00', end: '11:00' }]);
  const removeTimeSlot = (index) => setTimeSlots(timeSlots.filter((_, i) => i !== index));

  const handleRepeatDayToggle = (dayId) => {
    setRepeatSettings(prev => ({
      ...prev,
      days: prev.days.includes(dayId)
        ? prev.days.filter(d => d !== dayId)
        : [...prev.days, dayId],
    }));
  };

  const generateSlots = () => {
    const slots = [];
    if (!repeatSettings.enabled || repeatSettings.days.length === 0) {
      timeSlots.forEach(slot => {
        const [startHour, startMinute] = slot.start.split(':').map(Number);
        const [endHour, endMinute] = slot.end.split(':').map(Number);
        const startTime = setMinutes(setHours(date, startHour), startMinute);
        const endTime = setMinutes(setHours(date, endHour), endMinute);
        slots.push({
          user_id: user.id,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
        });
      });
    } else {
      const repeatUntilDate = parse(repeatSettings.until, 'yyyy-MM-dd', new Date());
      if (!isValid(repeatUntilDate)) {
        toast({ title: "Data inválida", description: "A data final da repetição é inválida.", variant: "destructive" });
        return [];
      }
      const interval = { start: date, end: repeatUntilDate };
      const daysInInterval = eachDayOfInterval(interval);
      const targetDays = daysInInterval.filter(d => repeatSettings.days.includes(getDay(d)));

      targetDays.forEach(day => {
        timeSlots.forEach(slot => {
          const [startHour, startMinute] = slot.start.split(':').map(Number);
          const [endHour, endMinute] = slot.end.split(':').map(Number);
          const startTime = setMinutes(setHours(day, startHour), startMinute);
          const endTime = setMinutes(setHours(day, endHour), endMinute);
          slots.push({
            user_id: user.id,
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
          });
        });
      });
    }
    return slots;
  };

  const checkForDuplicates = (generatedSlots) => {
    const existingTimestamps = new Set(availabilitySlots.map(s => new Date(s.start_time).getTime()));
    return generatedSlots.some(s => existingTimestamps.has(new Date(s.start_time).getTime()));
  };

  const proceedWithSave = async (slots) => {
    setIsSaving(true);
    try {
      if (slots.length === 0) {
        toast({ title: "Nenhum horário para salvar", description: "Verifique as configurações de repetição e os horários.", variant: 'warning' });
        return;
      }
      const { error } = await supabase.from('availability_slots').insert(slots);
      if (error) throw error;

      toast({ title: 'Disponibilidade salva!', description: `${slots.length} horário(s) adicionado(s) à sua agenda.` });
      await refreshData('availability_slots');
      onClose();
    } catch (error) {
      toast({ title: 'Erro ao salvar disponibilidade', description: error.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
      setIsDuplicateAlertOpen(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    const generatedSlots = generateSlots();
    if (generatedSlots.length === 0 && (!repeatSettings.enabled || repeatSettings.days.length > 0)) {
      setIsSaving(false);
      return;
    }
    setSlotsToInsert(generatedSlots);

    if (checkForDuplicates(generatedSlots)) {
      setIsDuplicateAlertOpen(true);
    } else {
      await proceedWithSave(generatedSlots);
    }
  };

  const handleUpdate = async () => {
    if (!user || !isEditing) return;
    setIsSaving(true);
    try {
      const slotToUpdate = timeSlots[0];
      const [startHour, startMinute] = slotToUpdate.start.split(':').map(Number);
      const [endHour, endMinute] = slotToUpdate.end.split(':').map(Number);
      const startTime = setMinutes(setHours(date, startHour), startMinute);
      const endTime = setMinutes(setHours(date, endHour), endMinute);
      
      const { error } = await supabase
        .from('availability_slots')
        .update({ start_time: startTime.toISOString(), end_time: endTime.toISOString() })
        .eq('id', slotToUpdate.id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      toast({ title: 'Horário atualizado com sucesso!' });
      await refreshData('availability_slots');
      onClose();
    } catch (error) {
      toast({ title: 'Erro ao atualizar horário', description: error.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!user || !isEditing || !initialData.existingSlot) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('availability_slots')
        .delete()
        .eq('id', initialData.existingSlot.id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      toast({ title: 'Horário removido com sucesso!' });
      await refreshData('availability_slots');
      setIsDeleteAlertOpen(false);
      onClose();
    } catch (error) {
      toast({ title: 'Erro ao remover horário', description: error.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDateInputChange = (e) => {
    const dateString = e.target.value;
    const parsedDate = parse(dateString, 'yyyy-MM-dd', new Date());
    if (isValid(parsedDate)) {
      setDate(parsedDate);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Horário' : 'Adicionar Disponibilidade'}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? `Ajuste o horário de ${format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}.` 
                : 'Defina os horários em que você está disponível.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <div>
              <Label htmlFor="date" className="flex items-center gap-2 mb-2"><CalendarIcon className="w-4 h-4" /> Data</Label>
              <Input
                id="date"
                type="date"
                value={format(date, 'yyyy-MM-dd')}
                onChange={handleDateInputChange}
                disabled={isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 mb-2"><Clock className="w-4 h-4" /> Horários</Label>
              {timeSlots.map((slot, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input type="time" value={slot.start} onChange={(e) => handleTimeChange(index, 'start', e.target.value)} />
                  <span>até</span>
                  <Input type="time" value={slot.end} onChange={(e) => handleTimeChange(index, 'end', e.target.value)} />
                  {!isEditing && (
                      <Button variant="ghost" size="icon" onClick={() => removeTimeSlot(index)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                  )}
                </div>
              ))}
              {!isEditing && (
                <Button variant="outline" size="sm" onClick={addTimeSlot} className="w-full">
                  <Plus className="w-4 h-4 mr-2" /> Adicionar horário
                </Button>
              )}
            </div>

            {!isEditing && (
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <Label htmlFor="repeat" className="flex items-center gap-2">
                    <Repeat className="w-4 h-4" /> Repetir
                  </Label>
                  <input
                    type="checkbox"
                    id="repeat"
                    className="toggle-checkbox"
                    checked={repeatSettings.enabled}
                    onChange={(e) => setRepeatSettings(p => ({ ...p, enabled: e.target.checked }))}
                  />
                </div>

                {repeatSettings.enabled && (
                  <div className="space-y-4 pl-4 border-l-2">
                    <div>
                      <Label className="mb-2 block">Nos dias:</Label>
                      <div className="flex flex-wrap gap-1">
                        {WEEKDAYS.map(day => (
                          <Button
                            key={day.id}
                            variant={repeatSettings.days.includes(day.id) ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleRepeatDayToggle(day.id)}
                            className="flex-1"
                          >
                            {day.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="repeatUntil" className="mb-2 block">Até:</Label>
                      <Input
                        id="repeatUntil"
                        type="date"
                        value={repeatSettings.until}
                        onChange={(e) => setRepeatSettings(p => ({ ...p, until: e.target.value }))}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter className="flex-col sm:flex-row sm:justify-between">
            {isEditing ? (
              <Button variant="destructive" disabled={isSaving} onClick={() => setIsDeleteAlertOpen(true)}>
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </Button>
            ) : (
              <div></div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>Cancelar</Button>
              <Button onClick={isEditing ? handleUpdate : handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isEditing ? 'Salvar Alterações' : 'Salvar Disponibilidade'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso removerá permanentemente o horário disponível da sua agenda.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Continuar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isDuplicateAlertOpen} onOpenChange={setIsDuplicateAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <AlertTriangle className="h-6 w-6 text-yellow-500" />
              <AlertDialogTitle>Horário Duplicado</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              Você já possui um ou mais horários disponíveis para a mesma data e hora. Deseja criar uma vaga adicional mesmo assim?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Não, cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => proceedWithSave(slotsToInsert)}>
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sim, criar vaga adicional'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AvailabilityModal;