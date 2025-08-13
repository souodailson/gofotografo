export const addProduct = async (supabase, userId, productData) => {
  const { data, error } = await supabase
    .from('products')
    .insert([{ ...productData, user_id: userId }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateProduct = async (supabase, userId, productId, updates) => {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', productId)
    .eq('user_id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteProduct = async (supabase, userId, productId) => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId)
    .eq('user_id', userId);
  
  if (error) throw error;
};

export const getProducts = async (supabase, userId) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};