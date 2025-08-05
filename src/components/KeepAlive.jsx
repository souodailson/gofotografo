import React, { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/authContext';

const KeepAlive = () => {
  const { user } = useAuth();

  useEffect(() => {
    const keepAliveInterval = 240000; // 4 minutos

    const ping = async () => {
      if (!user) {
        console.log('KeepAlive: Usuário não logado, ping ignorado.');
        return;
      }

      try {
        // Ping leve para manter a instância ativa
        const { error } = await supabase
          .from('settings')
          .select('user_id')
          .eq('user_id', user.id)
          .limit(1);

        if (error) {
          console.warn('KeepAlive: Ping falhou (silenciosamente). Erro:', error.message);
        } else {
          console.log(`KeepAlive: Ping realizado com sucesso às ${new Date().toLocaleTimeString()}`);
        }
      } catch (error) {
        console.warn('KeepAlive: Erro na execução do ping.', error);
      }
    };

    const intervalId = setInterval(ping, keepAliveInterval);

    // Limpa o intervalo quando o componente é desmontado
    return () => {
      clearInterval(intervalId);
    };
  }, [user]);

  return null; // Este componente não renderiza nada
};

export default KeepAlive;