import { supabase } from '@/lib/supabaseClient'; // Not strictly needed here if supabaseClient is passed
import { initialSettingsData } from '@/lib/dataUtils';

export const saveSettings = async (supabaseClient, userId, newSettingsChanges, currentLocalSettings, userNameFallback) => {
  const { data: existingSettingsRecord, error: fetchError } = await supabaseClient
    .from('settings')
    .select('*') 
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();

  if (fetchError && fetchError.code !== 'PGRST116') { 
    throw fetchError;
  }

  const settingsForDb = {};

  if (existingSettingsRecord) {
    // For updates, only apply changes present in newSettingsChanges
    for (const key in newSettingsChanges) {
      if (newSettingsChanges.hasOwnProperty(key)) {
        settingsForDb[key] = newSettingsChanges[key];
      }
    }
    // Ensure essential fallback values if they somehow get wiped by form
    settingsForDb.user_name = newSettingsChanges.user_name || existingSettingsRecord.user_name || userNameFallback;
    settingsForDb.contact_email = newSettingsChanges.contact_email || existingSettingsRecord.contact_email || (supabaseClient.auth.user && supabaseClient.auth.user().email) || userNameFallback;

  } else {
    // For inserts, merge with initialSettingsData and ensure critical fields
    const mergedInitial = { 
      ...initialSettingsData, 
      ...(currentLocalSettings || {}), 
      ...newSettingsChanges 
    };
    for (const key in initialSettingsData) { // Iterate over schema keys to ensure structure
      if (mergedInitial.hasOwnProperty(key)) {
        settingsForDb[key] = mergedInitial[key];
      }
    }
    settingsForDb.user_id = userId;
    settingsForDb.user_name = mergedInitial.user_name || userNameFallback;
    settingsForDb.contact_email = mergedInitial.contact_email || (supabaseClient.auth.user && supabaseClient.auth.user().email) || userNameFallback;
    // Ensure plan_status and trial_ends_at are set for new users if not provided
    settingsForDb.plan_status = mergedInitial.plan_status || 'TRIAL';
    if (settingsForDb.plan_status === 'TRIAL' && !mergedInitial.trial_ends_at) {
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      settingsForDb.trial_ends_at = sevenDaysFromNow.toISOString();
    }
    settingsForDb.took_initial_tour = mergedInitial.took_initial_tour || false;
  }
  
  // Remove undefined keys before sending to Supabase, but only for update
  if (existingSettingsRecord) {
    Object.keys(settingsForDb).forEach(key => {
      if (settingsForDb[key] === undefined) {
        delete settingsForDb[key]; 
      }
    });
  }


  let data, error;
  if (existingSettingsRecord && existingSettingsRecord.id) {
      // CRITICAL: Do not include plan_status, trial_ends_at, etc. if they are not in newSettingsChanges
      // The current logic in settingsForDb already handles only applying changed fields for updates.
      if (Object.keys(settingsForDb).length === 0) {
        return existingSettingsRecord; // No actual changes to save
      }
      ({ data, error } = await supabaseClient
          .from('settings')
          .update({ ...settingsForDb, updated_at: new Date().toISOString() })
          .eq('id', existingSettingsRecord.id)
          .eq('user_id', userId)
          .select()
          .single());
  } else {
      ({ data, error } = await supabaseClient
          .from('settings')
          .insert([{ ...settingsForDb, user_id: userId, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
          .select()
          .single());
  }
  
  if (error) throw error;
  return data;
};