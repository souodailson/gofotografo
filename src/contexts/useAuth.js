import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';

export const useAuth = (onAuthSuccess, onSignOut) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const { toast } = useToast();

  const handleAuthError = useCallback((error, context) => {
    console.error(`Auth error (${context}):`, error);
    if (error && (error.message.includes("Invalid Refresh Token") || error.message.includes("Token not found"))) {
      toast({
        title: "Sessão Expirada",
        description: "Por favor, faça login novamente.",
        variant: "destructive",
      });
      if (typeof onSignOut === 'function') {
        onSignOut();
      }
    }
  }, [toast, onSignOut]);

  useEffect(() => {
    const getSessionAndUser = async () => {
      try {
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        
        const activeUser = currentSession?.user ?? null;
        setSession(currentSession);
        setUser(activeUser);

        if (activeUser && typeof onAuthSuccess === 'function') {
          await onAuthSuccess(activeUser);
        } else if (!activeUser && typeof onSignOut === 'function') {
          onSignOut();
        }
      } catch (error) {
        handleAuthError(error, "obter sessão inicial");
        if (typeof onSignOut === 'function') {
          onSignOut();
        }
      } finally {
        setLoadingAuth(false);
      }
    };

    getSessionAndUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setLoadingAuth(true);
        const currentUser = newSession?.user ?? null;
        setSession(newSession);
        setUser(currentUser);

        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          if (currentUser && typeof onAuthSuccess === 'function') {
            await onAuthSuccess(currentUser);
          }
        } else if (event === 'SIGNED_OUT') {
          if (typeof onSignOut === 'function') {
            onSignOut();
          }
        } else if (event === 'TOKEN_REFRESHED' && !currentUser) {
          handleAuthError({ message: "Token refresh failed, user is null" }, "token refreshed");
        }
        setLoadingAuth(false);
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [onAuthSuccess, onSignOut, handleAuthError]);

  return { user, session, loadingAuth };
};