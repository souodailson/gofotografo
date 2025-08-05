import { supabase } from '@/lib/supabaseClient';

        export const addClient = async (supabaseClient, userId, client) => {
          if (client.name) {
              const { count, error: checkError } = await supabaseClient
                .from('clients')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('name', client.name);

              if (checkError) {
                throw new Error(`Erro ao verificar cliente existente: ${checkError.message}`);
              }

              if (count > 0) {
                throw new Error(`Um cliente com o nome "${client.name}" já existe.`);
              }
          }

          const { data, error } = await supabaseClient
            .from('clients')
            .insert([{ ...client, user_id: userId, created_at: new Date().toISOString() }])
            .select()
            .single();
          if (error) throw error;
          return data;
        };

        export const updateClient = async (supabaseClient, userId, id, updates) => {
          if (updates.name) {
            const { count, error: checkError } = await supabaseClient
              .from('clients')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', userId)
              .eq('name', updates.name)
              .neq('id', id);

            if (checkError) {
              throw new Error(`Erro ao verificar cliente existente: ${checkError.message}`);
            }

            if (count > 0) {
              throw new Error(`Um cliente com o nome "${updates.name}" já existe.`);
            }
          }

          const { data, error } = await supabaseClient
            .from('clients')
            .update(updates)
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();
          if (error) throw error;
          return data;
        };

        export const deleteClient = async (supabaseClient, userId, id) => {
          const { error } = await supabaseClient
            .from('clients')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);
          if (error) throw error;
        };