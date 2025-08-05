import { supabase } from '@/lib/supabaseClient';

export const checkPricedServiceExists = async (userId, serviceName, serviceId = null) => {
    let query = supabase
        .from('servicos_precificados')
        .select('id', { count: 'exact' })
        .eq('user_id', userId)
        .eq('nome_servico', serviceName);

    if (serviceId) {
        query = query.neq('id', serviceId);
    }
    
    const { count, error } = await query;
    if (error) throw error;
    return count > 0;
};

export const addPricedServiceDb = async (userId, serviceData) => {
    const exists = await checkPricedServiceExists(userId, serviceData.nome_servico);
    if (exists) throw new Error(`Um serviço com o nome "${serviceData.nome_servico}" já existe.`);

    const { data, error } = await supabase
        .from('servicos_precificados')
        .insert([{ ...serviceData, user_id: userId }])
        .select()
        .single();
    if (error) throw error;
    return data;
};

export const checkFixedCostExists = async (userId, costName, costId = null) => {
    let query = supabase
        .from('custos_fixos')
        .select('id', { count: 'exact' })
        .eq('user_id', userId)
        .eq('nome_custo', costName);
    
    if (costId) {
        query = query.neq('id', costId);
    }

    const { count, error } = await query;
    if (error) throw error;
    return count > 0;
};

export const addFixedCostDb = async (userId, costData) => {
    const exists = await checkFixedCostExists(userId, costData.nome_custo);
    if (exists) throw new Error(`Um custo com o nome "${costData.nome_custo}" já existe.`);

    const { data, error } = await supabase
        .from('custos_fixos')
        .insert([{ ...costData, user_id: userId }])
        .select()
        .single();
    if (error) throw error;
    return data;
};

export const updateFixedCostDb = async (userId, costId, costData) => {
    if (costData.nome_custo) {
        const exists = await checkFixedCostExists(userId, costData.nome_custo, costId);
        if (exists) throw new Error(`Um custo com o nome "${costData.nome_custo}" já existe.`);
    }

    const { data, error } = await supabase
        .from('custos_fixos')
        .update(costData)
        .eq('id', costId)
        .eq('user_id', userId)
        .select()
        .single();
    if (error) throw error;
    return data;
};

export const deleteFixedCostDb = async (userId, costId) => {
    const { error } = await supabase
        .from('custos_fixos')
        .delete()
        .eq('id', costId)
        .eq('user_id', userId);
    if (error) throw error;
};