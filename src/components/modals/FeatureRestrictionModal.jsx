import React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, X, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';

const FeatureRestrictionModal = ({ isOpen, onClose, featureName, requiredPlans, currentPlan }) => {
  const navigate = useNavigate();
  const { setActiveTab } = useData();

  const handleUpgrade = () => {
    if (setActiveTab) setActiveTab('plans');
    navigate('/plans');
    onClose();
  };

  const planNames = {
    PROFISSIONAL: 'Profissional',
    STUDIO_PRO: 'STUDIO PRO',
    STARTER: 'Starter',
    TRIAL: 'Trial',
    FREE: 'Gratuito',
  };

  const formattedRequiredPlans = requiredPlans.map(plan => planNames[plan] || plan).join(' ou ');
  const currentPlanName = planNames[currentPlan] || 'desconhecido';

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-lg w-[90vw] sm:w-full bg-card border-border shadow-2xl rounded-xl">
        <AlertDialogHeader className="text-center items-center">
          <div className="p-3 bg-gradient-to-br from-customPurple to-customGreen rounded-full inline-block mb-3">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <AlertDialogTitle className="text-2xl font-bold text-foreground">
            Funcionalidade Exclusiva!
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base text-muted-foreground px-4">
            A funcionalidade "{featureName}" está disponível apenas para assinantes dos planos{' '}
            <strong className="text-foreground">{formattedRequiredPlans}</strong>.
          </AlertDialogDescription>
          <p className="text-sm text-muted-foreground mt-2">
            Seu plano atual é: <span className="font-semibold text-foreground">{currentPlanName}</span>.
          </p>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2 mt-4">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            <X className="w-4 h-4 mr-2" />
            Entendi
          </Button>
          <Button onClick={handleUpgrade} className="w-full sm:w-auto btn-custom-gradient text-white">
            <ShieldAlert className="w-4 h-4 mr-2" />
            Fazer Upgrade
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default FeatureRestrictionModal;