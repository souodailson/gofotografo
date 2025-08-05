import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { handleSupabaseError } from '@/lib/dataUtils';
import { calculateFinancialSummary } from '@/lib/financialUtils';

export const useDataManagement = (user, settings, toast) => {
  const [state, setState] = useState({
    clients: [],
    workflowCards: [],
    financialData: { transactions: [], income: 0, expenses: 0, balance: 0, potentialLeadValue: 0 },
    servicePackages: [],
    equipments: [],
    maintenances: [],
    fixedCosts: [],
    pricedServices: [],
    savingGoals: [],
    pendingReserveAllocations: [],
    upcomingReminders: [],
    clientContracts: [],
    clientOrcamentos: [],
    availabilitySlots: [],
    proposals: [],
    contratos: [],
    blogPosts: [],
    featureFlags: {},
    affiliateData: { referrals: [], commissions: [] },
    wallets: [],
    loadingData: true,
    initialLoadCompleted: false,
  });

  const setDataState = useCallback((updater) => {
    setState(prevState => {
      if (typeof updater === 'function') {
        return updater(prevState);
      }
      return { ...prevState, ...updater };
    });
  }, []);

  const clearLocalData = useCallback(() => {
    setState({
      clients: [],
      workflowCards: [],
      financialData: { transactions: [], income: 0, expenses: 0, balance: 0, potentialLeadValue: 0 },
      servicePackages: [],
      equipments: [],
      maintenances: [],
      fixedCosts: [],
      pricedServices: [],
      savingGoals: [],
      pendingReserveAllocations: [],
      upcomingReminders: [],
      clientContracts: [],
      clientOrcamentos: [],
      availabilitySlots: [],
      proposals: [],
      contratos: [],
      blogPosts: [],
      featureFlags: {},
      affiliateData: { referrals: [], commissions: [] },
      wallets: [],
      loadingData: false,
      initialLoadCompleted: false,
    });
  }, []);

  const refreshData = useCallback(async (dataType = 'all') => {
    if (!user) return;
    
    const fetchMap = {
      clients: () => supabase.from('clients').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      workflow_cards: () => supabase.from('workflow_cards').select('*').eq('user_id', user.id).order('order', { ascending: true }),
      transacoes: () => supabase.from('transacoes').select('*').eq('user_id', user.id).order('data', { ascending: false }),
      service_packages: () => supabase.from('service_packages').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      equipamentos: () => supabase.from('equipamentos').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      manutencoes: () => supabase.from('manutencoes').select('*').eq('user_id', user.id).order('data_manutencao', { ascending: false }),
      custos_fixos: () => supabase.from('custos_fixos').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      servicos_precificados: () => supabase.from('servicos_precificados').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      metas_reserva: () => supabase.from('metas_reserva').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      availability_slots: () => supabase.from('availability_slots').select('*').eq('user_id', user.id),
      propostas: () => supabase.from('propostas').select('*').eq('user_id', user.id).order('updated_at', { ascending: false }),
      contratos: () => supabase.from('contratosgerados').select('*').eq('id_fotografo', user.id).order('data_geracao', { ascending: false }),
      wallets: () => supabase.from('wallets').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      feature_flags: () => supabase.from('feature_flags').select('*'),
      referrals: () => supabase.from('referrals').select('*').eq('referrer_id', user.id),
      commissions: () => supabase.from('commissions').select('*').eq('referrer_id', user.id),
    };

    const dataToFetch = dataType === 'all' ? Object.keys(fetchMap) : [dataType];
    
    try {
      const results = await Promise.all(dataToFetch.map((key) => {
        const fetchFunction = fetchMap[key];
        if (typeof fetchFunction === 'function') {
          return fetchFunction();
        } else {
          console.warn(`fetchMap[${key}] não é uma função. Pulando.`);
          return Promise.resolve({ data: [], error: null }); // Retorna um Promise resolvido para não quebrar o Promise.all
        }
      }));
      
      const errors = results.map((res, i) => res.error ? { key: dataToFetch[i], error: res.error } : null).filter(Boolean);
      
      if (errors.length > 0) {
        errors.forEach(({ key, error }) => handleSupabaseError(error, `carregar ${key}`, toast));
        return;
      }

      const newStateUpdates = {};
      results.forEach((res, i) => {
        const key = dataToFetch[i];
        switch (key) {
          case 'clients': newStateUpdates.clients = res.data; break;
          case 'workflow_cards': newStateUpdates.workflowCards = res.data; break;
          case 'transacoes': newStateUpdates.financialData = { ...calculateFinancialSummary(res.data), transactions: res.data }; break;
          case 'service_packages': newStateUpdates.servicePackages = res.data; break;
          case 'equipamentos': newStateUpdates.equipments = res.data; break;
          case 'manutencoes': newStateUpdates.maintenances = res.data; break;
          case 'custos_fixos': newStateUpdates.fixedCosts = res.data; break;
          case 'servicos_precificados': newStateUpdates.pricedServices = res.data; break;
          case 'metas_reserva': newStateUpdates.savingGoals = res.data; break;
          case 'availability_slots': newStateUpdates.availabilitySlots = res.data; break;
          case 'propostas': newStateUpdates.proposals = res.data; break;
          case 'contratos': newStateUpdates.contratos = res.data; break;
          case 'wallets': newStateUpdates.wallets = res.data; break;
          case 'feature_flags': newStateUpdates.featureFlags = res.data.reduce((acc, flag) => ({ ...acc, [flag.nome_funcionalidade]: flag.esta_ativa }), {}); break;
          case 'referrals': newStateUpdates.affiliateData = { ...state.affiliateData, referrals: res.data }; break;
          case 'commissions': newStateUpdates.affiliateData = { ...state.affiliateData, commissions: res.data }; break;
        }
      });
      
      if (newStateUpdates.workflowCards) {
        const potentialLeadValue = (newStateUpdates.workflowCards || [])
          .filter(card => card.status === 'novo-lead' || card.status === 'proposta-enviada')
          .reduce((sum, card) => sum + (Number(card.value) || 0), 0);
        newStateUpdates.financialData = { ...(newStateUpdates.financialData || state.financialData), potentialLeadValue };
      }

      setDataState(prev => ({ ...prev, ...newStateUpdates }));

    } catch (error) {
      handleSupabaseError(error, 'refresh data', toast);
    }
  }, [user, toast, state.financialData, state.affiliateData]);

  const loadInitialData = useCallback(async (currentUser) => {
    if (!currentUser) return;
    setDataState({ loadingData: true });
    try {
      const [
        clientsRes, workflowCardsRes, transactionsRes, servicePackagesRes,
        equipmentsRes, maintenancesRes, fixedCostsRes, pricedServicesRes,
        savingGoalsRes, availabilitySlotsRes, proposalsRes, contratosRes, walletsRes,
        featureFlagsRes, referralsRes, commissionsRes
      ] = await Promise.all([
        supabase.from('clients').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }),
        supabase.from('workflow_cards').select('*').eq('user_id', currentUser.id).order('order', { ascending: true }),
        supabase.from('transacoes').select('*').eq('user_id', currentUser.id).order('data', { ascending: false }),
        supabase.from('service_packages').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }),
        supabase.from('equipamentos').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }),
        supabase.from('manutencoes').select('*').eq('user_id', currentUser.id).order('data_manutencao', { ascending: false }),
        supabase.from('custos_fixos').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }),
        supabase.from('servicos_precificados').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }),
        supabase.from('metas_reserva').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }),
        supabase.from('availability_slots').select('*').eq('user_id', currentUser.id),
        supabase.from('propostas').select('*').eq('user_id', currentUser.id).order('updated_at', { ascending: false }),
        supabase.from('contratosgerados').select('*').eq('id_fotografo', currentUser.id).order('data_geracao', { ascending: false }),
        supabase.from('wallets').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }),
        supabase.from('feature_flags').select('*'),
        supabase.from('referrals').select('*').eq('referrer_id', currentUser.id),
        supabase.from('commissions').select('*').eq('referrer_id', currentUser.id),
      ]);

      const errors = [
        clientsRes.error, workflowCardsRes.error, transactionsRes.error, servicePackagesRes.error,
        equipmentsRes.error, maintenancesRes.error, fixedCostsRes.error, pricedServicesRes.error,
        savingGoalsRes.error, availabilitySlotsRes.error, proposalsRes.error, contratosRes.error, walletsRes.error,
        featureFlagsRes.error, referralsRes.error, commissionsRes.error
      ].filter(Boolean);

      if (errors.length > 0) {
        errors.forEach(error => handleSupabaseError(error, 'carregar dados iniciais', toast));
        setDataState({ loadingData: false });
        return;
      }

      const financialSummary = calculateFinancialSummary(transactionsRes.data);
      const potentialLeadValue = (workflowCardsRes.data || [])
        .filter(card => card.status === 'novo-lead' || card.status === 'proposta-enviada')
        .reduce((sum, card) => sum + (Number(card.value) || 0), 0);

      setDataState({
        clients: clientsRes.data,
        workflowCards: workflowCardsRes.data,
        financialData: { ...financialSummary, transactions: transactionsRes.data, potentialLeadValue },
        servicePackages: servicePackagesRes.data,
        equipments: equipmentsRes.data,
        maintenances: maintenancesRes.data,
        fixedCosts: fixedCostsRes.data,
        pricedServices: pricedServicesRes.data,
        savingGoals: savingGoalsRes.data,
        availabilitySlots: availabilitySlotsRes.data,
        proposals: proposalsRes.data,
        contratos: contratosRes.data,
        wallets: walletsRes.data,
        featureFlags: featureFlagsRes.data.reduce((acc, flag) => ({ ...acc, [flag.nome_funcionalidade]: flag.esta_ativa }), {}),
        affiliateData: { referrals: referralsRes.data, commissions: commissionsRes.data },
        loadingData: false,
        initialLoadCompleted: true,
      });

    } catch (error) {
      handleSupabaseError(error, 'carregar dados iniciais', toast);
      setDataState({ loadingData: false });
    }
  }, [toast]);

  return {
    ...state,
    setDataState,
    clearLocalData,
    loadInitialData,
    refreshData,
    setInitialLoadCompleted: (completed) => setDataState({ initialLoadCompleted: completed }),
  };
};