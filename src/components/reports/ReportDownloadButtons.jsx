import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Lock } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import FeatureRestrictionModal from '@/components/modals/FeatureRestrictionModal';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip.jsx";

const ReportDownloadButtons = ({ onGenerate, reportType, loading, disabled }) => {
  const { planStatus } = useData();
  const [isRestrictionModalOpen, setIsRestrictionModalOpen] = useState(false);
  const isPremium = planStatus === 'PROFISSIONAL' || planStatus === 'STUDIO_PRO';

  const buttonLabels = {
    financial_detailed: 'Gerar PDF Financeiro',
    client_performance: 'Gerar PDF de Clientes',
    project_productivity: 'Gerar PDF de Projetos',
    full_report: 'Exportar Relatório Completo',
  };

  const buttonLabel = buttonLabels[reportType] || 'Gerar PDF';

  const handleClick = () => {
    if (isPremium) {
      if(onGenerate) onGenerate();
    } else {
      setIsRestrictionModalOpen(true);
    }
  };

  if (!isPremium) {
    return (
      <>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="inline-flex w-full">
                <Button variant="outline" disabled className="w-full cursor-not-allowed" onClick={handleClick}>
                  <Lock className="w-4 h-4 mr-2" />
                  {buttonLabel}
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Funcionalidade Premium</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <FeatureRestrictionModal
          isOpen={isRestrictionModalOpen}
          onClose={() => setIsRestrictionModalOpen(false)}
          featureName="Download de Relatórios"
          requiredPlans={['PROFISSIONAL', 'STUDIO_PRO']}
          currentPlan={planStatus}
        />
      </>
    );
  }

  return (
    <Button
      onClick={handleClick}
      className="w-full btn-custom-gradient text-white shadow-lg"
      disabled={loading || disabled}
    >
      <Download className="w-4 h-4 mr-2" />
      {loading ? 'Gerando...' : buttonLabel}
    </Button>
  );
};

export default ReportDownloadButtons;