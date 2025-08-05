import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { useData } from '@/contexts/DataContext';
import { Loader2, Copy, Link, Save, Info } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const BookingSettingsModal = ({ isOpen, onClose }) => {
  const { user, refreshData } = useData();
  const { toast } = useToast();
  const [settings, setSettings] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('booking_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data) {
        setSettings(data);
      } else {
        const newSettings = {
          user_id: user.id,
          booking_enabled: false,
          booking_link_id: uuidv4(),
          require_payment: false,
          payment_percentage: 10,
          pix_key: '',
          pix_qr_code_url: '',
          credit_card_link: '',
          show_footer_info: true,
        };
        const { data: createdSettings, error: createError } = await supabase
          .from('booking_settings')
          .insert(newSettings)
          .select()
          .single();
        if (createError) throw createError;
        setSettings(createdSettings);
      }
    } catch (error) {
      toast({ title: 'Erro ao carregar configurações', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (isOpen) {
      fetchSettings();
    }
  }, [isOpen, fetchSettings]);

  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('booking_settings')
        .update(settings)
        .eq('id', settings.id)
        .select()
        .single();

      if (error) throw error;
      setSettings(data);
      toast({ title: 'Configurações salvas!', description: 'Suas configurações da Agenda PRO foram atualizadas.' });
      await refreshData();
      onClose();
    } catch (error) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const copyLink = () => {
    const link = `${window.location.origin}/agendar/${settings.booking_link_id}`;
    navigator.clipboard.writeText(link);
    toast({ title: 'Link copiado!', description: 'O link de agendamento foi copiado para sua área de transferência.' });
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <div className="flex justify-center items-center p-8">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configurações da Agenda PRO</DialogTitle>
          <DialogDescription>
            Ative e personalize sua página pública de agendamentos.
          </DialogDescription>
        </DialogHeader>
        {settings && (
          <div className="space-y-6 py-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <Label htmlFor="booking-enabled" className="font-semibold">Ativar página de agendamento</Label>
              <Switch
                id="booking-enabled"
                checked={settings.booking_enabled}
                onCheckedChange={(checked) => handleChange('booking_enabled', checked)}
              />
            </div>

            {settings.booking_enabled && (
              <div className="space-y-2">
                <Label>Link Público de Agendamento</Label>
                <div className="flex items-center gap-2">
                  <Input value={`${window.location.origin}/agendar/${settings.booking_link_id}`} readOnly />
                  <Button variant="outline" size="icon" onClick={copyLink}><Copy className="w-4 h-4" /></Button>
                </div>
              </div>
            )}

            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold">Pagamento de Reserva</h3>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <Label htmlFor="require-payment">Exigir pagamento para reservar</Label>
                <Switch
                  id="require-payment"
                  checked={settings.require_payment}
                  onCheckedChange={(checked) => handleChange('require_payment', checked)}
                />
              </div>
              {settings.require_payment && (
                <div className="space-y-4 pl-4 border-l-2 ml-2">
                  <div>
                    <Label htmlFor="payment-percentage">Porcentagem de entrada (%)</Label>
                    <Input
                      id="payment-percentage"
                      type="number"
                      value={settings.payment_percentage}
                      onChange={(e) => handleChange('payment_percentage', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="pix-key">Chave PIX</Label>
                    <Input
                      id="pix-key"
                      value={settings.pix_key}
                      onChange={(e) => handleChange('pix_key', e.target.value)}
                      placeholder="CPF, CNPJ, e-mail, telefone ou chave aleatória"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pix-qr-code">URL do QR Code PIX</Label>
                    <Input
                      id="pix-qr-code"
                      value={settings.pix_qr_code_url}
                      onChange={(e) => handleChange('pix_qr_code_url', e.target.value)}
                      placeholder="https://link-para-seu-qr-code.com/imagem.png"
                    />
                  </div>
                  <div>
                    <Label htmlFor="credit-card-link">Link para Cartão de Crédito</Label>
                    <Input
                      id="credit-card-link"
                      value={settings.credit_card_link}
                      onChange={(e) => handleChange('credit_card_link', e.target.value)}
                      placeholder="https://link-de-pagamento.com"
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold">Rodapé da Página</h3>
               <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="show-footer" className="font-semibold">Exibir informações no rodapé</Label>
                  <p className="text-xs text-muted-foreground">Mostra logo, endereço, telefone e redes sociais.</p>
                </div>
                <Switch
                  id="show-footer"
                  checked={settings.show_footer_info}
                  onCheckedChange={(checked) => handleChange('show_footer_info', checked)}
                />
              </div>
              <div className="flex items-start gap-2 bg-accent/50 p-3 rounded-lg text-accent-foreground">
                <Info size={16} className="mt-1 shrink-0"/>
                <p className="text-xs">As informações exibidas são baseadas nos dados preenchidos na aba "Minha Conta" em Configurações.</p>
              </div>
            </div>

          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BookingSettingsModal;