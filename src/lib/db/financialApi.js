import { supabase } from '@/lib/supabaseClient';

export const addTransaction = async (supabaseClient, userId, transaction) => {
  const newTransaction = {
    ...transaction,
    user_id: userId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString() 
  };
  
  delete newTransaction.id; 

  if ('client_id' in newTransaction) {
    newTransaction.cliente_id = newTransaction.client_id;
    delete newTransaction.client_id;
  }

  // Remove fornecedor_id temporariamente até criar coluna no banco
  if ('fornecedor_id' in newTransaction) {
    delete newTransaction.fornecedor_id;
  }

  if ('date' in newTransaction) {
    newTransaction.data = newTransaction.date;
    delete newTransaction.date;
  }

  if ('workflow_id' in newTransaction) {
    newTransaction.trabalho_id = newTransaction.workflow_id;
    delete newTransaction.workflow_id;
  }

  const { data, error } = await supabaseClient
    .from('transacoes') 
    .insert([newTransaction])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateTransaction = async (supabaseClient, userId, id, updates) => {
  const transactionUpdates = {
    ...updates,
    updated_at: new Date().toISOString()
  };

  if ('client_id' in transactionUpdates) {
    transactionUpdates.cliente_id = transactionUpdates.client_id;
    delete transactionUpdates.client_id;
  }

  // Remove fornecedor_id temporariamente até criar coluna no banco
  if ('fornecedor_id' in transactionUpdates) {
    delete transactionUpdates.fornecedor_id;
  }

  if ('date' in transactionUpdates) {
    transactionUpdates.data = transactionUpdates.date;
    delete transactionUpdates.date;
  }
  
  if ('workflow_id' in transactionUpdates) {
    transactionUpdates.trabalho_id = transactionUpdates.workflow_id;
    delete transactionUpdates.workflow_id;
  }

  const { data, error } = await supabaseClient
    .from('transacoes') 
    .update(transactionUpdates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteTransaction = async (supabaseClient, userId, id) => {
  const { error } = await supabaseClient
    .from('transacoes') 
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw error;
};

export const getTransactionsByUserId = async (supabaseClient, userId) => {
  const { data, error } = await supabaseClient
    .from('transacoes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const getTransactionsByWorkflowId = async (supabaseClient, workflowId) => {
  const { data, error } = await supabaseClient
    .from('transacoes')
    .select('*')
    .eq('trabalho_id', workflowId);
  if (error) {
    // Erro ao buscar transações - retorna array vazio
    return [];
  }
  return data;
};