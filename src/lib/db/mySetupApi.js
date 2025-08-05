import { supabase } from '@/lib/supabaseClient';

export const checkEquipmentExists = async (userId, equipmentName, equipmentId = null) => {
    let query = supabase
        .from('equipamentos')
        .select('id', { count: 'exact' })
        .eq('user_id', userId)
        .eq('nome_equipamento', equipmentName);

    if (equipmentId) {
        query = query.neq('id', equipmentId);
    }
    
    const { count, error } = await query;
    if (error) throw error;
    return count > 0;
};


export const addEquipmentDb = async (userId, equipmentData) => {
    const exists = await checkEquipmentExists(userId, equipmentData.nome_equipamento);
    if (exists) throw new Error(`Um equipamento com o nome "${equipmentData.nome_equipamento}" já existe.`);

    const { data, error } = await supabase
        .from('equipamentos')
        .insert([{ ...equipmentData, user_id: userId }])
        .select()
        .single();
    if (error) throw error;
    return data;
};

export const updateEquipmentDb = async (userId, equipmentId, equipmentData) => {
    if (equipmentData.nome_equipamento) {
        const exists = await checkEquipmentExists(userId, equipmentData.nome_equipamento, equipmentId);
        if (exists) throw new Error(`Um equipamento com o nome "${equipmentData.nome_equipamento}" já existe.`);
    }

    const { data, error } = await supabase
        .from('equipamentos')
        .update(equipmentData)
        .eq('id', equipmentId)
        .eq('user_id', userId)
        .select()
        .single();
    if (error) throw error;
    return data;
};

export const deleteEquipmentDb = async (userId, equipmentId) => {
    const { error } = await supabase
        .from('equipamentos')
        .delete()
        .eq('id', equipmentId)
        .eq('user_id', userId);
    if (error) throw error;
};

export const addMaintenanceDb = async (userId, maintenanceData) => {
    const { data, error } = await supabase
      .from('manutencoes')
      .insert([{ ...maintenanceData, user_id: userId }])
      .select()
      .single();
    if (error) throw error;
    return data; 
};