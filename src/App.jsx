import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/authContext.jsx';
import { DataProvider } from '@/contexts/DataContext';
import { ModalStateProvider } from '@/contexts/ModalStateContext';
import { ErrorLoggingProvider } from '@/contexts/ErrorLoggingContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppContent from '@/components/AppContent';
import AdminProtectedRoute from '@/pages/admin/AdminProtectedRoute';
import PWAInstaller from '@/components/PWAInstaller';
import FullScreenLoader from '@/components/FullScreenLoader';
import KeepAlive from '@/components/KeepAlive';
import ErrorBoundary from '@/components/ErrorBoundary';
import GlobalNotifications from '@/components/GlobalNotifications';


const LandingPage = lazy(() => import('@/pages/LandingPage'));
const PrivacyPolicyPage = lazy(() => import('@/pages/PrivacyPolicyPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const SignupPage = lazy(() => import('@/pages/SignupPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'));
const UpdatePasswordPage = lazy(() => import('@/pages/UpdatePasswordPage'));
const AdminLoginPage = lazy(() => import('@/pages/admin/AdminLoginPage'));
const AdminLayout = lazy(() => import('@/pages/admin/AdminLayout'));
const PublicFormPage = lazy(() => import('@/pages/PublicFormPage'));
const PublicBookingPage = lazy(() => import('@/pages/PublicBookingPage'));
const AssinafyWebhookPage = lazy(() => import('@/pages/contracts/AssinafyWebhookPage'));
const MaintenancePage = lazy(() => import('@/pages/MaintenancePage'));
const BlogPage = lazy(() => import('@/pages/blog/BlogPage'));
const BlogPostPage = lazy(() => import('@/pages/blog/BlogPostPage'));
const ProposalEditorPage = lazy(() => import('@/pages/proposals/editor/ProposalEditorPage'));
const CustomPageViewer = lazy(() => import('@/pages/site/CustomPageViewer'));
const TutorialsPage = lazy(() => import('@/pages/site/TutorialsPage'));
const ProposalPublicView = lazy(() => import('@/pages/proposals/ProposalPublicView'));
const StudioPage = lazy(() => import('@/pages/proposals/StudioPage'));
const ContractEditorPage = lazy(() => import('@/pages/contracts/ContractEditorPage'));

const EditorLayout = ({ children }) => {
  return <>{children}</>;
};

const MainLayout = () => {
  const location = useLocation();
  const isEditorRoute = location.pathname.startsWith('/studio/proposals/edit/') || location.pathname === '/studio/proposals/new';
  
  return (
    <ProtectedRoute>
      <AppContent hideSidebar={isEditorRoute}>
        <Outlet />
      </AppContent>
    </ProtectedRoute>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/lp" element={<Suspense fallback={<FullScreenLoader />}><LandingPage /></Suspense>} />
      <Route path="/politica-de-privacidade-e-dados" element={<Suspense fallback={<FullScreenLoader />}><PrivacyPolicyPage /></Suspense>} />
      <Route path="/login" element={<Suspense fallback={<FullScreenLoader />}><LoginPage /></Suspense>} />
      <Route path="/signup" element={<Suspense fallback={<FullScreenLoader />}><SignupPage /></Suspense>} />
      <Route path="/forgot-password" element={<Suspense fallback={<FullScreenLoader />}><ForgotPasswordPage /></Suspense>} />
      <Route path="/update-password" element={<Suspense fallback={<FullScreenLoader />}><UpdatePasswordPage /></Suspense>} />
      <Route path="/f/:formId" element={<Suspense fallback={<FullScreenLoader />}><PublicFormPage /></Suspense>} />
      <Route path="/agendar/:bookingLinkId" element={<Suspense fallback={<FullScreenLoader />}><PublicBookingPage /></Suspense>} />
      
      <Route path="/p/:slug" element={<Suspense fallback={<FullScreenLoader />}><ProposalPublicView /></Suspense>} />

      <Route path="/webhooks/assinafy" element={<Suspense fallback={<FullScreenLoader />}><AssinafyWebhookPage /></Suspense>} />
      <Route path="/manutencao" element={<Suspense fallback={<FullScreenLoader />}><MaintenancePage /></Suspense>} />
      <Route path="/blog" element={<Suspense fallback={<FullScreenLoader />}><BlogPage /></Suspense>} />
      <Route path="/blog/:slug" element={<Suspense fallback={<FullScreenLoader />}><BlogPostPage /></Suspense>} />
      
      <Route path="/control-acess/login" element={<Suspense fallback={<FullScreenLoader />}><AdminLoginPage /></Suspense>} />
      <Route 
        path="/control-acess/*"
        element={
          <AdminProtectedRoute>
            <Suspense fallback={<FullScreenLoader />}>
              <AdminLayout />
            </Suspense>
          </AdminProtectedRoute>
        } 
      />

      <Route path="/sobre" element={<Suspense fallback={<FullScreenLoader />}><CustomPageViewer slug="sobre" /></Suspense>} />
      <Route path="/fale-conosco" element={<Suspense fallback={<FullScreenLoader />}><CustomPageViewer slug="fale-conosco" /></Suspense>} />
      <Route path="/tutoriais" element={<Suspense fallback={<FullScreenLoader />}><TutorialsPage /></Suspense>} />
      <Route path="/tutoriais/:slug" element={<Suspense fallback={<FullScreenLoader />}><CustomPageViewer isTutorial={true} /></Suspense>} />
      
      <Route path="/studio/proposals/new" element={<EditorLayout><Suspense fallback={<FullScreenLoader />}><ProposalEditorPage /></Suspense></EditorLayout>} />
      <Route path="/studio/proposals/edit/:proposalId" element={<EditorLayout><Suspense fallback={<FullScreenLoader />}><ProposalEditorPage /></Suspense></EditorLayout>} />
       <Route path="/studio/contracts/new" element={<EditorLayout><Suspense fallback={<FullScreenLoader />}><ContractEditorPage mode="new" /></Suspense></EditorLayout>} />
      <Route path="/studio/contracts/edit/:contractId" element={<EditorLayout><Suspense fallback={<FullScreenLoader />}><ContractEditorPage mode="edit" /></Suspense></EditorLayout>} />
      
      <Route path="/*" element={<MainLayout />}>
        <Route path="*" element={<Suspense fallback={<FullScreenLoader />}><Outlet /></Suspense>} />
      </Route>
    </Routes>
  );
};


function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <DataProvider>
            <ModalStateProvider>
              <ErrorLoggingProvider>
                <ErrorBoundary>
                  <KeepAlive />
                  <PWAInstaller />
                  <AppRoutes />
                </ErrorBoundary>
              </ErrorLoggingProvider>
            </ModalStateProvider>
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
      <GlobalNotifications />
    </Router>
  );
}



export default App;