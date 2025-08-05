import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Lock, Users } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip.jsx";
import FeatureRestrictionModal from '@/components/modals/FeatureRestrictionModal';

const TeamSettings = () => {
  const { planStatus } = useData();
  const [isRestrictionModalOpen, setIsRestrictionModalOpen] = useState(false);
  const isPremium = planStatus === 'STUDIO_PRO';

  const handleAddTeamMember = () => {
    if (!isPremium) {
      setIsRestrictionModalOpen(true);
    } else {
      // Lógica para adicionar membro da equipe (não implementado)
    }
  };

  return (
    <>
      <div>
        <h3 className="font-semibold text-lg text-foreground">Equipe</h3>
        <p className="text-sm text-muted-foreground">
          Convide membros para sua equipe e gerencie permissões. Disponível no plano STUDIO PRO.
        </p>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex -space-x-2 overflow-hidden">
          {/* Mock avatars */}
          <img className="inline-block h-8 w-8 rounded-full ring-2 ring-background" src="https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt=""/>
          <img className="inline-block h-8 w-8 rounded-full ring-2 ring-background" src="https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt=""/>
        </div>
        <span className="text-sm text-muted-foreground">Você e mais 1 membro.</span>
      </div>

      {isPremium ? (
        <Button onClick={handleAddTeamMember}>
          <PlusCircle className="w-4 h-4 mr-2" />
          Convidar Membro
        </Button>
      ) : (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="inline-block">
                <Button disabled className="cursor-not-allowed" onClick={handleAddTeamMember}>
                  <Lock className="w-4 h-4 mr-2" />
                  Convidar Membro
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Disponível no plano STUDIO PRO</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      <FeatureRestrictionModal
        isOpen={isRestrictionModalOpen}
        onClose={() => setIsRestrictionModalOpen(false)}
        featureName="Gestão de Equipe"
        requiredPlans={['STUDIO_PRO']}
        currentPlan={planStatus}
      />
    </>
  );
};

export default TeamSettings;