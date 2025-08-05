import React, { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useLocation, useNavigate } from 'react-router-dom';

const AssinafyWebhookPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleWebhook = async (payload) => {
      if (!payload || !payload.id || !payload.status) {
        console.error("Webhook payload inválido recebido da Assinafy.");
        return;
      }
      
      const { id: assinafyDocId, status, file_url } = payload;
      
      const { data: contract, error: fetchError } = await supabase
        .from('contratosgerados')
        .select('id')
        .eq('id_assinatura_assinafy', assinafyDocId)
        .single();
        
      if (fetchError || !contract) {
        console.error(`Contrato com ID Assinafy ${assinafyDocId} não encontrado no sistema.`);
        return;
      }
      
      const updatePayload = {
        status_assinatura: status.toLowerCase(),
      };
      
      if (status.toLowerCase() === 'assinado' && file_url) {
        updatePayload.link_documento_final_assinafy = file_url;
      }
      
      const { error: updateError } = await supabase
        .from('contratosgerados')
        .update(updatePayload)
        .eq('id', contract.id);
        
      if (updateError) {
        console.error(`Erro ao atualizar o status do contrato ${contract.id}:`, updateError.message);
      } else {
        console.log(`Contrato ${contract.id} atualizado para o status: ${status}.`);
      }
    };

    const processRequest = async () => {
      // Esta página é apenas um placeholder para a rota.
      // A lógica real é tratada na Edge Function 'assinafy-webhook-handler'.
      // O código aqui é para demonstrar o que aconteceria se o webhook fosse tratado no cliente.
      console.log("Página de webhook acessada. A lógica real está na Edge Function. Redirecionando...");
      
      // Simulação de recebimento de payload para fins de exemplo
      // Em um cenário real, isso viria de uma requisição POST para a Edge Function
      const examplePayload = new URLSearchParams(location.search).get('payload');
      if (examplePayload) {
          try {
              const parsedPayload = JSON.parse(decodeURIComponent(examplePayload));
              await handleWebhook(parsedPayload);
          } catch(e) {
              console.error("Erro ao processar payload de exemplo:", e);
          }
      }
      
      navigate('/contracts', { replace: true });
    };

    processRequest();
  }, [location, navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p>Processando webhook...</p>
    </div>
  );
};

export default AssinafyWebhookPage;