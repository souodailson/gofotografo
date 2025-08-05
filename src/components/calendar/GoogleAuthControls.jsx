import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import FeatureRestrictionModal from '@/components/modals/FeatureRestrictionModal';
import { useData } from '@/contexts/DataContext';
import { useModalState } from '@/contexts/ModalStateContext';

const GoogleAuthControls = () => {
  const [isRestrictionModalOpen, setIsRestrictionModalOpen] = useState(false);
  const { planStatus } = useData();
  const { openModal } = useModalState();

  const handleAuthClick = () => {
    if (planStatus === 'PROFISSIONAL' || planStatus === 'STUDIO_PRO') {
      openModal('googleSupport');
    } else {
      setIsRestrictionModalOpen(true);
    }
  };

  return (
    <>
      <Button 
          onClick={handleAuthClick} 
          variant="outline"
          className="hidden md:inline-flex items-center"
          title="Vincular com Google Agenda"
      >
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Google_Calendar_icon_%282020%29.svg/2048px-Google_Calendar_icon_%282020%29.svg.png" alt="Google Calendar Icon" className="w-4 h-4 mr-2" />
          Vincular com Google Agenda
      </Button>

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

export default GoogleAuthControls;