import React, { useState } from 'react';
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
import { useToast } from '@/components/ui/use-toast';
import { useData } from '@/contexts/DataContext';
import { Check, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const GoogleIntegrationSupportModal = ({ isOpen, onClose }) => {
  const { user, settings } = useData();
  const { toast } = useToast();
  const [email, setEmail] = useState(user?.email || settings?.contact_email || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.functions.invoke('send-feedback-email', {
        body: {
          type: 'support',
          name: settings?.user_name || 'Usuário',
          email: email,
          message: `O usuário com email ${email} solicitou a liberação da integração com o Google Agenda.`,
        },
      });

      if (error) throw error;
      
      toast({
        title: 'Solicitação Enviada!',
        description: 'Recebemos seu pedido. Nossa equipe entrará em contato em breve para finalizar a liberação.',
        variant: 'success',
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Erro ao Enviar Solicitação',
        description: 'Houve um problema ao enviar sua solicitação. Por favor, tente novamente ou contate o suporte diretamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-400 to-sky-500 rounded-full inline-block">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Google_Calendar_icon_%282020%29.svg/2048px-Google_Calendar_icon_%282020%29.svg.png" alt="Google Calendar Icon" className="w-8 h-8" />
              </div>
          </div>
          <DialogTitle className="text-center text-2xl font-bold">Ativar Integração com Google Agenda</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Agradecemos seu interesse! Para garantir a melhor experiência, nossa equipe fará a liberação final da sua integração.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <Label htmlFor="email" className="text-left">
              Confirme seu melhor e-mail para contato:
            </Label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              className="w-full btn-custom-gradient text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Enviando...' : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Solicitar Liberação
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
         <p className="text-xs text-center text-muted-foreground mt-2">
            Entraremos em contato em até 24 horas úteis.
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default GoogleIntegrationSupportModal;