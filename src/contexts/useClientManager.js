import { useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  addClient as addClientDb, 
  updateClient as updateClientDb, 
  deleteClient as deleteClientDb 
} from '@/lib/db/clientsApi.js';

export const useClientManager = (user, isUserActive, clients, setClients, handleError, generateUpcomingReminders) => {

  const addClient = useCallback(async (clientData) => {
    if (!user || !isUserActive()) {
      handleError({ message: "Usuário não autenticado ou trial expirado" }, "adicionar cliente");
      return null;
    }
    try {
      const data = await addClientDb(supabase, user.id, clientData);
      const updatedClients = [data, ...clients];
      setClients(updatedClients);
      generateUpcomingReminders(updatedClients);
      return data;
    } catch (error) {
      handleError(error, 'adicionar cliente');
      throw error;
    }
  }, [user, isUserActive, clients, setClients, handleError, generateUpcomingReminders]);
  
  const updateClient = useCallback(async (id, updates) => {
    if (!user || !isUserActive()) {
      handleError({ message: "Usuário não autenticado ou trial expirado" }, "atualizar cliente");
      return;
    }
    try {
      const data = await updateClientDb(supabase, user.id, id, updates);
      const updatedClients = clients.map(c => (c.id === id ? data : c));
      setClients(updatedClients);
      generateUpcomingReminders(updatedClients);
    } catch (error) {
      handleError(error, 'atualizar cliente');
      throw error;
    }
  }, [user, isUserActive, clients, setClients, handleError, generateUpcomingReminders]);

  const deleteClient = useCallback(async (id) => {
    if (!user || !isUserActive()) {
      handleError({ message: "Usuário não autenticado ou trial expirado" }, "remover cliente");
      return;
    }
    try {
      await deleteClientDb(supabase, user.id, id);
      const updatedClients = clients.filter(c => c.id !== id);
      setClients(updatedClients);
      generateUpcomingReminders(updatedClients);
    } catch (error) {
      handleError(error, 'remover cliente');
    }
  }, [user, isUserActive, clients, setClients, handleError, generateUpcomingReminders]);

  const getClientById = useCallback((id) => {
    return clients.find(client => client.id === id);
  }, [clients]);

  return { addClient, updateClient, deleteClient, getClientById };
};