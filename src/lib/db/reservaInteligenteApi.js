import { supabase } from '@/lib/supabaseClient';

export const checkSavingGoalExists = async (userId, goalName, goalId = null) => {
    let query = supabase
        .from('metas_reserva')
        .select('id', { count: 'exact' })
        .eq('user_id', userId)
        .eq('nome_meta', goalName);

    if (goalId) {
        query = query.neq('id', goalId);
    }
    
    const { count, error } = await query;
    if (error) throw error;
    return count > 0;
};

export const addSavingGoalDb = async (userId, goalData) => {
    const exists = await checkSavingGoalExists(userId, goalData.nome_meta);
    if (exists) throw new Error(`Uma meta com o nome "${goalData.nome_meta}" já existe.`);

    const { data, error } = await supabase
        .from('metas_reserva')
        .insert([{ ...goalData, user_id: userId, saldo_atual: 0 }])
        .select()
        .single();
    if (error) throw error;
    return data;
};

export const updateSavingGoalDb = async (userId, goalId, goalData) => {
    if (goalData.nome_meta) {
        const exists = await checkSavingGoalExists(userId, goalData.nome_meta, goalId);
        if (exists) throw new Error(`Uma meta com o nome "${goalData.nome_meta}" já existe.`);
    }

    const { data, error } = await supabase
        .from('metas_reserva')
        .update(goalData)
        .eq('id', goalId)
        .eq('user_id', userId)
        .select()
        .single();
    if (error) throw error;
    return data;
};

export const deleteSavingGoalDb = async (userId, goalId) => {
    const { error } = await supabase
        .from('metas_reserva')
        .delete()
        .eq('id', goalId)
        .eq('user_id', userId);
    if (error) throw error;
};