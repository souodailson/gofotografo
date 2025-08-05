import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Shield, Lock } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import EnableMFAModal from '@/components/settings/EnableMFAModal';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip.jsx"; 
import FeatureRestrictionModal from '@/components/modals/FeatureRestrictionModal';

const SecuritySettings = () => {
  const { planStatus } = useData();
  const [isMfaModalOpen, setIsMfaModalOpen] = useState(false);
  const [isRestrictionModalOpen, setIsRestrictionModalOpen] = useState(false);
  
  const isPremium = planStatus === 'PROFISSIONAL' || planStatus === 'STUDIO_PRO';

  const handleMfaClick = () => {
    if (isPremium) {
      setIsMfaModalOpen(true);
    } else {
      setIsRestrictionModalOpen(true);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg text-foreground">Autenticação de Dois Fatores (MFA)</h3>
          <p className="text-sm text-muted-foreground">
            Adicione uma camada extra de segurança à sua conta. A autenticação de dois fatores é uma funcionalidade premium.
          </p>
        </div>
        
        {isPremium ? (
          <Button onClick={handleMfaClick}>
            <Shield className="w-4 h-4 mr-2" />
            Ativar Autenticação de Dois Fatores
          </Button>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="inline-block">
                  <Button onClick={handleMfaClick} disabled className="cursor-not-allowed">
                    <Lock className="w-4 h-4 mr-2" />
                    Ativar Autenticação de Dois Fatores
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Funcionalidade Premium</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      <EnableMFAModal isOpen={isMfaModalOpen} onClose={() => setIsMfaModalOpen(false)} />
      <FeatureRestrictionModal
        isOpen={isRestrictionModalOpen}
        onClose={() => setIsRestrictionModalOpen(false)}
        featureName="Autenticação de Dois Fatores"
        requiredPlans={['PROFISSIONAL', 'STUDIO_PRO']}
        currentPlan={planStatus}
      />
    </>
  );
};

export default SecuritySettings;