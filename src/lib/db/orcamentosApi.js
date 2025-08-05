import { supabase } from '@/lib/supabaseClient';

export const getOrcamentosByClientId = async (supabaseClient, userId, clientId) => {
  if (!supabaseClient) throw new Error("Supabase client is not initialized.");
  const { data, error } = await supabaseClient
    .from('orcamentos')
    .select('*')
    .eq('user_id', userId)
    .eq('client_id', clientId)
    .order('data_envio', { ascending: false });

  if (error) {
    console.error('Erro ao buscar orçamentos:', error);
    throw error;
  }
  return data || [];
};

export const addOrcamento = async (supabaseClient, orcamentoData) => {
  if (!supabaseClient) throw new Error("Supabase client is not initialized.");
  const { data, error } = await supabaseClient
    .from('orcamentos')
    .insert([orcamentoData])
    .select()
    .single();

  if (error) {
    console.error('Erro ao adicionar orçamento:', error);
    throw error;
  }
  return data;
};

export const updateOrcamento = async (supabaseClient, orcamentoId, orcamentoData, userId) => {
  if (!supabaseClient) throw new Error("Supabase client is not initialized.");
  // Certifique-se de que updated_at está sendo definido aqui ou por um trigger
  const dataToUpdate = { ...orcamentoData, updated_at: new Date().toISOString() };
  
  const { data, error } = await supabaseClient
    .from('orcamentos')
    .update(dataToUpdate)
    .eq('id', orcamentoId)
    .eq('user_id', userId) // Garantir que o usuário só atualize seus próprios orçamentos
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar orçamento:', error);
    throw error;
  }
  return data;
};

export const deleteOrcamento = async (supabaseClient, orcamentoId, userId) => {
  if (!supabaseClient) throw new Error("Supabase client is not initialized.");
  const { error } = await supabaseClient
    .from('orcamentos')
    .delete()
    .eq('id', orcamentoId)
    .eq('user_id', userId); // Garantir que o usuário só delete seus próprios orçamentos

  if (error) {
    console.error('Erro ao excluir orçamento:', error);
    throw error;
  }
  return true;
};