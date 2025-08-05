import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useData } from '@/contexts/DataContext'; 
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';

const ProtectedRoute = ({ children }) => {
  const { user, loadingAuth, settings } = useData();
  const location = useLocation();
  const [maintenanceStatus, setMaintenanceStatus] = useState({ loading: true, enabled: false, message: '' });

  useEffect(() => {
    const checkMaintenanceMode = async () => {
      if (!user) {
        setMaintenanceStatus({ loading: false, enabled: false, message: '' });
        return;
      }
      try {
        const { data, error } = await supabase
          .from('system_status')
          .select('maintenance_mode_enabled, maintenance_message')
          .eq('id', 1)
          .single();

        if (error) {
          console.error("Erro ao verificar modo de manutenção:", error);
          setMaintenanceStatus({ loading: false, enabled: false, message: '' });
          return;
        }
        
        setMaintenanceStatus({ loading: false, enabled: data.maintenance_mode_enabled, message: data.maintenance_message });
      } catch (error) {
        setMaintenanceStatus({ loading: false, enabled: false, message: '' });
      }
    };

    if (!loadingAuth) {
      checkMaintenanceMode();
    }
  }, [loadingAuth, user]);

  if (loadingAuth || maintenanceStatus.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark:bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-customPurple dark:border-customGreen border-t-transparent rounded-full"
        />
      </div>
    );
  }
  
  const isAdmin = settings?.role === 'ADMIN';

  if (maintenanceStatus.enabled && !isAdmin) {
    return <Navigate to="/manutencao" state={{ message: maintenanceStatus.message }} replace />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children; 
};

export default ProtectedRoute;