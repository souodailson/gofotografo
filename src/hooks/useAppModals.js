import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { useModalState } from '@/contexts/ModalStateContext';
import { useToast } from '@/components/ui/use-toast';

const TRIAL_MODAL_SHOWN_KEY = 'gofotografo_trial_modal_shown_session';
const tourSteps = [
  { 
    element: '#dashboard-stat-card-netBalance', 
    popover: { 
      title: 'Seu Saldo Geral', 
      description: 'Aqui você acompanha o valor total de todos os pagamentos que já recebeu de seus clientes.',
      side: "bottom",
      align: 'start'
    } 
  },
  { 
    element: '#dashboard-stat-card-pendingToReceive', 
    popover: { 
      title: 'Pagamentos a Receber', 
      description: 'Fique de olho nos valores que ainda entrarão no seu caixa. Essencial para seu planejamento!',
      side: "bottom",
      align: 'start'
    } 
  },
  { 
    element: '#dashboard-chart-card-revenueExpensesChart', 
    popover: { 
      title: 'Gráfico de Faturamento', 
      description: 'Acompanhe visualmente a performance do seu negócio com o gráfico de entradas e saídas.',
      side: "top",
      align: 'start'
    } 
  },
  { 
    element: '#floating-action-button', 
    popover: { 
      title: 'Menu de Navegação Rápida', 
      description: 'Clique aqui a qualquer momento para acessar as outras seções importantes, como Clientes, Trabalhos e Caixa.',
      side: "left",
      align: 'start'
    } 
  }
];

const useAppModals = (isAnyModalOpenFromParent) => {
  const { 
    user, 
    settings, 
    setSettings: saveSettingsToContext, 
    trialDaysRemaining, 
    planStatus, 
    loadingAuth,
    loading: dataLoading 
  } = useData(); 
  const { openModal, closeModal, openModals } = useModalState();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [showTrialInfoModal, setShowTrialInfoModal] = useState(false);
  const [showWelcomeTourModal, setShowWelcomeTourModal] = useState(false);

  const updateUrl = useCallback((paramsToRemove = [], paramsToAdd = {}) => {
    const searchParams = new URLSearchParams(location.search);
    paramsToRemove.forEach(param => searchParams.delete(param));
    Object.entries(paramsToAdd).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.set(key, String(value));
      } else {
        searchParams.delete(key);
      }
    });
    const newSearch = searchParams.toString();
    navigate(`${location.pathname}${newSearch ? `?${newSearch}` : ''}`, { replace: true });
  }, [location.search, location.pathname, navigate]);

  const markTourAsCompleted = useCallback(async () => {
    if (user && settings && settings.has_completed_tour === false) {
      try {
        await saveSettingsToContext({ ...settings, has_completed_tour: true });
      } catch (error) {
        toast({ title: "Erro", description: "Não foi possível salvar o status do tour.", variant: "destructive" });
      }
    }
  }, [user, settings, saveSettingsToContext, toast]);

  const startGuidedTour = useCallback(() => {
    if (typeof window.driver === 'undefined') {
      toast({ title: "Erro no Tour", description: "Não foi possível iniciar o tour guiado.", variant: "destructive" });
      markTourAsCompleted();
      return;
    }
    const driver = window.driver.js.driver;
    const driverObj = driver({
      showProgress: true, nextBtnText: 'Próximo →', prevBtnText: '← Anterior', doneBtnText: 'Finalizar',
      steps: tourSteps.map(step => ({ ...step, popover: { ...step.popover, onNextClick: () => driverObj.moveNext(), onPrevClick: () => driverObj.movePrevious(), onCloseClick: () => { driverObj.destroy(); markTourAsCompleted(); } } })),
      onDestroyStarted: () => {
        const activeIndex = driverObj.getActiveIndex ? driverObj.getActiveIndex() : -1;
        const totalSteps = tourSteps.length;
        if (activeIndex === -1 || activeIndex < totalSteps -1) {
          markTourAsCompleted(); 
        }
        driverObj.destroy(); 
      },
      onHighlighted: (element) => {
        if (element && element.node && element.node.scrollIntoView) {
          element.node.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else if (element && element.target && element.target.scrollIntoView) {
          element.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    });
    driverObj.drive();
  }, [toast, markTourAsCompleted]);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get('payment_status') === 'success') {
      updateUrl(['payment_status', 'session_id']);
      sessionStorage.removeItem(TRIAL_MODAL_SHOWN_KEY);
    }
  }, [location, updateUrl]);

  useEffect(() => {
    if (!loadingAuth && user && planStatus === 'TRIAL' && trialDaysRemaining >= 0) {
      const modalShownThisSession = sessionStorage.getItem(TRIAL_MODAL_SHOWN_KEY);
      if (!modalShownThisSession && !openModals['trialInfoModal'] && !isAnyModalOpenFromParent) {
        setShowTrialInfoModal(true);
        openModal('trialInfoModal');
        sessionStorage.setItem(TRIAL_MODAL_SHOWN_KEY, 'true');
      }
    }
  }, [loadingAuth, user, planStatus, trialDaysRemaining, openModal, openModals, isAnyModalOpenFromParent]);

  useEffect(() => {
    if (!loadingAuth && !dataLoading && user && settings && settings.has_completed_tour === false) {
      if (!openModals['trialInfoModal'] && !openModals['welcomeTourModal'] && !isAnyModalOpenFromParent) {
        setShowWelcomeTourModal(true);
        openModal('welcomeTourModal');
      }
    }
  }, [loadingAuth, dataLoading, user, settings, openModal, openModals, isAnyModalOpenFromParent]);


  const handleCloseTrialInfoModal = () => { setShowTrialInfoModal(false); closeModal('trialInfoModal'); };
  const handleStartWelcomeTour = () => { setShowWelcomeTourModal(false); closeModal('welcomeTourModal'); startGuidedTour(); };
  const handleDeclineWelcomeTour = () => { setShowWelcomeTourModal(false); closeModal('welcomeTourModal'); markTourAsCompleted(); };

  return {
    showTrialInfoModal, handleCloseTrialInfoModal,
    showWelcomeTourModal, handleStartWelcomeTour, handleDeclineWelcomeTour,
    trialDaysRemainingFromHook: trialDaysRemaining 
  };
};

export default useAppModals;