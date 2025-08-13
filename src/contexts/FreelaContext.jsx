import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './authContext';
import { useToast } from '@/components/ui/use-toast';
import * as freelaApi from '@/lib/db/freelaApi';

const FreelaContext = createContext();

export const useFreela = () => {
  const context = useContext(FreelaContext);
  if (!context) {
    throw new Error('useFreela must be used within a FreelaProvider');
  }
  return context;
};

export const FreelaProvider = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Estados
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  // ===== PROFILE FUNCTIONS =====

  const loadProfile = useCallback(async () => {
    if (!user) return;
    
    setProfileLoading(true);
    try {
      const data = await freelaApi.getFreelaProfile(user.id);
      setProfile(data);
      
      if (data) {
        // Carrega portfolio se o perfil existe
        const portfolioData = await freelaApi.getPortfolio(data.id);
        setPortfolio(portfolioData);
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    } finally {
      setProfileLoading(false);
    }
  }, [user]);

  const createProfile = async (profileData) => {
    if (!user) throw new Error('Usuário não autenticado');
    
    setLoading(true);
    try {
      const newProfile = await freelaApi.createFreelaProfile({
        ...profileData,
        user_id: user.id,
        email: user.email
      });
      
      setProfile(newProfile);
      toast({
        title: "Perfil criado!",
        description: "Seu perfil FREELA foi criado com sucesso."
      });
      
      return newProfile;
    } catch (error) {
      toast({
        title: "Erro ao criar perfil",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    if (!profile) throw new Error('Perfil não encontrado');
    
    setLoading(true);
    try {
      const updatedProfile = await freelaApi.updateFreelaProfile(profile.id, updates);
      setProfile(updatedProfile);
      
      toast({
        title: "Perfil atualizado!",
        description: "Suas alterações foram salvas."
      });
      
      return updatedProfile;
    } catch (error) {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ===== PORTFOLIO FUNCTIONS =====

  const addPortfolioItem = async (itemData) => {
    if (!profile) throw new Error('Perfil não encontrado');
    
    try {
      const newItem = await freelaApi.addPortfolioItem({
        ...itemData,
        profile_id: profile.id
      });
      
      setPortfolio(prev => [...prev, newItem]);
      
      toast({
        title: "Item adicionado!",
        description: "Novo item adicionado ao portfólio."
      });
      
      return newItem;
    } catch (error) {
      toast({
        title: "Erro ao adicionar item",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const updatePortfolioItem = async (itemId, updates) => {
    try {
      const updatedItem = await freelaApi.updatePortfolioItem(itemId, updates);
      
      setPortfolio(prev => 
        prev.map(item => item.id === itemId ? updatedItem : item)
      );
      
      toast({
        title: "Item atualizado!",
        description: "Item do portfólio atualizado."
      });
      
      return updatedItem;
    } catch (error) {
      toast({
        title: "Erro ao atualizar item",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const deletePortfolioItem = async (itemId) => {
    try {
      await freelaApi.deletePortfolioItem(itemId);
      
      setPortfolio(prev => prev.filter(item => item.id !== itemId));
      
      toast({
        title: "Item removido!",
        description: "Item removido do portfólio."
      });
    } catch (error) {
      toast({
        title: "Erro ao remover item",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  // ===== JOBS FUNCTIONS =====

  const loadJobs = async (filters = {}) => {
    setLoading(true);
    try {
      const data = await freelaApi.getJobs(filters);
      setJobs(data);
      return data;
    } catch (error) {
      console.error('Erro ao carregar trabalhos:', error);
      toast({
        title: "Erro ao carregar trabalhos",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createJob = async (jobData) => {
    if (!profile) throw new Error('Perfil não encontrado');
    
    setLoading(true);
    try {
      const newJob = await freelaApi.createJob({
        ...jobData,
        posted_by: profile.id
      });
      
      setJobs(prev => [newJob, ...prev]);
      
      toast({
        title: "Trabalho publicado!",
        description: "Seu trabalho foi publicado com sucesso."
      });
      
      return newJob;
    } catch (error) {
      toast({
        title: "Erro ao publicar trabalho",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateJob = async (jobId, updates) => {
    try {
      const updatedJob = await freelaApi.updateJob(jobId, updates);
      
      setJobs(prev => 
        prev.map(job => job.id === jobId ? updatedJob : job)
      );
      
      toast({
        title: "Trabalho atualizado!",
        description: "Alterações salvas com sucesso."
      });
      
      return updatedJob;
    } catch (error) {
      toast({
        title: "Erro ao atualizar trabalho",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteJob = async (jobId) => {
    try {
      await freelaApi.deleteJob(jobId);
      
      setJobs(prev => prev.filter(job => job.id !== jobId));
      
      toast({
        title: "Trabalho removido!",
        description: "Trabalho removido com sucesso."
      });
    } catch (error) {
      toast({
        title: "Erro ao remover trabalho",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  // ===== APPLICATIONS FUNCTIONS =====

  const loadApplications = async () => {
    if (!profile) return;
    
    try {
      const data = await freelaApi.getFreelancerApplications(profile.id);
      setApplications(data);
      return data;
    } catch (error) {
      console.error('Erro ao carregar candidaturas:', error);
    }
  };

  const createApplication = async (applicationData) => {
    if (!profile) throw new Error('Perfil não encontrado');
    
    setLoading(true);
    try {
      const newApplication = await freelaApi.createApplication({
        ...applicationData,
        freelancer_id: profile.id
      });
      
      setApplications(prev => [newApplication, ...prev]);
      
      toast({
        title: "Candidatura enviada!",
        description: "Sua candidatura foi enviada com sucesso."
      });
      
      return newApplication;
    } catch (error) {
      toast({
        title: "Erro ao enviar candidatura",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateApplication = async (applicationId, updates) => {
    try {
      const updatedApplication = await freelaApi.updateApplication(applicationId, updates);
      
      setApplications(prev => 
        prev.map(app => app.id === applicationId ? updatedApplication : app)
      );
      
      return updatedApplication;
    } catch (error) {
      toast({
        title: "Erro ao atualizar candidatura",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  // ===== FAVORITES FUNCTIONS =====

  const loadFavorites = async () => {
    if (!profile) return;
    
    try {
      const data = await freelaApi.getFavorites(profile.id);
      setFavorites(data);
      return data;
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
    }
  };

  const toggleFavorite = async (jobId) => {
    if (!profile) throw new Error('Perfil não encontrado');
    
    try {
      const isFavorite = await freelaApi.checkIfFavorite(profile.id, jobId);
      
      if (isFavorite) {
        await freelaApi.removeFromFavorites(profile.id, jobId);
        setFavorites(prev => prev.filter(fav => fav.job_id !== jobId));
        toast({
          title: "Removido dos favoritos",
          description: "Trabalho removido dos favoritos."
        });
      } else {
        await freelaApi.addToFavorites(profile.id, jobId);
        await loadFavorites(); // Recarrega para pegar os dados completos
        toast({
          title: "Adicionado aos favoritos",
          description: "Trabalho adicionado aos favoritos."
        });
      }
      
      return !isFavorite;
    } catch (error) {
      toast({
        title: "Erro ao favoritar",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  // ===== MESSAGES FUNCTIONS =====

  const loadConversations = async () => {
    if (!profile) return;
    
    try {
      const data = await freelaApi.getConversations(profile.id);
      setConversations(data);
      return data;
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
    }
  };

  const sendMessage = async (messageData) => {
    if (!profile) throw new Error('Perfil não encontrado');
    
    try {
      const newMessage = await freelaApi.sendMessage({
        ...messageData,
        sender_id: profile.id
      });
      
      // Atualiza conversas
      await loadConversations();
      
      return newMessage;
    } catch (error) {
      toast({
        title: "Erro ao enviar mensagem",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  // ===== UTILITY FUNCTIONS =====

  const uploadImage = async (file, folder = 'profiles/') => {
    try {
      return await freelaApi.uploadImage(file, 'freela-images', folder);
    } catch (error) {
      toast({
        title: "Erro ao fazer upload",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const checkIfApplied = (jobId) => {
    return applications.some(app => app.job_id === jobId);
  };

  const checkIfFavorite = (jobId) => {
    return favorites.some(fav => fav.job_id === jobId);
  };

  // ===== EFFECTS =====

  useEffect(() => {
    if (user) {
      loadProfile();
    } else {
      setProfile(null);
      setPortfolio([]);
      setApplications([]);
      setFavorites([]);
      setConversations([]);
      setNotifications([]);
    }
  }, [user, loadProfile]);

  useEffect(() => {
    if (profile) {
      loadApplications();
      loadFavorites();
      loadConversations();
    }
  }, [profile]);

  const value = {
    // States
    profile,
    jobs,
    applications,
    conversations,
    favorites,
    notifications,
    portfolio,
    loading,
    profileLoading,

    // Profile functions
    createProfile,
    updateProfile,
    loadProfile,

    // Portfolio functions
    addPortfolioItem,
    updatePortfolioItem,
    deletePortfolioItem,

    // Jobs functions
    loadJobs,
    createJob,
    updateJob,
    deleteJob,

    // Applications functions
    loadApplications,
    createApplication,
    updateApplication,

    // Favorites functions
    loadFavorites,
    toggleFavorite,

    // Messages functions
    loadConversations,
    sendMessage,

    // Utility functions
    uploadImage,
    checkIfApplied,
    checkIfFavorite,

    // API constants
    categories: freelaApi.FREELA_CATEGORIES,
    regions: freelaApi.FREELA_REGIONS,
    paymentTypes: freelaApi.PAYMENT_TYPES,
    urgencyLevels: freelaApi.URGENCY_LEVELS
  };

  return <FreelaContext.Provider value={value}>{children}</FreelaContext.Provider>;
};