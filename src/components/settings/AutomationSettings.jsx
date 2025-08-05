import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RefreshCw, Lock } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import FeatureRestrictionModal from '@/components/modals/FeatureRestrictionModal';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const AutomationSettings = ({ formData, handleAutomationChange }) => {
  const { googleTokens, setGoogleTokens, planStatus } = useData();
  const { toast } = useToast();
  const [isGoogleAuthInProgress, setIsGoogleAuthInProgress] = useState(false);
  const [isRestrictionModalOpen, setIsRestrictionModalOpen] = useState(false);

  const isPremium = planStatus === 'PROFISSIONAL' || planStatus === 'STUDIO_PRO';

  const handleGoogleAuth = async () => {
    if (!isPremium) {
      setIsRestrictionModalOpen(true);
      return;
    }
    setIsGoogleAuthInProgress(true);
    try {
      const { data, error } = await supabase.functions.invoke('google-generate-auth-url');
      if (error) throw error;
      window.location.href = data.authUrl;
    } catch (error) {
      toast({
        title: "Erro de Autenticação",
        description: `Não foi possível iniciar a autenticação com o Google: ${error.message}`,
        variant: "destructive",
      });
      setIsGoogleAuthInProgress(false);
    }
  };

  const handleGoogleLogout = async () => {
    // This would ideally also revoke the token on Google's side
    setGoogleTokens(null);
    // Also clear from DB if stored there
    toast({
      title: "Desconectado",
      description: "Sua conta Google foi desconectada.",
    });
  };

  const renderGoogleAuthButton = () => {
    if (googleTokens) {
      return (
        <div className="flex items-center gap-4">
          <p className="text-sm text-green-600 dark:text-green-400">Conectado ao Google Calendar.</p>
          <Button onClick={handleGoogleLogout} variant="destructive_outline" size="sm">
            Desconectar
          </Button>
        </div>
      );
    }

    if (!isPremium) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="inline-flex items-center">
                <Button disabled className="bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed">
                  <Lock className="w-4 h-4 mr-2" />
                  Autenticar com Google
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Funcionalidade Premium</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <Button onClick={handleGoogleAuth} disabled={isGoogleAuthInProgress} className="bg-gradient-to-r from-blue-500 to-sky-600 hover:from-blue-600 hover:to-sky-700 text-white">
        <RefreshCw className={`w-4 h-4 mr-2 ${isGoogleAuthInProgress ? 'animate-spin' : ''}`} />
        Autenticar com Google
      </Button>
    );
  };

  return (
    <div className="space-y-6">
      <FeatureRestrictionModal
        isOpen={isRestrictionModalOpen}
        onClose={() => setIsRestrictionModalOpen(false)}
        featureName="Integração com Google Calendar"
        requiredPlans={['PROFISSIONAL', 'STUDIO_PRO']}
        currentPlan={planStatus}
      />
      <div>
        <h3 className="text-lg font-medium text-foreground mb-2">Integração com Google Calendar</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Sincronize seus agendamentos e eventos diretamente com sua agenda do Google para nunca perder um compromisso.
        </p>
        {renderGoogleAuthButton()}
      </div>

      <div className="border-t border-border pt-6">
        <h3 className="text-lg font-medium text-foreground mb-2">Automações de Comunicação</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Ative lembretes automáticos para economizar tempo e manter seus clientes informados. (Funcionalidade em desenvolvimento)
        </p>
        <div className="space-y-4">
          {[
            { id: 'session_reminder', label: 'Lembrete de Sessão/Evento' },
            { id: 'payment_reminder', label: 'Lembrete de Pagamento Pendente' },
            { id: 'meeting_reminder', label: 'Lembrete de Reunião Agendada' },
            { id: 'pre_event_sequence', label: 'Sequência de E-mails Pré-Evento' },
            { id: 'post_event_sequence', label: 'Sequência de E-mails Pós-Evento (Feedback/Upsell)' },
          ].map(item => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
              <Label htmlFor={item.id} className="text-sm text-foreground">{item.label}</Label>
              <Switch
                id={item.id}
                checked={formData.automation?.[item.id] || false}
                onCheckedChange={(value) => handleAutomationChange(item.id, value)}
                disabled // Feature em desenvolvimento
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AutomationSettings;