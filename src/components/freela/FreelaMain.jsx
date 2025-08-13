import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useFreela } from '@/contexts/FreelaContext';
import FreelaOnboarding from './FreelaOnboarding';
import FreelaNavbar from './FreelaNavbar';
import FreelaFeed from './FreelaFeed';
import FreelaProfile from './FreelaProfile';
import FreelaMyJobs from './FreelaMyJobs';
import FreelaApplications from './FreelaApplications';
import FreelaMessages from './FreelaMessages';
import FreelaFavorites from './FreelaFavorites';

const FreelaMain = () => {
  const { profile, profileLoading, loadJobs } = useFreela();
  const [activeTab, setActiveTab] = useState('feed');

  useEffect(() => {
    // Carrega trabalhos iniciais
    loadJobs();
  }, [loadJobs]);

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  // Se não tem perfil, mostra onboarding
  if (!profile) {
    return <FreelaOnboarding />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'feed':
        return <FreelaFeed />;
      case 'profile':
        return <FreelaProfile />;
      case 'my-jobs':
        return <FreelaMyJobs />;
      case 'applications':
        return <FreelaApplications />;
      case 'messages':
        return <FreelaMessages />;
      case 'favorites':
        return <FreelaFavorites />;
      default:
        return <FreelaFeed />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <FreelaNavbar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="pt-16">
        <div className="container mx-auto px-4 py-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default FreelaMain;