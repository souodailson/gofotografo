import { useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  addSupplier as addSupplierDb, 
  updateSupplier as updateSupplierDb, 
  deleteSupplier as deleteSupplierDb 
} from '@/lib/db/suppliersApi.js';

export const useSupplierManager = (user, isUserActive, suppliers, setSuppliers, handleError) => {

  const addSupplier = useCallback(async (supplierData) => {
    if (!user || !isUserActive()) {
      handleError({ message: "Usuário não autenticado ou trial expirado" }, "adicionar fornecedor");
      return null;
    }
    try {
      const data = await addSupplierDb(supabase, user.id, supplierData);
      const updatedSuppliers = [data, ...suppliers];
      setSuppliers(updatedSuppliers);
      return data;
    } catch (error) {
      handleError(error, 'adicionar fornecedor');
      throw error;
    }
  }, [user, isUserActive, suppliers, setSuppliers, handleError]);
  
  const updateSupplier = useCallback(async (id, updates) => {
    if (!user || !isUserActive()) {
      handleError({ message: "Usuário não autenticado ou trial expirado" }, "atualizar fornecedor");
      return;
    }
    try {
      const data = await updateSupplierDb(supabase, user.id, id, updates);
      const updatedSuppliers = suppliers.map(s => (s.id === id ? data : s));
      setSuppliers(updatedSuppliers);
    } catch (error) {
      handleError(error, 'atualizar fornecedor');
      throw error;
    }
  }, [user, isUserActive, suppliers, setSuppliers, handleError]);

  const deleteSupplier = useCallback(async (id) => {
    if (!user || !isUserActive()) {
      handleError({ message: "Usuário não autenticado ou trial expirado" }, "remover fornecedor");
      return;
    }
    try {
      await deleteSupplierDb(supabase, user.id, id);
      const updatedSuppliers = suppliers.filter(s => s.id !== id);
      setSuppliers(updatedSuppliers);
    } catch (error) {
      handleError(error, 'remover fornecedor');
    }
  }, [user, isUserActive, suppliers, setSuppliers, handleError]);

  const getSupplierById = useCallback((id) => {
    return suppliers.find(supplier => supplier.id === id);
  }, [suppliers]);

  return { addSupplier, updateSupplier, deleteSupplier, getSupplierById };
};