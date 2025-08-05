import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Lock, RefreshCw, CheckCircle } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip.jsx";
import FeatureRestrictionModal from '@/components/modals/FeatureRestrictionModal';
import { useToast } from "@/components/ui/use-toast";
import { getGoogleAuthUrl, exchangeCodeForTokens } from '@/lib/googleCalendar';

const IntegrationsSettings = () => {
  const { planStatus, settings, setSettings: saveSettingsToContext } = useData();
  const [isRestrictionModalOpen, setIsRestrictionModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const isPremium = planStatus === 'PROFISSIONAL' || planStatus === 'STUDIO_PRO';
  const isGoogleAuthenticated = settings?.google_calendar_credentials?.access_token;

  const handleGoogleAuth = async () => {
    if (!isPremium) {
      setIsRestrictionModalOpen(true);
      return;
    }
    setIsLoading(true);
    try {
      const { authUrl, error } = await getGoogleAuthUrl();
      if (error) throw new Error(error);
      window.location.href = authUrl;
    } catch (error) {
      toast({
        title: "Erro ao autenticar com Google",
        description: error.message,
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleDisconnectGoogle = () => {
    const updatedSettings = { ...settings, google_calendar_credentials: null };
    saveSettingsToContext(updatedSettings);
    toast({
      title: "Google Calendar Desconectado",
      description: "A integração foi removida com sucesso.",
    });
  };

  return (
    <>
      <div>
        <h3 className="font-semibold text-lg text-foreground">Integrações</h3>
        <p className="text-sm text-muted-foreground">
          Conecte o GO.FOTÓGRAFO com outras ferramentas para automatizar seu fluxo de trabalho.
        </p>
      </div>

      <div className="border border-border rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-muted p-3 rounded-full">
            <Calendar className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Google Calendar</p>
            <p className="text-sm text-muted-foreground">Sincronize seus agendamentos automaticamente.</p>
          </div>
        </div>

        {isGoogleAuthenticated ? (
            <Button variant="outline" onClick={handleDisconnectGoogle}>
              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
              Conectado
            </Button>
        ) : (
          isPremium ? (
            <Button onClick={handleGoogleAuth} disabled={isLoading}>
              {isLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Calendar className="w-4 h-4 mr-2" />}
              {isLoading ? 'Aguardando...' : 'Autenticar com Google'}
            </Button>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="inline-block">
                    <Button onClick={() => setIsRestrictionModalOpen(true)}>
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
          )
        )}
      </div>

      <FeatureRestrictionModal
        isOpen={isRestrictionModalOpen}
        onClose={() => setIsRestrictionModalOpen(false)}
        featureName="Integração com Google Calendar"
        requiredPlans={['PROFISSIONAL', 'STUDIO_PRO']}
        currentPlan={planStatus}
      />
    </>
  );
};

export default IntegrationsSettings;