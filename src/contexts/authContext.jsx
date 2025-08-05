import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { initialSettingsData as defaultInitialSettings, initialWorkflowColumnsData, handleSupabaseError as handleGlobalError } from '@/lib/dataUtils'; 
import { saveSettings as saveSettingsDb } from '@/lib/db/settingsApi';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const isInvalidTokenError = (error) => {
  if (!error) return false;
  const message = error.message || '';
  const isAuthError = message.includes("Invalid Refresh Token") || 
                      message.includes("Token not found") || 
                      message.includes("Session not found");
  const isApiErrorCode = error.code === '400' && error.error_code === 'refresh_token_not_found';
  return isAuthError || isApiErrorCode;
};

export const AuthProvider = ({ children }) => {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [settings, setSettingsData] = useState(defaultInitialSettings);
  const [loadingSettings, setLoadingSettings] = useState(true);

  const handleError = useCallback(async (error, context) => {
    if (isInvalidTokenError(error)) {
      toast({
        title: "Sessão Expirada ou Inválida",
        description: "Sua sessão expirou. Por favor, faça login novamente para continuar.",
        variant: "destructive",
        duration: 7000,
      });
      if (supabase) {
        await supabase.auth.signOut().catch(signOutError => {
          console.error("Erro durante o signOut forçado:", signOutError);
        });
      }
      setUser(null);
      setSession(null);
      setSettingsData(defaultInitialSettings);
      setLoadingAuth(false);
      setLoadingSettings(false);
      return;
    }
    handleGlobalError(error, context, toast);
  }, [toast]);

  const fetchSettings = useCallback(async (currentUser) => {
    if (!currentUser || !supabase) {
      setSettingsData(defaultInitialSettings);
      setLoadingSettings(false);
      return;
    }

    setLoadingSettings(true);
    try {
      const { data: settingsDataResult, error: settingsError } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', currentUser.id)
        .single();
      
      const userFullName = currentUser.user_metadata?.full_name || currentUser.email;

      if (settingsError && settingsError.code !== 'PGRST116') {
        await handleError(settingsError, 'buscar configurações');
        if (isInvalidTokenError(settingsError)) return;
        setSettingsData({
          ...defaultInitialSettings,
          user_name: userFullName,
          contact_email: currentUser.email,
          user_id: currentUser.id,
          profile_photo: currentUser.user_metadata?.avatar_url || null,
          workflow_columns: initialWorkflowColumnsData,
        });
      } else if (settingsDataResult) {
        setSettingsData(prev => ({
          ...defaultInitialSettings,
          ...prev,
          ...settingsDataResult,
          user_name: settingsDataResult.user_name || userFullName,
          contact_email: settingsDataResult.contact_email || currentUser.email,
          user_id: settingsDataResult.user_id || currentUser.id,
          profile_photo: settingsDataResult.profile_photo || currentUser.user_metadata?.avatar_url || null,
          workflow_columns: settingsDataResult.workflow_columns || initialWorkflowColumnsData,
        }));
      } else {
        const initialUserSettings = {
          ...defaultInitialSettings,
          user_name: userFullName,
          contact_email: currentUser.email,
          user_id: currentUser.id,
          profile_photo: currentUser.user_metadata?.avatar_url || null,
          workflow_columns: initialWorkflowColumnsData,
        };
        setSettingsData(initialUserSettings);
        const { data: insertedData, error: insertError } = await supabase.from('settings').insert([initialUserSettings]).select().single();
        if (insertError) {
          await handleError(insertError, 'criar configurações padrão');
          if (isInvalidTokenError(insertError)) return;
        } else if (insertedData) {
          setSettingsData(prev => ({ ...defaultInitialSettings, ...prev, ...insertedData }));
        }
      }
    } catch (error) {
      await handleError(error, 'carregar configurações');
    } finally {
      setLoadingSettings(false);
    }
  }, [handleError]);

  useEffect(() => {
    setLoadingAuth(true);
    const getSessionAndUser = async () => {
      if (!supabase) {
        console.error("Supabase client not initialized. Cannot get session.");
        setLoadingAuth(false);
        setSettingsData(defaultInitialSettings);
        setLoadingSettings(false);
        return;
      }
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Error getting session:", sessionError);
        await handleError(sessionError, "obter sessão de autenticação");
        setLoadingAuth(false);
        return;
      }

      const activeUser = currentSession?.user ?? null;
      setSession(currentSession);
      setUser(activeUser);

      if (activeUser && activeUser.email_confirmed_at) {
        await fetchSettings(activeUser);
      } else {
        setSettingsData(defaultInitialSettings);
        setLoadingSettings(false);
        if (activeUser && !activeUser.email_confirmed_at) {
          toast({
            title: "Email não confirmado",
            description: "Por favor, confirme seu email para continuar.",
            variant: "destructive",
          });
        }
      }
      setLoadingAuth(false);
    };
    getSessionAndUser();

    if (!supabase) {
      console.error("Supabase client not initialized. Cannot set auth listener.");
      return;
    }

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setLoadingAuth(true);
        const currentUser = newSession?.user ?? null;
        setSession(newSession);
        setUser(currentUser);

        if (event === 'SIGNED_IN' && currentUser && currentUser.email_confirmed_at) {
          await fetchSettings(currentUser);
        } else if (event === 'SIGNED_OUT') {
          setSettingsData(defaultInitialSettings);
          setLoadingSettings(false);
        } else if (event === 'USER_UPDATED' && currentUser && currentUser.email_confirmed_at) {
          setSettingsData(prev => ({
            ...prev,
            user_name: currentUser.user_metadata?.full_name || prev.user_name || currentUser.email,
            profile_photo: currentUser.user_metadata?.avatar_url || prev.profile_photo
          }));
        } else if (!currentUser && event !== 'SIGNED_OUT') {
          setSettingsData(defaultInitialSettings);
          setLoadingSettings(false);
        }
        
        if (currentUser && !currentUser.email_confirmed_at && event !== 'INITIAL_SESSION') {
          toast({
             title: "Email não confirmado",
             description: "Por favor, confirme seu email para continuar.",
             variant: "destructive",
          });
        }
        setLoadingAuth(false);
      }
    );
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [handleError, fetchSettings, toast]);


  const updateSettings = async (newSettings) => {
    if (!user || !user.email_confirmed_at || !supabase) {
      await handleError({ message: "Usuário não autenticado, email não confirmado ou Supabase não inicializado" }, "salvar configurações");
      return;
    }
    try {
      const userNameFallback = user.user_metadata?.full_name || user.email;
      const data = await saveSettingsDb(supabase, user.id, newSettings, settings, userNameFallback);
      if (data) {
        setSettingsData(prev => ({ ...defaultInitialSettings, ...prev, ...data }));
        
        let authUpdates = {};
        if (newSettings.user_name && newSettings.user_name !== (user.user_metadata?.full_name || '')) {
          authUpdates.data = { ...authUpdates.data, full_name: newSettings.user_name };
        }
        if (newSettings.profile_photo && newSettings.profile_photo !== (user.user_metadata?.avatar_url || '')) {
          authUpdates.data = { ...authUpdates.data, avatar_url: newSettings.profile_photo };
        }

        if (Object.keys(authUpdates).length > 0) {
          const { data: updatedUser, error: updateUserError } = await supabase.auth.updateUser(authUpdates);
          if (updateUserError) {
            await handleError(updateUserError, "atualizar dados do usuário na autenticação");
          } else if (updatedUser) {
            setUser(prevUser => ({ ...prevUser, user_metadata: updatedUser.user.user_metadata }));
          }
        }
      }
    } catch (error) {
      await handleError(error, 'salvar configurações');
    }
  };
  
  const logout = async () => {
    if (!supabase) {
      await handleError({ message: "Supabase client not initialized" }, "fazer logout");
      return;
    }
    const { error } = await supabase.auth.signOut();
    if (error) await handleError(error, "fazer logout");
    else {
      setUser(null);
      setSession(null);
      setSettingsData(defaultInitialSettings);
    }
  };

  const value = {
    user,
    session,
    settings,
    loadingAuth,
    loadingSettings,
    setSettings: updateSettings,
    logout,
    refreshSettings: () => user ? fetchSettings(user) : Promise.resolve(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};