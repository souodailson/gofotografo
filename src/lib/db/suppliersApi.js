import { supabase } from '@/lib/supabaseClient';

export const addSupplier = async (supabaseClient, userId, supplier) => {
  if (supplier.name) {
      const { count, error: checkError } = await supabaseClient
        .from('suppliers')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('name', supplier.name);

      if (checkError) {
        throw new Error(`Erro ao verificar fornecedor existente: ${checkError.message}`);
      }

      if (count > 0) {
        throw new Error(`Um fornecedor com o nome "${supplier.name}" já existe.`);
      }
  }

  const { data, error } = await supabaseClient
    .from('suppliers')
    .insert([{ ...supplier, user_id: userId, created_at: new Date().toISOString() }])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateSupplier = async (supabaseClient, userId, id, updates) => {
  if (updates.name) {
    const { count, error: checkError } = await supabaseClient
      .from('suppliers')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('name', updates.name)
      .neq('id', id);

    if (checkError) {
      throw new Error(`Erro ao verificar fornecedor existente: ${checkError.message}`);
    }

    if (count > 0) {
      throw new Error(`Um fornecedor com o nome "${updates.name}" já existe.`);
    }
  }

  const { data, error } = await supabaseClient
    .from('suppliers')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteSupplier = async (supabaseClient, userId, id) => {
  const { error } = await supabaseClient
    .from('suppliers')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw error;
};