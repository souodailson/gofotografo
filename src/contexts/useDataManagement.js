import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { handleSupabaseError } from '@/lib/dataUtils';
import { calculateFinancialSummary } from '@/lib/financialUtils';

export const useDataManagement = (user, settings, toast) => {
  const [state, setState] = useState({
    clients: [],
    suppliers: [],
    workflowCards: [],
    financialData: { transactions: [], income: 0, expenses: 0, balance: 0, potentialLeadValue: 0 },
    servicePackages: [],
    products: [],
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
      suppliers: [],
      workflowCards: [],
      financialData: { transactions: [], income: 0, expenses: 0, balance: 0, potentialLeadValue: 0 },
      servicePackages: [],
      products: [],
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
      suppliers: () => supabase.from('suppliers').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      workflow_cards: () => supabase.from('workflow_cards').select('*').eq('user_id', user.id).order('order', { ascending: true }),
      transacoes: () => supabase.from('transacoes').select('*').eq('user_id', user.id).order('data', { ascending: false }),
      service_packages: () => supabase.from('service_packages').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      products: () => supabase.from('products').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
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
      system_features: () => supabase.from('system_features').select('*'),
      referrals: () => supabase.from('referrals').select('*').eq('referrer_id', user.id),
      commissions: () => supabase.from('commissions').select('*').eq('referrer_id', user.id),
    };

    const dataToFetch = dataType === 'all' ? Object.keys(fetchMap) : [dataType];
    
    try {
      const results = await Promise.all(dataToFetch.map(async (key) => {
        const fetchFunction = fetchMap[key];
        if (typeof fetchFunction === 'function') {
          try {
            return await fetchFunction();
          } catch (error) {
            console.warn(`Erro ao carregar ${key}:`, error);
            // Se for erro de tabela não existente, retorna dados vazios
            if (error.code === '42P01' || error.message?.includes('does not exist')) {
              return { data: [], error: null };
            }
            return { data: [], error: error };
          }
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
          case 'suppliers': newStateUpdates.suppliers = res.data; break;
          case 'workflow_cards': newStateUpdates.workflowCards = res.data; break;
          case 'transacoes': newStateUpdates.financialData = { ...calculateFinancialSummary(res.data), transactions: res.data }; break;
          case 'service_packages': newStateUpdates.servicePackages = res.data; break;
          case 'products': newStateUpdates.products = res.data; break;
          case 'equipamentos': newStateUpdates.equipments = res.data; break;
          case 'manutencoes': newStateUpdates.maintenances = res.data; break;
          case 'custos_fixos': newStateUpdates.fixedCosts = res.data; break;
          case 'servicos_precificados': newStateUpdates.pricedServices = res.data; break;
          case 'metas_reserva': newStateUpdates.savingGoals = res.data; break;
          case 'availability_slots': newStateUpdates.availabilitySlots = res.data; break;
          case 'propostas': newStateUpdates.proposals = res.data; break;
          case 'contratos': newStateUpdates.contratos = res.data; break;
          case 'wallets': newStateUpdates.wallets = res.data; break;
          case 'feature_flags': 
            newStateUpdates.featureFlags = { 
              ...(newStateUpdates.featureFlags || {}), 
              ...res.data.reduce((acc, flag) => ({ ...acc, [flag.nome_funcionalidade]: flag.esta_ativa }), {}) 
            }; 
            break;
          case 'system_features': 
            newStateUpdates.featureFlags = { 
              ...(newStateUpdates.featureFlags || {}), 
              ...res.data.reduce((acc, flag) => ({ ...acc, [flag.feature_key]: flag.is_enabled }), {}) 
            }; 
            break;
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
      const safeQuery = async (query, tableName) => {
        try {
          return await query;
        } catch (error) {
          console.warn(`Erro ao carregar ${tableName}:`, error);
          if (error.code === '42P01' || error.message?.includes('does not exist')) {
            return { data: [], error: null };
          }
          return { data: [], error: error };
        }
      };

      const [
        clientsRes, suppliersRes, workflowCardsRes, transactionsRes, servicePackagesRes, productsRes,
        equipmentsRes, maintenancesRes, fixedCostsRes, pricedServicesRes,
        savingGoalsRes, availabilitySlotsRes, proposalsRes, contratosRes, walletsRes,
        featureFlagsRes, systemFeaturesRes, referralsRes, commissionsRes
      ] = await Promise.all([
        safeQuery(supabase.from('clients').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }), 'clients'),
        safeQuery(supabase.from('suppliers').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }), 'suppliers'),
        safeQuery(supabase.from('workflow_cards').select('*').eq('user_id', currentUser.id).order('order', { ascending: true }), 'workflow_cards'),
        safeQuery(supabase.from('transacoes').select('*').eq('user_id', currentUser.id).order('data', { ascending: false }), 'transacoes'),
        safeQuery(supabase.from('service_packages').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }), 'service_packages'),
        safeQuery(supabase.from('products').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }), 'products'),
        safeQuery(supabase.from('equipamentos').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }), 'equipamentos'),
        safeQuery(supabase.from('manutencoes').select('*').eq('user_id', currentUser.id).order('data_manutencao', { ascending: false }), 'manutencoes'),
        safeQuery(supabase.from('custos_fixos').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }), 'custos_fixos'),
        safeQuery(supabase.from('servicos_precificados').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }), 'servicos_precificados'),
        safeQuery(supabase.from('metas_reserva').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }), 'metas_reserva'),
        safeQuery(supabase.from('availability_slots').select('*').eq('user_id', currentUser.id), 'availability_slots'),
        safeQuery(supabase.from('propostas').select('*').eq('user_id', currentUser.id).order('updated_at', { ascending: false }), 'propostas'),
        safeQuery(supabase.from('contratosgerados').select('*').eq('id_fotografo', currentUser.id).order('data_geracao', { ascending: false }), 'contratos'),
        safeQuery(supabase.from('wallets').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }), 'wallets'),
        safeQuery(supabase.from('feature_flags').select('*'), 'feature_flags'),
        safeQuery(supabase.from('system_features').select('*'), 'system_features'),
        safeQuery(supabase.from('referrals').select('*').eq('referrer_id', currentUser.id), 'referrals'),
        safeQuery(supabase.from('commissions').select('*').eq('referrer_id', currentUser.id), 'commissions'),
      ]);

      // Filtra apenas erros críticos (não incluindo tabelas que não existem)
      const criticalErrors = [
        clientsRes.error, suppliersRes.error, workflowCardsRes.error, transactionsRes.error, servicePackagesRes.error,
        equipmentsRes.error, maintenancesRes.error, fixedCostsRes.error, pricedServicesRes.error,
        savingGoalsRes.error, availabilitySlotsRes.error, proposalsRes.error, contratosRes.error, walletsRes.error,
        featureFlagsRes.error, systemFeaturesRes.error, referralsRes.error, commissionsRes.error
      ].filter(error => error && error.code !== '42P01' && !error.message?.includes('does not exist'));

      if (criticalErrors.length > 0) {
        criticalErrors.forEach(error => handleSupabaseError(error, 'carregar dados iniciais', toast));
        setDataState({ loadingData: false });
        return;
      }

      const financialSummary = calculateFinancialSummary(transactionsRes.data);
      const potentialLeadValue = (workflowCardsRes.data || [])
        .filter(card => card.status === 'novo-lead' || card.status === 'proposta-enviada')
        .reduce((sum, card) => sum + (Number(card.value) || 0), 0);

      setDataState({
        clients: clientsRes.data,
        suppliers: suppliersRes.data || [],
        workflowCards: workflowCardsRes.data,
        financialData: { ...financialSummary, transactions: transactionsRes.data, potentialLeadValue },
        servicePackages: servicePackagesRes.data,
        products: productsRes.data || [],
        equipments: equipmentsRes.data,
        maintenances: maintenancesRes.data,
        fixedCosts: fixedCostsRes.data,
        pricedServices: pricedServicesRes.data,
        savingGoals: savingGoalsRes.data,
        availabilitySlots: availabilitySlotsRes.data,
        proposals: proposalsRes.data,
        contratos: contratosRes.data,
        wallets: walletsRes.data,
        featureFlags: {
          // Feature flags da tabela original
          ...featureFlagsRes.data.reduce((acc, flag) => ({ ...acc, [flag.nome_funcionalidade]: flag.esta_ativa }), {}),
          // System features da nova tabela
          ...systemFeaturesRes.data.reduce((acc, flag) => ({ ...acc, [flag.feature_key]: flag.is_enabled }), {})
        },
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