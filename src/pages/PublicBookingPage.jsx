import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, User, Mail, Phone, ArrowRight, Loader2, UploadCloud, Copy, CheckCircle, AlertTriangle, Instagram, Globe, Building, FileText } from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isBefore, startOfToday, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '@/lib/utils';

const FormField = ({ icon: Icon, label, ...props }) => (
  <div className="relative">
    <Label className="block text-sm font-medium text-muted-foreground mb-1">{label}</Label>
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input className="pl-10" {...props} />
    </div>
  </div>
);

const CalendarView = ({ currentMonth, onMonthChange, onDateSelect, availability, selectedDate }) => {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startingDay = getDay(monthStart);
  const today = startOfToday();

  const availableDates = new Set(availability.map(slot => format(parseISO(slot.start_time), 'yyyy-MM-dd')));

  return (
    <div className="bg-card p-4 rounded-lg shadow-inner">
      <div className="flex justify-between items-center mb-4">
        <Button onClick={() => onMonthChange('prev')}>Anterior</Button>
        <h3 className="font-semibold text-lg capitalize">{format(currentMonth, 'MMMM yyyy', { locale: ptBR })}</h3>
        <Button onClick={() => onMonthChange('next')}>Próximo</Button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => <div key={day}>{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1 mt-2">
        {Array.from({ length: startingDay }).map((_, i) => <div key={`empty-${i}`} />)}
        {daysInMonth.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const isAvailable = availableDates.has(dateStr);
          const isPast = isBefore(day, today);
          const isSelected = selectedDate && format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');

          return (
            <button
              key={dateStr}
              disabled={!isAvailable || isPast}
              onClick={() => onDateSelect(day)}
              className={cn(
                "p-2 rounded-full text-sm transition-colors relative",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                isSelected && "bg-primary text-primary-foreground",
                isAvailable && !isSelected && "hover:bg-accent"
              )}
            >
              {format(day, 'd')}
              {isAvailable && !isPast && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-green-500 rounded-full"></span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const TimeSlotsView = ({ selectedDate, availability, onSlotSelect }) => {
  if (!selectedDate) return <p className="text-center text-muted-foreground mt-4">Selecione uma data para ver os horários.</p>;
  
  const slotsForDate = availability
    .filter(slot => format(parseISO(slot.start_time), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd'))
    .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

  if (slotsForDate.length === 0) return <p className="text-center text-muted-foreground mt-4">Nenhum horário disponível para esta data.</p>;

  return (
    <div className="mt-4">
      <h3 className="font-semibold mb-2">Horários para {format(selectedDate, 'dd/MM/yyyy')}:</h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {slotsForDate.map(slot => (
          <Button key={slot.id} variant="outline" onClick={() => onSlotSelect(slot)}>
            {format(parseISO(slot.start_time), 'HH:mm')}
          </Button>
        ))}
      </div>
    </div>
  );
};

const PublicBookingPage = () => {
  const { bookingLinkId } = useParams();
  const { toast } = useToast();
  const [photographer, setPhotographer] = useState(null);
  const [bookingSettings, setBookingSettings] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [step, setStep] = useState(1);
  const [clientInfo, setClientInfo] = useState({ name: '', email: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentProofFile, setPaymentProofFile] = useState(null);

  const fetchBookingData = useCallback(async (month, year) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: functionError } = await supabase.functions.invoke('get-public-booking-data', {
        body: JSON.stringify({ bookingLinkId, month: month + 1, year: year })
      });

      if (functionError) throw new Error(`Erro ao buscar dados: ${functionError.message}`);
      if (data.error) throw new Error(data.error);
      
      setPhotographer(data.photographer);
      setBookingSettings(data.bookingSettings);
      setAvailability(data.availability || []);

    } catch (err) {
      console.error(err);
      setError(err.message);
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [bookingLinkId, toast]);

  useEffect(() => {
    fetchBookingData(currentMonth.getMonth(), currentMonth.getFullYear());
  }, [fetchBookingData, currentMonth]);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setStep(2);
  };

  const handleClientInfoSubmit = (e) => {
    e.preventDefault();
    if (!clientInfo.name || !clientInfo.email || !clientInfo.phone) {
      toast({ title: "Campos obrigatórios", description: "Por favor, preencha todos os seus dados.", variant: "destructive" });
      return;
    }
    if (bookingSettings.require_payment) {
      setStep(3);
    } else {
      handleFinalizeBooking();
    }
  };

  const handleFinalizeBooking = async () => {
    if (!selectedSlot || !clientInfo.name) {
      toast({ title: "Erro", description: "Dados do agendamento ou cliente incompletos.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      let paymentProofUrl = null;
      if (paymentProofFile) {
        const fileExt = paymentProofFile.name.split('.').pop();
        const fileName = `booking-proof-${uuidv4()}.${fileExt}`;
        const filePath = `public/${bookingSettings.user_id}/booking_proofs/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('user_assets')
          .upload(filePath, paymentProofFile);

        if (uploadError) throw uploadError;
        const { data: publicUrlData } = supabase.storage.from('user_assets').getPublicUrl(filePath);
        paymentProofUrl = publicUrlData.publicUrl;
      }

      const { data, error: functionError } = await supabase.functions.invoke('finalize-booking', {
        body: JSON.stringify({
          photographerUserId: bookingSettings.user_id,
          slotId: selectedSlot.id,
          clientInfo,
          paymentProofUrl,
        })
      });

      if (functionError) throw functionError;
      if (data.error) throw new Error(data.error);

      toast({ title: "Agendamento realizado!", description: "Você receberá uma confirmação em breve." });
      setStep(4);
      setAvailability(prev => prev.filter(slot => slot.id !== selectedSlot.id));


    } catch (err) {
      toast({ title: "Erro ao agendar", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
     try {
      const { data, error } = await supabase.functions.invoke('submit-client-form', {
        body: JSON.stringify({ 
          formId: null,
          answers: clientInfo, 
          userId: photographer?.user_id,
          source: 'PublicBookingPageLead'
        }),
      });
      if (error) throw error;
       toast({ title: "Obrigado!", description: "Seus dados foram enviados. Entraremos em contato em breve!" });
       setStep(4);
    } catch (error) {
      toast({ title: "Erro ao enviar", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copiado!", description: "Chave PIX copiada para a área de transferência." });
  };

  if (loading && !photographer) {
    return <div className="flex items-center justify-center min-h-screen bg-background"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  if (error) {
    return (
       <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center">
        <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Ops! Algo deu errado.</h1>
        <p className="text-muted-foreground max-w-md">{error}</p>
      </div>
    );
  }
  
  const hasAvailability = availability.length > 0;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center p-4 sm:p-8">
      <main className="w-full flex-grow">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          {photographer?.logo && <img src={photographer.logo} alt={photographer.business_name} className="h-16 w-auto mx-auto mb-4 object-contain" />}
          <h1 className="text-3xl font-bold">{photographer?.business_name || photographer?.user_name}</h1>
          <p className="text-muted-foreground">Agende seu horário</p>
        </motion.div>

        <div className="w-full max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
            {!hasAvailability && step !== 4 ? (
                <div className="max-w-md mx-auto text-center">
                  <h2 className="text-xl font-semibold mb-4">Nenhuma vaga no momento</h2>
                  <p className="text-muted-foreground mb-6">Agradecemos seu interesse! No momento, não há vagas abertas. Deixe seus dados abaixo para entrar em nossa lista de espera.</p>
                  <form onSubmit={handleLeadSubmit} className="space-y-4">
                      <FormField icon={User} label="Nome Completo" value={clientInfo.name} onChange={(e) => setClientInfo({...clientInfo, name: e.target.value})} required />
                      <FormField icon={Mail} label="E-mail" type="email" value={clientInfo.email} onChange={(e) => setClientInfo({...clientInfo, email: e.target.value})} required />
                      <FormField icon={Phone} label="Telefone (WhatsApp)" value={clientInfo.phone} onChange={(e) => setClientInfo({...clientInfo, phone: e.target.value})} required />
                      <Button type="submit" disabled={isSubmitting} className="w-full mt-4">
                        {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Entrar na Lista de Espera
                      </Button>
                  </form>
                </div>
              ) : step === 1 ? (
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-center">1. Escolha a data e horário</h2>
                  <div className="grid md:grid-cols-2 gap-8">
                    <CalendarView 
                      currentMonth={currentMonth}
                      onMonthChange={(dir) => setCurrentMonth(dir === 'prev' ? subMonths(currentMonth, 1) : addMonths(currentMonth, 1))}
                      onDateSelect={handleDateSelect}
                      availability={availability}
                      selectedDate={selectedDate}
                    />
                    <TimeSlotsView 
                      selectedDate={selectedDate}
                      availability={availability}
                      onSlotSelect={handleSlotSelect}
                    />
                  </div>
                </div>
              ) : step === 2 ? (
                <div className="max-w-md mx-auto">
                  <h2 className="text-xl font-semibold mb-4 text-center">2. Seus Dados</h2>
                  <div className="bg-card p-4 rounded-lg mb-4 text-center">
                    <p>Você selecionou:</p>
                    <p className="font-bold text-lg text-primary">{format(parseISO(selectedSlot.start_time), "EEEE, dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}</p>
                  </div>
                  <form onSubmit={handleClientInfoSubmit} className="space-y-4">
                    <FormField icon={User} label="Nome Completo" value={clientInfo.name} onChange={(e) => setClientInfo({...clientInfo, name: e.target.value})} required />
                    <FormField icon={Mail} label="E-mail" type="email" value={clientInfo.email} onChange={(e) => setClientInfo({...clientInfo, email: e.target.value})} required />
                    <FormField icon={Phone} label="Telefone (WhatsApp)" value={clientInfo.phone} onChange={(e) => setClientInfo({...clientInfo, phone: e.target.value})} required />
                    <div className="flex justify-between items-center pt-4">
                      <Button type="button" variant="ghost" onClick={() => setStep(1)}>Voltar</Button>
                      <Button type="submit">
                        Continuar <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </form>
                </div>
              ) : step === 3 ? (
                <div className="max-w-md mx-auto text-center">
                  <h2 className="text-xl font-semibold mb-4">3. Pagamento da Reserva</h2>
                  <p className="text-muted-foreground mb-6">Para confirmar seu horário, é necessário um pagamento de reserva. Após pagar, anexe o comprovante.</p>
                  
                  <div className="space-y-6 bg-card p-6 rounded-lg">
                      {bookingSettings.pix_qr_code_url && (
                        <div className="flex flex-col items-center">
                          <p className="font-semibold mb-2">Pagar com PIX</p>
                          <img src={bookingSettings.pix_qr_code_url} alt="QR Code PIX" className="w-48 h-48 rounded-lg border p-1" />
                        </div>
                      )}
                      {bookingSettings.pix_key && (
                        <div className="flex items-center gap-2">
                          <Input value={bookingSettings.pix_key} readOnly />
                          <Button variant="outline" size="icon" onClick={() => copyToClipboard(bookingSettings.pix_key)}><Copy className="w-4 h-4" /></Button>
                        </div>
                      )}
                      {bookingSettings.credit_card_link && (
                        <Button asChild className="w-full">
                          <a href={bookingSettings.credit_card_link} target="_blank" rel="noopener noreferrer">Pagar com Cartão de Crédito</a>
                        </Button>
                      )}

                      <div className="mt-6">
                        <Label htmlFor="payment-proof" className="font-semibold">Anexar Comprovante</Label>
                        <Input id="payment-proof" type="file" onChange={(e) => setPaymentProofFile(e.target.files[0])} accept="image/png, image/jpeg, image/jpg, application/pdf" className="mt-2" />
                        {paymentProofFile && <p className="text-xs text-muted-foreground mt-1">Arquivo selecionado: {paymentProofFile.name}</p>}
                      </div>
                  </div>

                  <div className="flex justify-between items-center pt-6">
                      <Button type="button" variant="ghost" onClick={() => setStep(2)}>Voltar</Button>
                      <Button onClick={handleFinalizeBooking} disabled={isSubmitting || !paymentProofFile}>
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                        Finalizar Agendamento
                      </Button>
                    </div>
                </div>
              ) : step === 4 ? (
                <div className="max-w-md mx-auto text-center">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-green-500 mb-4">{selectedSlot ? 'Agendamento Confirmado!' : 'Obrigado pelo Interesse!'}</h2>
                  <p>Obrigado, {clientInfo.name}!</p>
                  {selectedSlot ? (
                      <>
                          <p>Seu horário para</p>
                          <p className="font-bold text-lg text-primary mb-4">{format(parseISO(selectedSlot.start_time), "EEEE, dd 'de' MMMM 'às' HH:mm", { locale: ptBR })} está confirmado.</p>
                          <p>Você receberá um e-mail com os detalhes em breve.</p>
                      </>
                  ) : (
                      <p>Seus dados foram recebidos e você está na nossa lista de espera. Entraremos em contato assim que novas vagas estiverem disponíveis!</p>
                  )}
                  <Button onClick={() => window.location.reload()} className="mt-6">Voltar ao Início</Button>
                </div>
              ) : null }

            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      {bookingSettings?.show_footer_info && (
        <footer className="w-full max-w-4xl mx-auto mt-12 pt-8 border-t border-border text-center text-muted-foreground text-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center md:items-start">
              {photographer.logo && <img src={photographer.logo} alt={photographer.business_name} className="h-12 w-auto mb-2 object-contain"/>}
              <p className="font-semibold">{photographer.business_name}</p>
              {photographer.cnpj && <p className="flex items-center gap-2"><FileText size={14}/> {photographer.cnpj}</p>}
            </div>
            <div className="flex flex-col items-center">
              <p className="font-semibold mb-2">Contato</p>
              {photographer.address && <p className="flex items-center gap-2"><Building size={14}/> {photographer.address}</p>}
              {photographer.phones?.[0]?.number && <p className="flex items-center gap-2"><Phone size={14}/> {photographer.phones[0].number}</p>}
            </div>
            <div className="flex flex-col items-center md:items-end">
              <p className="font-semibold mb-2">Redes Sociais</p>
              <div className="flex gap-4">
                {photographer.website_social?.find(s => s.type === 'instagram')?.url && (
                  <a href={photographer.website_social.find(s => s.type === 'instagram').url} target="_blank" rel="noopener noreferrer" className="hover:text-primary"><Instagram size={20}/></a>
                )}
                {photographer.website_social?.find(s => s.type === 'website')?.url && (
                  <a href={photographer.website_social.find(s => s.type === 'website').url} target="_blank" rel="noopener noreferrer" className="hover:text-primary"><Globe size={20}/></a>
                )}
              </div>
            </div>
          </div>
          <p className="mt-8 text-xs">&copy; {new Date().getFullYear()} {photographer.business_name}. Todos os direitos reservados.</p>
        </footer>
      )}
    </div>
  );
};

export default PublicBookingPage;