import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from './authContext.jsx';
import { useDataManagement } from './useDataManagement';
import { useClientManager } from './useClientManager';
import { useAffiliateManager } from './useAffiliateManager';
import { updateWorkflowCard as updateWorkflowCardDb, deleteWorkflowCard as deleteWorkflowCardDb, addCommentToWorkflowCard as addCommentDb } from '@/lib/db/workflowApi.js';
import { addTransaction as addTransactionDb, updateTransaction as updateTransactionDb, deleteTransaction as deleteTransactionDb, getTransactionsByWorkflowId } from '@/lib/db/financialApi.js';
import { addServicePackage as addServicePackageDb, updateServicePackage as updateServicePackageDb, deleteServicePackage as deleteServicePackageDb } from '@/lib/db/servicePackagesApi.js';
import { getOrcamentosByClientId, addOrcamento as addOrcamentoDb, updateOrcamento as updateOrcamentoDb, deleteOrcamento as deleteOrcamentoDb } from '@/lib/db/orcamentosApi.js';
import { parseISO, format as formatDateFns, addDays } from 'date-fns';
import { addEquipmentDb, updateEquipmentDb, deleteEquipmentDb, addMaintenanceDb } from '@/lib/db/mySetupApi';
import { addPricedServiceDb, addFixedCostDb, updateFixedCostDb, deleteFixedCostDb } from '@/lib/db/precifiqueApi';
import { addSavingGoalDb, updateSavingGoalDb, deleteSavingGoalDb } from '@/lib/db/reservaInteligenteApi';
import { handleSupabaseError, initialSettingsData as defaultInitialSettings, initialWorkflowColumnsData } from '@/lib/dataUtils';
import { calculateFinancialSummary } from '@/lib/financialUtils';
import { getInitialCardConfig } from '@/lib/dashboard/layoutConfig';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};

export const DataProvider = ({ children }) => {
  const { toast } = useToast();
  const { user, session, settings, loadingAuth, setSettings } = useAuth();
  
  const {
    clients, workflowCards, financialData, servicePackages, equipments, maintenances, 
    fixedCosts, pricedServices, savingGoals, pendingReserveAllocations, upcomingReminders,
    clientContracts, clientOrcamentos, availabilitySlots, proposals, blogPosts,
    featureFlags, affiliateData, loadingData, initialLoadCompleted, wallets, contratos, setDataState,
    clearLocalData, loadInitialData, refreshData, setInitialLoadCompleted
  } = useDataManagement(user, settings, toast);

  const [planStatus, setPlanStatus] = useState(null);
  const [trialDaysRemaining, setTrialDaysRemaining] = useState(0);

  const handleError = useCallback((error, context) => {
    handleSupabaseError(error, context, toast);
  }, [toast]);

  useEffect(() => {
    if (!loadingAuth && !user) {
      clearLocalData();
    }
  }, [loadingAuth, user, clearLocalData]);
  
  useEffect(() => {
    if (user && !initialLoadCompleted) {
      loadInitialData(user);
    }
  }, [user, initialLoadCompleted, loadInitialData]);

  const updateTrialStatus = useCallback((currentSettings) => {
    if (currentSettings?.plan_status) {
      setPlanStatus(currentSettings.plan_status);
      setTrialDaysRemaining(999);
    } else {
      setPlanStatus('FREE');
      setTrialDaysRemaining(999);
    }
  }, []);

  useEffect(() => {
    updateTrialStatus(settings);
  }, [settings, updateTrialStatus]);

  const isUserActive = useCallback(() => true, []);

  const getStatusLabel = useCallback((statusKey) => {
    const defaultLabels = { 'agendado': 'Agendado', 'novo-lead': 'Novo Lead', 'proposta-enviada': 'Proposta Enviada', 'em-andamento': 'Em Andamento', 'concluido': 'Concluído' };
    const customLabels = settings?.workflow_columns?.reduce((acc, col) => ({ ...acc, [col.id]: col.title }), {}) || {};
    return customLabels[statusKey] || defaultLabels[statusKey] || statusKey;
  }, [settings?.workflow_columns]);

  const { addClient, updateClient, deleteClient, getClientById } = useClientManager(user, isUserActive, clients, (newClients) => setDataState(p => ({...p, clients: newClients})), handleError, (reminders) => setDataState(p => ({...p, upcomingReminders: reminders})));
  
  const { handleNewSubscription } = useAffiliateManager(user, settings);

  const calculatePotentialLeadValue = (cards) => {
    return (cards || [])
      .filter(card => card.status === 'novo-lead' || card.status === 'proposta-enviada')
      .reduce((sum, card) => sum + (Number(card.value) || 0), 0);
  };
  
  const isFeatureEnabled = useCallback((featureName) => {
    if (settings?.role === 'ADMIN') return true;
    const userOverride = settings?.feature_overrides?.[featureName];
    if (typeof userOverride === 'boolean') return userOverride;
    return featureFlags[featureName] ?? false;
  }, [featureFlags, settings]);
  
  const getWalletBalance = useCallback((walletId) => {
    const wallet = (wallets || []).find(w => w.id === walletId);
    if (!wallet) return 0;
    
    const transactionsForWallet = (financialData?.transactions || [])
      .filter(t => t.wallet_id === walletId && (t.status === 'PAGO' || (t.status === 'AGUARDANDO_LIBERACAO' && new Date(t.release_date) <= new Date())));
      
    const balance = transactionsForWallet.reduce((sum, t) => {
      if (t.tipo === 'ENTRADA') return sum + Number(t.valor);
      if (t.tipo === 'SAIDA') return sum - Number(t.valor);
      return sum;
    }, Number(wallet.initial_balance) || 0);

    return balance;
  }, [wallets, financialData?.transactions]);

  const initialCardConfigMemo = useMemo(() => {
    return getInitialCardConfig(() => {}, wallets);
  }, [wallets]);


  const deleteProposal = async (idToDelete) => {
    if (!user) { handleError({ message: "Usuário não autenticado." }, "deletar proposta"); return; }
    const { error } = await supabase.from('propostas').delete().eq('id', idToDelete).eq('user_id', user.id);
    if (error) { handleError(error, "deletar proposta"); } else { toast({ title: "Proposta deletada com sucesso!" }); await refreshData('propostas'); }
  };

  const addWorkflowCard = async (card) => {
    if (!user || !isUserActive() || !settings) throw new Error("Pré-condição falhou para adicionar card.");
    try {
      const { data, error } = await supabase.functions.invoke('criar-agendamento', { body: JSON.stringify({ cardData: card, userName: settings.user_name || user.email }) });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      const { newCard } = data;
      setDataState(prev => {
        const newWorkflowCards = [...prev.workflowCards, newCard].sort((a,b) => (a.order || 0) - (b.order || 0));
        return {...prev, workflowCards: newWorkflowCards, financialData: {...prev.financialData, potentialLeadValue: calculatePotentialLeadValue(newWorkflowCards)}};
      });
      return newCard;
    } catch (error) { handleError(error, 'criar agendamento'); throw error; }
  };
  
  const updateWorkflowCard = async (id, updates) => {
    if (!user || !isUserActive()) return null;
    try {
      const currentCard = workflowCards.find(c => c.id === id);
      if (!currentCard) { await refreshData('workflow_cards'); return null; }
      const updatedCard = await updateWorkflowCardDb(supabase, user.id, id, { ...updates }, currentCard, getStatusLabel, settings.user_name || user.email);
      setDataState(prev => {
        const newCards = prev.workflowCards.map(c => c.id === id ? updatedCard : c).sort((a, b) => (a.order || 0) - (b.order || 0));
        return { ...prev, workflowCards: newCards, financialData: { ...prev.financialData, potentialLeadValue: calculatePotentialLeadValue(newCards)}};
      });
      if (updates.value !== undefined || updates.payment_type !== undefined || updates.entry_paid !== undefined) {
        const associatedTransactions = await getTransactionsByWorkflowId(supabase, id);
        const firstTransaction = associatedTransactions.length > 0 ? associatedTransactions[0] : null;
        const transactionPayload = { descricao: updatedCard.title || "Lançamento", valor: updatedCard.value || 0, data: updatedCard.first_installment_date || updatedCard.date || new Date().toISOString().split('T')[0], data_vencimento: updatedCard.first_installment_date || updatedCard.date, status: updatedCard.entry_paid ? 'PAGO' : 'PENDENTE', tipo: 'ENTRADA', metodo_pagamento: updatedCard.payment_method || null, trabalho_id: id, cliente_id: updatedCard.client_id };
        if (firstTransaction) await updateTransaction(firstTransaction.id, transactionPayload);
        else if (updatedCard.value > 0) await addTransaction(transactionPayload);
        await refreshData('transacoes');
      }
      return updatedCard;
    } catch (error) {
      if (error.message?.includes("PGRST204")) { await refreshData('workflow_cards'); return null; }
      handleError(error, 'atualizar card'); return null;
    }
  };

  const deleteWorkflowCard = async (id) => {
    if (!user || !isUserActive()) return;
    try {
      await deleteWorkflowCardDb(supabase, user.id, id);
      setDataState(prev => {
        const newCards = prev.workflowCards.filter(c => c.id !== id);
        return { ...prev, workflowCards: newCards, financialData: { ...prev.financialData, potentialLeadValue: calculatePotentialLeadValue(newCards)}};
      });
    } catch (error) { handleError(error, 'remover card'); }
  };
  
  const addComment = async (cardId, commentText) => {
    if (!user || !isUserActive()) return null;
    try {
      const card = workflowCards.find(c => c.id === cardId);
      const data = await addCommentDb(supabase, user.id, cardId, commentText, card?.comments, settings.user_name || user.email, user.user_metadata?.avatar_url);
      setDataState(prev => ({...prev, workflowCards: prev.workflowCards.map(c => (c.id === cardId ? data : c))}));
      return data;
    } catch (error) { handleError(error, 'adicionar comentário'); throw error; }
  };
  
  const addTransaction = async (transaction) => {
    if (!user || !isUserActive()) throw new Error("Operação não permitida");
    try {
      let finalTransaction = { ...transaction };
      if (transaction.wallet_id && transaction.status === 'PAGO') {
          const wallet = wallets.find(w => w.id === transaction.wallet_id);
          if (wallet && wallet.is_gateway && wallet.gateway_config && transaction.tipo === 'ENTRADA') {
              const feePercentage = wallet.gateway_config.fee || 0;
              const releaseDays = wallet.gateway_config.release_days || 0;
              
              const originalValue = parseFloat(transaction.valor);
              const feeValue = (originalValue * feePercentage) / 100;
              const netValue = originalValue - feeValue;
              
              if (releaseDays > 1) {
                finalTransaction = {
                    ...finalTransaction,
                    original_value: originalValue,
                    fee_value: feeValue,
                    valor: netValue,
                    status: 'AGUARDANDO_LIBERACAO',
                    release_date: formatDateFns(addDays(new Date(transaction.data), releaseDays), 'yyyy-MM-dd'),
                };
              } else {
                finalTransaction = {
                    ...finalTransaction,
                    original_value: originalValue,
                    fee_value: feeValue,
                    valor: netValue,
                    status: 'PAGO',
                    release_date: null,
                };
              }
          }
      }

      const data = await addTransactionDb(supabase, user.id, finalTransaction);
      setDataState(prev => {
        const newTransactions = [data, ...prev.financialData.transactions];
        return { ...prev, financialData: { ...calculateFinancialSummary(newTransactions), transactions: newTransactions, potentialLeadValue: prev.financialData.potentialLeadValue }};
      });
      return data;
    } catch (error) { handleError(error, 'adicionar transação'); throw error; }
  };

  const updateTransaction = async (id, updates) => {
    if (!user || !isUserActive()) throw new Error("Operação não permitida");
    try {
      const originalTransaction = financialData.transactions.find(t => t.id === id);
      const data = await updateTransactionDb(supabase, user.id, id, updates);
      setDataState(prev => {
        const updatedTransactions = prev.financialData.transactions.map(t => (t.id === id ? data : t));
        return { ...prev, financialData: { ...calculateFinancialSummary(updatedTransactions), transactions: updatedTransactions, potentialLeadValue: prev.financialData.potentialLeadValue }};
      });
      if (data.status === 'PAGO' && originalTransaction?.status !== 'PAGO' && data.trabalho_id) {
        const workflowCard = workflowCards.find(card => card.id === data.trabalho_id);
        if (workflowCard?.service_package_id) {
          const pricedService = pricedServices.find(ps => ps.id === workflowCard.service_package_id);
          if (pricedService?.reserva_financeira_percentual > 0) {
            const reserveAmount = (data.valor * pricedService.reserva_financeira_percentual) / 100;
            setDataState(prev => ({ ...prev, pendingReserveAllocations: [...prev.pendingReserveAllocations, { transactionId: data.id, transactionValue: data.valor, serviceName: pricedService.nome_servico, reserveAmount, pricedServiceId: pricedService.id }]}));
          }
        }
      }
      return data;
    } catch (error) { handleError(error, 'atualizar transação'); throw error; }
  };

  const deleteTransaction = async (id) => {
    if (!user || !isUserActive()) throw new Error("Operação não permitida");
    try {
      await deleteTransactionDb(supabase, user.id, id);
      setDataState(prev => {
        const updatedTransactions = prev.financialData.transactions.filter(t => t.id !== id);
        return { ...prev, financialData: { ...calculateFinancialSummary(updatedTransactions), transactions: updatedTransactions, potentialLeadValue: prev.financialData.potentialLeadValue }};
      });
    } catch (error) { handleError(error, 'remover transação'); throw error; }
  };
  
  const addWallet = async (walletData) => {
    if (!user) throw new Error("Usuário não autenticado");
    const { data, error } = await supabase.from('wallets').insert([{ ...walletData, user_id: user.id }]).select().single();
    if (error) throw error;
    await refreshData('wallets');
    return data;
  };

  const updateWallet = async (id, updates) => {
    if (!user) throw new Error("Usuário não autenticado");
    const { data, error } = await supabase.from('wallets').update(updates).eq('id', id).eq('user_id', user.id).select().single();
    if (error) throw error;
    await refreshData('wallets');
    return data;
  };

  const deleteWallet = async (id) => {
    if (!user) throw new Error("Usuário não autenticado");
    const { error } = await supabase.from('wallets').delete().eq('id', id).eq('user_id', user.id);
    if (error) throw error;
    await refreshData('wallets');
  };
  
  const deleteAllUserData = async () => {
    if (!user) return false;
    try {
      const { error } = await supabase.functions.invoke('delete-user-account', { body: JSON.stringify({ user_id: user.id, full_delete: false }) });
      if (error) throw error;
      clearLocalData();
      const userNameFallback = user.user_metadata?.full_name || user.email;
      const defaultSettingsForUser = { ...defaultInitialSettings, user_id: user.id, user_name: userNameFallback, contact_email: user.email, profile_photo: user.user_metadata?.avatar_url || null, workflow_columns: initialWorkflowColumnsData };
      await setSettings(defaultSettingsForUser, true);
      refreshData();
      return true;
    } catch (error) { handleError(error, 'excluir dados'); return false; }
  };

  const deleteUserAccount = async () => {
    if (!user) return false;
    try {
      const { error } = await supabase.functions.invoke('delete-user-account', { body: JSON.stringify({ user_id: user.id, full_delete: true }) });
      if (error) throw error;
      await supabase.auth.signOut();
      clearLocalData();
      return true;
    } catch (error) { handleError(error, 'excluir conta'); return false; }
  };

  // ... other functions (addServicePackage, updateSavingGoal, etc.) ...
  const addServicePackage = async (pkg) => { if (!user || !isUserActive()) { throw new Error("Operação não permitida"); } try { const data = await addServicePackageDb(supabase, user.id, pkg); setDataState(prev => ({...prev, servicePackages: [data, ...prev.servicePackages].sort((a,b) => new Date(b.created_at) - new Date(a.created_at))})); return data; } catch (error) { handleError(error, 'adicionar pacote'); throw error; } };
  const updateServicePackage = async (id, updates) => { if (!user || !isUserActive()) { throw new Error("Operação não permitida"); } try { const data = await updateServicePackageDb(supabase, user.id, id, updates); setDataState(prev => ({...prev, servicePackages: prev.servicePackages.map(p => (p.id === id ? data : p)).sort((a,b) => new Date(b.created_at) - new Date(a.created_at))})); return data; } catch (error) { handleError(error, 'atualizar pacote'); throw error; } };
  const deleteServicePackage = async (id) => { if (!user || !isUserActive()) return; try { await deleteServicePackageDb(supabase, user.id, id); setDataState(prev => ({...prev, servicePackages: prev.servicePackages.filter(p => p.id !== id)})); } catch (error) { handleError(error, 'remover pacote'); } };
  const getServicePackageById = (id) => servicePackages.find(pkg => pkg.id === id);
  const getTransactionById = (id) => financialData.transactions.find(transaction => transaction.id === id);
  const getWorkflowCardById = (id) => workflowCards.find(card => card.id === id);
  const importGoogleEventsAsWorkflowCards = async (googleEvents) => {
    if (!user || !isUserActive()) return 0;
    let importedCount = 0;
    const newCards = googleEvents
      .filter(gEvent => !workflowCards.some(card => card.google_event_id === gEvent.id))
      .map(gEvent => {
        const startDate = gEvent.start?.date || (gEvent.start?.dateTime ? gEvent.start.dateTime.split('T')[0] : null);
        const startTime = gEvent.start?.dateTime ? formatDateFns(parseISO(gEvent.start.dateTime), 'HH:mm') : null;
        if (!startDate) return null;
        return { title: gEvent.summary || 'Evento', description: gEvent.description || '', date: startDate, time: startTime, status: 'agendado', google_event_id: gEvent.id, user_id: user.id };
      })
      .filter(Boolean);
    if (newCards.length > 0) {
      const { data: insertedCards, error } = await supabase.from('workflow_cards').insert(newCards).select();
      if (error) { handleError(error, 'importar eventos'); }
      else if (insertedCards) {
        importedCount = insertedCards.length;
        setDataState(prev => ({...prev, workflowCards: [...prev.workflowCards, ...insertedCards].sort((a,b)=>(a.order||0)-(b.order||0))}));
      }
    }
    return importedCount;
  };
  const addEquipment = async (data) => { if (!user || !isUserActive()) throw new Error("Operação não permitida"); try { const res = await addEquipmentDb(user.id, data); setDataState(p=>({...p, equipments:[res, ...p.equipments].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at))})); return res; } catch(e){handleError(e,'add equipment'); throw e;}};
  const updateEquipment = async (id, data) => { if (!user || !isUserActive()) throw new Error("Operação não permitida"); try { const res = await updateEquipmentDb(user.id, id, data); setDataState(p=>({...p, equipments:p.equipments.map(eq=>eq.id===id?res:eq).sort((a,b)=>new Date(b.created_at)-new Date(a.created_at))})); return res; } catch(e){handleError(e,'update equipment'); throw e;}};
  const deleteEquipment = async (id) => { if (!user || !isUserActive()) throw new Error("Operação não permitida"); try { await deleteEquipmentDb(user.id, id); setDataState(p=>({...p, equipments:p.equipments.filter(eq=>eq.id!==id)})); } catch(e){handleError(e,'delete equipment'); throw e;}};
  const addMaintenance = async (data) => { if (!user || !isUserActive()) throw new Error("Operação não permitida"); try { const res = await addMaintenanceDb(user.id, data); setDataState(p=>({...p, maintenances:[res, ...p.maintenances].sort((a,b)=>new Date(b.data_manutencao)-new Date(a.data_manutencao))})); return res; } catch(e){handleError(e,'add maintenance'); throw e;}};
  const getEquipmentMaintenances = (id) => maintenances.filter(m => m.equipamento_id === id).sort((a, b) => new Date(b.data_manutencao) - new Date(a.data_manutencao));
  const addFixedCost = async (data) => { if (!user || !isUserActive()) throw new Error("Operação não permitida"); try { const res = await addFixedCostDb(user.id, data); setDataState(p=>({...p, fixedCosts:[res, ...p.fixedCosts].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at))})); return res; } catch(e){handleError(e,'add fixed cost'); throw e;}};
  const updateFixedCost = async (id, data) => { if (!user || !isUserActive()) throw new Error("Operação não permitida"); try { const res = await updateFixedCostDb(user.id, id, data); setDataState(p=>({...p, fixedCosts:p.fixedCosts.map(c=>c.id===id?res:c).sort((a,b)=>new Date(b.created_at)-new Date(a.created_at))})); return res; } catch(e){handleError(e,'update fixed cost'); throw e;}};
  const deleteFixedCost = async (id) => { if (!user || !isUserActive()) throw new Error("Operação não permitida"); try { await deleteFixedCostDb(user.id, id); setDataState(p=>({...p, fixedCosts:p.fixedCosts.filter(c=>c.id!==id)})); } catch(e){handleError(e,'delete fixed cost'); throw e;}};
  const addPricedService = async (data) => { if (!user || !isUserActive()) throw new Error("Operação não permitida"); try { const res = await addPricedServiceDb(user.id, data); setDataState(p=>({...p, pricedServices:[res, ...p.pricedServices].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at))})); return res; } catch(e){handleError(e,'add priced service'); throw e;}};
  const addSavingGoal = async (data) => { if (!user || !isUserActive()) throw new Error("Operação não permitida"); try { const res = await addSavingGoalDb(user.id, data); await refreshData('metas_reserva'); return res; } catch(e){handleError(e,'add saving goal'); throw e;}};
  const updateSavingGoal = async (id, data) => { if (!user || !isUserActive()) throw new Error("Operação não permitida"); try { const res = await updateSavingGoalDb(user.id, id, data); setDataState(p=>({...p, savingGoals:p.savingGoals.map(g=>g.id===id?res:g).sort((a,b)=>new Date(b.created_at)-new Date(a.created_at))})); return res; } catch(e){handleError(e,'update saving goal'); throw e;}};
  const deleteSavingGoal = async (id) => { if (!user || !isUserActive()) throw new Error("Operação não permitida"); try { await deleteSavingGoalDb(user.id, id); setDataState(p=>({...p, savingGoals:p.savingGoals.filter(g=>g.id!==id)})); } catch(e){handleError(e,'delete saving goal'); throw e;}};
  const updateSavingGoalBalance = async (meta_id, amount, description, transactionType) => { if (!user || !isUserActive()) throw new Error("Operação não permitida"); try { const metaOriginal = savingGoals.find(g => g.id === meta_id); if (!metaOriginal) throw new Error("Meta não encontrada."); let novoSaldo; if (transactionType === 'deposit') novoSaldo = Number(metaOriginal.saldo_atual) + Number(amount); else if (transactionType === 'withdraw') { if (Number(metaOriginal.saldo_atual) < Number(amount)) throw new Error("Saldo insuficiente."); novoSaldo = Number(metaOriginal.saldo_atual) - Number(amount); } else throw new Error("Tipo de transação inválido."); const { data: updatedMeta, error } = await supabase.from('metas_reserva').update({ saldo_atual: novoSaldo, updated_at: new Date().toISOString() }).eq('id', meta_id).eq('user_id', user.id).select().single(); if (error) throw error; if (transactionType === 'withdraw') await addTransaction({ descricao: `Saque da meta: ${metaOriginal.nome_meta}${description ? ` - ${description}` : ''}`, valor: Number(amount), tipo: 'SAIDA', status: 'PAGO', data: new Date().toISOString().split('T')[0], category: 'Saque de Meta', user_id: user.id }); setDataState(p => ({...p, savingGoals:p.savingGoals.map(g=>g.id===meta_id?updatedMeta:g).sort((a,b)=>new Date(b.created_at)-new Date(a.created_at))})); return updatedMeta; } catch(e){handleError(e, `Erro ao ${transactionType==='deposit'?'depositar':'sacar'}`); throw e;}};
  const allocateToSavingGoal = async (meta_id, valor_alocar) => { if (!user || !isUserActive()) throw new Error("Operação não permitida"); try { const { data, error } = await supabase.functions.invoke('alocarReserva', { body: JSON.stringify({ meta_id, valor_alocar, user_id: user.id }) }); if (error) throw error; if (data.error) throw new Error(data.error); setDataState(p=>({...p, savingGoals:p.savingGoals.map(g=>g.id===meta_id?data:g).sort((a,b)=>new Date(b.created_at)-new Date(a.created_at))})); return data; } catch(e){handleError(e, 'alocar reserva'); throw e;}};
  const dismissPendingAllocation = (transactionId) => setDataState(p => ({...p, pendingReserveAllocations:p.pendingReserveAllocations.filter(pa => pa.transactionId !== transactionId)}));
  const refreshClientContracts = useCallback(async (currentClientId) => { if (!user || !currentClientId) return; try { const { data, error } = await supabase.from('contratos_clientes').select('*').eq('user_id', user.id).eq('client_id', currentClientId).order('created_at', { ascending: false }); if (error) throw error; setDataState(p=>({...p, clientContracts:data||[]})); } catch (e) { handleError(e, 'buscar contratos'); } }, [user, handleError]);
  const addClientContract = async (data) => { if (!user || !isUserActive()) throw new Error("Operação não permitida"); try { const { data: res, error } = await supabase.from('contratos_clientes').insert([data]).select().single(); if(error) throw error; setDataState(p=>({...p, clientContracts:[res, ...p.clientContracts].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at))})); return res; } catch(e){handleError(e, 'add contrato'); throw e;}};
  const deleteClientContract = async (id, path) => { if (!user || !isUserActive()) throw new Error("Operação não permitida"); try { const { error: dbError } = await supabase.from('contratos_clientes').delete().eq('id', id).eq('user_id', user.id); if(dbError) throw dbError; const { error: storageError } = await supabase.storage.from('contracts').remove([path]); if(storageError) console.warn("Erro ao deletar do storage:", storageError.message); setDataState(p=>({...p, clientContracts:p.clientContracts.filter(c=>c.id!==id)})); } catch(e){handleError(e, 'delete contrato'); throw e;}};
  const refreshClientOrcamentos = useCallback(async (currentClientId) => { if (!user || !currentClientId) return; try { const data = await getOrcamentosByClientId(supabase, user.id, currentClientId); setDataState(p=>({...p, clientOrcamentos:data})); } catch (e) { handleError(e, 'buscar orçamentos'); } }, [user, handleError]);
  const addOrcamento = async (data) => { if (!user || !isUserActive()) throw new Error("Operação não permitida"); try { const res = await addOrcamentoDb(supabase, data); setDataState(p=>({...p, clientOrcamentos:[res, ...p.clientOrcamentos].sort((a,b)=>new Date(b.data_envio)-new Date(a.data_envio))})); return res; } catch(e){handleError(e, 'add orçamento'); throw e;}};
  const updateOrcamento = async (id, data) => { if (!user || !isUserActive()) throw new Error("Operação não permitida"); try { const res = await updateOrcamentoDb(supabase, id, data, user.id); setDataState(p=>({...p, clientOrcamentos:p.clientOrcamentos.map(o=>o.id===id?res:o).sort((a,b)=>new Date(b.data_envio)-new Date(a.data_envio))})); return res; } catch(e){handleError(e, 'update orçamento'); throw e;}};
  const deleteOrcamento = async (id) => { if (!user || !isUserActive()) throw new Error("Operação não permitida"); try { await deleteOrcamentoDb(supabase, id, user.id); setDataState(p=>({...p, clientOrcamentos:p.clientOrcamentos.filter(o=>o.id!==id)})); } catch(e){handleError(e, 'delete orçamento'); throw e;}};

  const value = { clients, workflowCards, financialData, settings, loading: loadingData || loadingAuth, servicePackages, user, session, loadingAuth, refreshData, planStatus, trialDaysRemaining, isUserActive, equipments, maintenances, fixedCosts, pricedServices, savingGoals, pendingReserveAllocations, upcomingReminders, clientContracts, clientOrcamentos, availabilitySlots, proposals, blogPosts, featureFlags, isFeatureEnabled, affiliateData, wallets, contratos, getWalletBalance, addClient, updateClient, deleteClient, getClientById, addWorkflowCard, updateWorkflowCard, deleteWorkflowCard, addComment, getStatusLabel, importGoogleEventsAsWorkflowCards, getWorkflowCardById, addTransaction, updateTransaction, deleteTransaction, getTransactionById, setSettings, addServicePackage, updateServicePackage, deleteServicePackage, getServicePackageById, addEquipment, updateEquipment, deleteEquipment, addMaintenance, getEquipmentMaintenances, addFixedCost, updateFixedCost, deleteFixedCost, addPricedService, addSavingGoal, updateSavingGoal, deleteSavingGoal, updateSavingGoalBalance, allocateToSavingGoal, dismissPendingAllocation, refreshClientContracts, addClientContract, deleteClientContract, refreshClientOrcamentos, addOrcamento, updateOrcamento, deleteOrcamento, deleteAllUserData, deleteUserAccount, deleteProposal, handleNewSubscription, addWallet, updateWallet, deleteWallet, initialCardConfigMemo };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};