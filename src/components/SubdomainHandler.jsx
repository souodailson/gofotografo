import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import FullScreenLoader from '@/components/FullScreenLoader';

const SubdomainHandler = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [subdomainUser, setSubdomainUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSubdomain = async () => {
      const hostname = window.location.hostname;
      
      // Verificar se é um subdomínio
      const parts = hostname.split('.');
      
      // Se for um subdomínio (ex: meusite.gofotografo.com)
      if (parts.length >= 3 && parts[1] === 'gofotografo' && parts[2] === 'com') {
        const subdomain = parts[0];
        
        // Verificar se é um subdomínio especial que deve ser ignorado
        const ignoredSubdomains = ['www', 'api', 'admin', 'app', 'mail', 'ftp'];
        if (ignoredSubdomains.includes(subdomain)) {
          setIsLoading(false);
          return;
        }
        
        try {
          // Buscar usuário com esse subdomínio
          const { data: userData, error } = await supabase
            .from('users_settings')
            .select(`
              *,
              users (
                id,
                email,
                created_at
              )
            `)
            .eq('subdomain', subdomain)
            .single();

          if (error && error.code !== 'PGRST116') {
            throw error;
          }

          if (userData) {
            setSubdomainUser(userData);
            // Redirecionar para a página do portfólio do usuário
            navigate(`/portfolio/${userData.users.id}`, { replace: true });
          } else {
            // Subdomínio não encontrado - redirecionar para página principal
            window.location.href = 'https://gofotografo.com';
            return;
          }
        } catch (error) {
          console.error('Erro ao verificar subdomínio:', error);
          // Em caso de erro, redirecionar para página principal
          window.location.href = 'https://gofotografo.com';
          return;
        }
      }
      
      setIsLoading(false);
    };

    checkSubdomain();
  }, [navigate]);

  if (isLoading) {
    return <FullScreenLoader />;
  }

  return children;
};

export default SubdomainHandler;