import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import Sidebar from '@/components/Sidebar';
import { useTheme } from '@/contexts/ThemeContext';
import { useData } from '@/contexts/DataContext'; 
import { useModalState } from '@/contexts/ModalStateContext';
import BottomNavBar from '@/components/BottomNavBar';
import FullScreenLoader from '@/components/FullScreenLoader';
import ReserveAllocationToast from '@/components/ReserveAllocationToast';
import usePageNavigation from '@/hooks/usePageNavigation';
import useMobileLayout from '@/hooks/useMobileLayout';
import useAppModals from '@/hooks/useAppModals';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from "@/lib/utils";
import ClientModal from '@/components/modals/ClientModal';
import SupplierModal from '@/components/modals/SupplierModal';
import FinancialModal from '@/components/modals/FinancialModal';
import FinancialWizardModal from '@/components/modals/FinancialWizardModal';
import WorkflowModal from '@/components/modals/WorkflowModal';
import ServicePackageModal from '@/components/modals/ServicePackageModal';
import ProductModal from '@/components/modals/ProductModal';
import AnnouncementPopup from '@/components/marketing/AnnouncementPopup';
import FeatureGuard from '@/components/FeatureGuard';

const Dashboard = lazy(() => import('@/components/Dashboard'));
const Clients = lazy(() => import('@/components/Clients'));
const ClientDetail = lazy(() => import('@/components/ClientDetail')); 
const Workflow = lazy(() => import('@/components/workflow/Workflow'));
const Financial = lazy(() => import('@/components/Financial'));
const CalendarComponent = lazy(() => import('@/components/Calendar'));
const Reports = lazy(() => import('@/components/Reports'));
const Settings = lazy(() => import('@/components/Settings'));
const AccountSettings = lazy(() => import('@/components/AccountSettings'));
const ServicePackages = lazy(() => import('@/components/ServicePackages'));
const MySetup = lazy(() => import('@/components/MySetup.jsx'));
const Precifique = lazy(() => import('@/components/Precifique.jsx'));
const ReservaInteligente = lazy(() => import('@/components/ReservaInteligente.jsx'));
const Boards = lazy(() => import('@/components/boards/Boards.jsx'));
const BoardDetail = lazy(() => import('@/components/boards/BoardDetail.jsx'));
const PlansPage = lazy(() => import('@/pages/PlansPage')); 
const FormsPage = lazy(() => import('@/pages/FormsPage'));
const FormEditorPage = lazy(() => import('@/pages/FormEditorPage'));
const CampaignSubmissionsPage = lazy(() => import('@/pages/CampaignSubmissionsPage'));
const StudioPage = lazy(() => import('@/pages/proposals/StudioPage'));
const ContractListPage = lazy(() => import('@/pages/contracts/ContractListPage'));
const ContractEditorPage = lazy(() => import('@/pages/contracts/ContractEditorPage'));
const ProposalEditorPage = lazy(() => import('@/pages/proposals/ProposalEditorPage'));
const BlogPage = lazy(() => import('@/pages/blog/BlogPage'));
const AvailabilityManagerPage = lazy(() => import('@/pages/AvailabilityManagerPage'));
const ReferralsPage = lazy(() => import('@/pages/ReferralsPage'));
const DataManagementPage = lazy(() => import('@/pages/admin/DataManagementPage'));
const GoMovPage = lazy(() => import('@/pages/GoMovPage'));
const InspiraPage = lazy(() => import('@/pages/InspiraPage'));
const SeasonPage = lazy(() => import('@/pages/SeasonPage'));
const RespostasRapidasPage = lazy(() => import('@/pages/RespostasRapidasPage'));
const SpotPage = lazy(() => import('@/pages/SpotPage'));
const RivalPage = lazy(() => import('@/pages/RivalPage'));
const MetasPage = lazy(() => import('@/pages/MetasPage'));
const OpportunePage = lazy(() => import('@/pages/OpportunePage'));
const FindPageSimple = lazy(() => import('@/pages/FindPageSimple'));
const FindPage = lazy(() => import('@/pages/FindPage'));

const LAST_ACTIVE_TAB_KEY = 'gofotografo_last_active_tab';
const SIDEBAR_COLLAPSED_KEY = 'gofotografo_sidebar_collapsed';

const AppContent = ({ children }) => {
  const location = useLocation();
  const { toast } = useToast();
  const { settings, loadingAuth, setSettings: saveSettingsToContext, pendingReserveAllocations, allocateToSavingGoal, dismissPendingAllocation, savingGoals, refreshData, isFeatureEnabled } = useData();
  const { theme } = useTheme();
  const { isAnyModalOpen, openModals, closeModal } = useModalState();
  const [pageStyle, setPageStyle] = useState({});
  
  const getInitialTab = () => {
    const path = location.pathname;
    if (path.startsWith('/clients/')) return 'clients';
    if (path.startsWith('/quadros')) return 'quadros';
    if (path.startsWith('/forms')) return 'clients';
    if (path.startsWith('/campaigns')) return 'clients';
    if (path.startsWith('/studio')) return 'studio';
    if (path.startsWith('/contracts')) return 'studio';
    if (path.startsWith('/blog')) return 'blog';
    if (path.startsWith('/availability-manager')) return 'calendar';
    if (path.startsWith('/referrals')) return 'referrals';
    return path.substring(1) || 'dashboard';
  };

  const { activeTab, setActiveTab, initialFinancialFilter } = usePageNavigation(
    localStorage.getItem(LAST_ACTIVE_TAB_KEY) || getInitialTab()
  );
  
  const { isMobile } = useMobileLayout();
  useAppModals(isAnyModalOpen);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const savedState = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    return savedState !== null ? JSON.parse(savedState) : true;
  });

  const [showMobileHeader, setShowMobileHeader] = useState(true);

  useEffect(() => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, JSON.stringify(sidebarCollapsed));
    window.dispatchEvent(new Event('resize'));
  }, [sidebarCollapsed]);
  
  useEffect(() => {
    const currentPath = getInitialTab();
    if (currentPath !== activeTab) {
      setActiveTab(currentPath);
    }
     if (!location.pathname.startsWith('/quadros/')) {
      setPageStyle({});
    }
  }, [location.pathname]);

  useEffect(() => {
    localStorage.setItem(LAST_ACTIVE_TAB_KEY, activeTab);
  }, [activeTab]);

  if (loadingAuth) {
    return <FullScreenLoader />;
  }
  
  const isBoardDetailPage = location.pathname.startsWith('/quadros/');
  const isBoardsPage = location.pathname === '/quadros';
  
  // Páginas com gradiente que precisam ocupar toda a tela sem padding
  const fullScreenGradientPages = ['/rival', '/metas', '/respostas', '/spot', '/gomov', '/season', '/opportune', '/inspira'];
  const isFullScreenGradientPage = fullScreenGradientPages.includes(location.pathname);

  const financialModalState = openModals['financial'];
  const financialWizardModalState = openModals['financialWizard'];
  const servicePackageModalState = openModals['servicePackage'];
  const productModalState = openModals['product'];

  const logoClaro = "https://rouvkvcngmsquebokdyg.supabase.co/storage/v1/object/public/gofiles//logotipo%20gofotografo%20claro.png";
  const logoEscuro = "https://rouvkvcngmsquebokdyg.supabase.co/storage/v1/object/public/gofiles//logotipo%20fundo%20claro%20go.fotografo%20cor%20.png";
  
  const mobileLogoUrl = theme === 'dark' ? logoClaro : logoEscuro;

  return (
    <div className={`flex flex-col bg-background text-foreground ${isMobile ? '' : 'min-h-screen'}`}>
      <AnnouncementPopup />
      {pendingReserveAllocations.map((allocation, index) => (
        <ReserveAllocationToast
          key={allocation.transactionId + index}
          allocation={allocation}
          savingGoals={savingGoals}
          onConfirm={async (goalId) => {
            try {
              await allocateToSavingGoal(goalId, allocation.reserveAmount);
              toast({ title: "Sucesso!", description: `R$ ${allocation.reserveAmount.toFixed(2)} alocados para a meta.` });
              dismissPendingAllocation(allocation.transactionId);
            } catch (error) {
              toast({ title: "Erro ao alocar", description: error.message, variant: "destructive" });
            }
          }}
          onDismiss={() => dismissPendingAllocation(allocation.transactionId)}
        />
      ))}

      <div className={`flex ${isMobile ? 'flex-col' : 'h-screen'}`}>
        {!isMobile && (
          <div className="relative">
            <Sidebar 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
              collapsed={sidebarCollapsed} 
              setCollapsed={setSidebarCollapsed}
            />
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`
                absolute top-1/2 -translate-y-1/2 
                h-12 w-6 bg-card border border-border rounded-r-lg 
                flex items-center justify-center text-muted-foreground hover:bg-accent 
                transition-all duration-300 ease-in-out z-40
                ${sidebarCollapsed ? 'left-16' : 'left-64'}
              `}
              title={sidebarCollapsed ? "Expandir menu" : "Recolher menu"}
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        )}
        
        {isMobile && (
          <AnimatePresence>
            {showMobileHeader && (
              <motion.header 
                initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -100, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 150, damping: 25 }}
                className="mobile-header fixed top-0 left-0 right-0 bg-card/60 dark:bg-card/50 backdrop-blur-xl border-b border-border z-[450] flex items-center justify-center px-4 shadow-sm"
              >
                <div className="flex-1 flex justify-center">
                  <img  alt="Logo GO.FOTÓGRAFO" className="h-10 w-auto object-contain" src={mobileLogoUrl} />
                </div>
              </motion.header>
            )}
          </AnimatePresence>
        )}

        <main 
          id="main-app-container"
          key={location.pathname}
          className={cn(`main-content-container flex-1 transition-all duration-300 ease-in-out`,
            isMobile ? `p-4 pb-24 ${showMobileHeader ? 'pt-20' : 'pt-4'}` : 
            isFullScreenGradientPage ? `${sidebarCollapsed ? 'ml-16' : 'ml-64'}` : 
            `p-6 sm:p-8 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`, 
            'overflow-y-auto',
            isBoardDetailPage && 'fundo-quadro-ativo p-0 sm:p-0',
            isBoardsPage && 'pagina-quadros'
          )}
          style={pageStyle}
        >
          <div className={cn("h-auto min-h-full", !isBoardDetailPage && !isFullScreenGradientPage && "dashboard-page-container")}> 
            <Suspense fallback={<FullScreenLoader />}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname + '-inner'} 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }} className="h-full"
                >
                  <Routes>
                      <Route path="/dashboard" element={<Dashboard setActiveTab={setActiveTab} isMobile={isMobile} />} />
                      <Route path="/clients" element={<Clients isMobile={isMobile} />} />
                      <Route path="/clients/:clientId" element={<ClientDetail isMobile={isMobile} />} />
                      <Route path="/workflow" element={<Workflow isMobile={isMobile} />} />
                      <Route path="/financial" element={<Financial isMobile={isMobile} initialFilter={initialFinancialFilter} />} />
                      
                      <Route path="/calendar" element={<FeatureGuard featureName="agenda_pro"><CalendarComponent isMobile={isMobile} setActiveTab={setActiveTab} /></FeatureGuard>} />
                      <Route path="/reports" element={<FeatureGuard featureName="relatorios"><Reports /></FeatureGuard>} />
                      <Route path="/service-packages" element={<FeatureGuard featureName="pacotes_servico"><ServicePackages isMobile={isMobile} /></FeatureGuard>} />
                      <Route path="/my-setup" element={<FeatureGuard featureName="meu_setup"><MySetup isMobile={isMobile} /></FeatureGuard>} />
                      <Route path="/precifique" element={<FeatureGuard featureName="precifique"><Precifique isMobile={isMobile} /></FeatureGuard>} />
                      <Route path="/reserva-inteligente" element={<FeatureGuard featureName="reserva_inteligente"><ReservaInteligente isMobile={isMobile} /></FeatureGuard>} />
                      <Route path="/quadros" element={<FeatureGuard featureName="quadros"><Boards setSidebarCollapsed={setSidebarCollapsed} /></FeatureGuard>} />
                      <Route path="/quadros/:boardId" element={<FeatureGuard featureName="quadros"><BoardDetail setPageStyle={setPageStyle} /></FeatureGuard>} />
                      <Route path="/forms" element={<FeatureGuard featureName="formularios_captacao"><FormsPage /></FeatureGuard>} />
                      <Route path="/forms/edit/:formId" element={<FeatureGuard featureName="formularios_captacao"><FormEditorPage /></FeatureGuard>} />
                      <Route path="/campaigns/:formId" element={<FeatureGuard featureName="formularios_captacao"><CampaignSubmissionsPage /></FeatureGuard>} />
                      
                      <Route path="/studio/*" element={<FeatureGuard featureName="propostas_avancadas"><Outlet /></FeatureGuard>}>
                        <Route index element={<StudioPage />} />
                        <Route path="proposals/new" element={<ProposalEditorPage />} />
                        <Route path="proposals/edit/:proposalId" element={<ProposalEditorPage />} />
                        <Route path="contracts/new" element={<ContractEditorPage mode="new" />} />
                        <Route path="contracts/edit/:contractId" element={<ContractEditorPage mode="edit" />} />
                      </Route>
                      
                      <Route path="/contracts" element={<FeatureGuard featureName="contratos"><ContractListPage /></FeatureGuard>} />

                      <Route path="/availability-manager" element={<FeatureGuard featureName="agenda_pro"><AvailabilityManagerPage isMobile={isMobile} /></FeatureGuard>} />
                      <Route path="/referrals" element={<ReferralsPage />} />
                      <Route path="/gomov" element={<FeatureGuard featureName="gomov"><GoMovPage /></FeatureGuard>} />
                      <Route path="/inspira" element={<FeatureGuard featureName="inspira"><InspiraPage /></FeatureGuard>} />
                      <Route path="/season" element={<FeatureGuard featureName="season"><SeasonPage /></FeatureGuard>} />
                      <Route path="/respostas-rapidas" element={<FeatureGuard featureName="respostas"><RespostasRapidasPage /></FeatureGuard>} />
                      <Route path="/spot" element={<FeatureGuard featureName="spot"><SpotPage /></FeatureGuard>} />
                      <Route path="/rival" element={<FeatureGuard featureName="rival"><RivalPage /></FeatureGuard>} />
                      <Route path="/metas" element={<FeatureGuard featureName="metas"><MetasPage /></FeatureGuard>} />
                      <Route path="/opportune" element={<FeatureGuard featureName="opportune"><OpportunePage /></FeatureGuard>} />
                      <Route path="/control-access" element={<DataManagementPage />} />
                      <Route path="/find" element={<FindPage />} />
                      
                      <Route path="/settings" element={<Settings isMobile={isMobile} />} />
                      <Route path="/account-settings" element={<AccountSettings isMobile={isMobile} />} />
                      <Route path="/plans" element={<PlansPage setActiveTab={setActiveTab} />} />
                      <Route path="/blog" element={<BlogPage />} />

                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </motion.div>
              </AnimatePresence>
            </Suspense>
          </div>
        </main>

        {isMobile && (
          <BottomNavBar activeTab={activeTab} setActiveTab={setActiveTab} />
        )} 
      </div>
      <ClientModal />
      <SupplierModal />
      <WorkflowModal />
      <AnimatePresence>
        {financialModalState?.isOpen && (
          <FinancialModal
            isOpen={financialModalState.isOpen}
            onClose={() => closeModal('financial')}
            type={financialModalState.type}
            transactionData={financialModalState.transaction}
            onSaveSuccess={async () => await refreshData()}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {financialWizardModalState?.isOpen && (
          <FinancialWizardModal
            isOpen={financialWizardModalState.isOpen}
            onClose={() => closeModal('financialWizard')}
            type={financialWizardModalState.type}
            transactionData={financialWizardModalState.transaction}
            onSaveSuccess={async () => await refreshData()}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {servicePackageModalState?.isOpen && (
          <ServicePackageModal
            isOpen={servicePackageModalState.isOpen}
            onClose={() => closeModal('servicePackage')}
            servicePackage={servicePackageModalState.servicePackage}
            onSaveSuccess={async () => await refreshData()}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {productModalState?.isOpen && (
          <ProductModal
            isOpen={productModalState.isOpen}
            onClose={() => closeModal('product')}
            product={productModalState.product}
            onSaveSuccess={async () => await refreshData()}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AppContent;