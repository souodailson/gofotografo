import React, { useState, useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { useModalState } from '@/contexts/ModalStateContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Edit, Calendar, Clock, Plus, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import FullScreenLoader from '@/components/FullScreenLoader';
import AvailabilityModal from '@/components/modals/AvailabilityModal';

const AvailabilityManagerPage = ({ isMobile }) => {
  const { availabilitySlots, loading, getClientById } = useData();
  const { openModal, closeModal, openModals } = useModalState();
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const filteredSlots = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return availabilitySlots
      .filter(slot => {
        const slotDate = parseISO(slot.start_time);
        return slotDate >= start && slotDate <= end;
      })
      .sort((a, b) => parseISO(a.start_time) - parseISO(b.start_time));
  }, [availabilitySlots, currentMonth]);

  const handleMonthChange = (e) => {
    const [year, month] = e.target.value.split('-');
    setCurrentMonth(new Date(parseInt(year), parseInt(month) - 1, 1));
  };

  const handleEditSlot = (slot) => {
    openModal('availability', { existingSlot: slot, date: parseISO(slot.start_time) });
  };

  if (loading) {
    return <FullScreenLoader />;
  }

  return (
    <>
      <AvailabilityModal
        isOpen={!!openModals.availability}
        onClose={() => closeModal('availability')}
        initialData={openModals.availability}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto p-4 sm:p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/calendar')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground titulo-gradiente">Gerenciador de Disponibilidade</h1>
              <p className="text-muted-foreground mt-1 text-sm">Visualize e gerencie todos os seus horários da Agenda PRO.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="month"
              value={format(currentMonth, 'yyyy-MM')}
              onChange={handleMonthChange}
              className="w-auto"
            />
            <Button onClick={() => openModal('availability', { date: new Date() })}>
              <Plus className="mr-2 h-4 w-4" /> Adicionar
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Horários de {format(currentMonth, 'MMMM, yyyy', { locale: ptBR })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Horário</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Agendado por</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSlots.length > 0 ? (
                    filteredSlots.map(slot => {
                      const client = slot.booked_by_client_id ? getClientById(slot.booked_by_client_id) : null;
                      return (
                        <TableRow key={slot.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>{format(parseISO(slot.start_time), 'dd/MM/yyyy, EEEE', { locale: ptBR })}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{`${format(parseISO(slot.start_time), 'HH:mm')} - ${format(parseISO(slot.end_time), 'HH:mm')}`}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={slot.is_booked ? 'destructive' : 'default'}>
                              {slot.is_booked ? 'Agendado' : 'Disponível'}
                            </Badge>
                          </TableCell>
                          <TableCell>{client ? client.name : '—'}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleEditSlot(slot)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24">
                        Nenhum horário encontrado para este mês.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
};

export default AvailabilityManagerPage;