import { supabase } from '@/lib/supabaseClient';

export const addServicePackage = async (supabase, userId, pkg) => {
  if (!userId) throw new Error("User ID is required to add a service package.");
  
  const { count, error: checkError } = await supabase
    .from('service_packages')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('name', pkg.name);

  if (checkError) throw new Error(`Erro ao verificar pacote: ${checkError.message}`);
  if (count > 0) throw new Error(`Um pacote com o nome "${pkg.name}" já existe.`);

  const pkgToInsert = { ...pkg, user_id: userId };

  const { data, error } = await supabase
    .from('service_packages')
    .insert([pkgToInsert])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateServicePackage = async (supabase, userId, id, updates) => {
  if (!userId) throw new Error("User ID is required to update a service package.");

  if (updates.name) {
    const { count, error: checkError } = await supabase
      .from('service_packages')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('name', updates.name)
      .neq('id', id);

    if (checkError) throw new Error(`Erro ao verificar pacote: ${checkError.message}`);
    if (count > 0) throw new Error(`Um pacote com o nome "${updates.name}" já existe.`);
  }

  const { data, error } = await supabase
    .from('service_packages')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteServicePackage = async (supabase, userId, id) => {
  if (!userId) throw new Error("User ID is required to delete a service package.");
  const { error } = await supabase
    .from('service_packages')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw error;
};

export const fetchServicePackages = async (supabase, userId) => {
  if (!userId) throw new Error("User ID is required to fetch service packages.");
  const { data, error } = await supabase
    .from('service_packages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};