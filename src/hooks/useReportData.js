import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';
import { format, subMonths, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const useReportData = (selectedPeriod, selectedCategory) => {
  const { user, getStatusLabel } = useData();
  const { toast } = useToast();
  
  const [loadingReportData, setLoadingReportData] = useState(false);
  const [revenueExpenseData, setRevenueExpenseData] = useState(null);
  const [categoryDistributionData, setCategoryDistributionData] = useState(null);
  const [quickStats, setQuickStats] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    operationalProfit: 0,
    totalProLabore: 0,
    completedProjects: 0,
    newClients: 0,
  });
  const [detailedReportData, setDetailedReportData] = useState({
      transactions: [],
      clientsWithProjects: [],
      projects: [],
      quickStats: {},
      getStatusLabel: null,
  });

  const fetchReportData = useCallback(async (period, categoryFilter) => {
    if (!user) return;
    setLoadingReportData(true);
    try {
      let startDate, endDate;
      const today = new Date();

      switch (period) {
        case 'last_month':
          startDate = startOfMonth(subMonths(today, 1));
          endDate = endOfMonth(subMonths(today, 1));
          break;
        case 'last_3_months':
          startDate = startOfMonth(subMonths(today, 3));
          endDate = endOfMonth(today); 
          break;
        case 'last_year':
          startDate = startOfMonth(subMonths(today, 12));
          endDate = endOfMonth(today); 
          break;
        default: 
          startDate = new Date(2000, 0, 1); 
          endDate = today;
      }
      
      const { data: transactions, error: transactionsError } = await supabase
        .from('transacoes')
        .select('tipo, valor, category, data_recebimento, status, descricao, cliente_id, trabalho_id')
        .eq('user_id', user.id)
        .gte('data_recebimento', startDate.toISOString())
        .lte('data_recebimento', endDate.toISOString());

      if (transactionsError) throw transactionsError;

      const { data: projectsRaw, error: projectsError } = await supabase
        .from('workflow_cards')
        .select('id, status, created_at, client_id, value, title')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (projectsError) throw projectsError;
      
      const clientIdsInProjects = [...new Set(projectsRaw.map(p => p.client_id).filter(Boolean))];
      let clientsInvolved = [];
      if (clientIdsInProjects.length > 0) {
        const { data: fetchedClientsData, error: clientsFetchError } = await supabase
            .from('clients')
            .select('id, name, created_at, email, phone')
            .in('id', clientIdsInProjects);
        if (clientsFetchError) throw clientsFetchError;
        clientsInvolved = fetchedClientsData;
      }
      
      const projects = projectsRaw.map(p => {
        const clientDetails = clientsInvolved.find(c => c.id === p.client_id);
        return {
          ...p,
          client_name: clientDetails?.name || 'Cliente Desconhecido',
          client_email: clientDetails?.email,
          client_phone: clientDetails?.phone
        };
      });

      const { data: newClientsData, error: newClientsError } = await supabase
        .from('clients')
        .select('id, name, created_at, email, phone')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());
      
      if (newClientsError) throw newClientsError;
      
      const clientsWithProjectsDetails = newClientsData.map(c => {
          const clientProjects = projects.filter(p => p.client_id === c.id);
          return {
              ...c,
              projectCount: clientProjects.length,
              totalValue: clientProjects.reduce((sum, p) => sum + Number(p.value || 0), 0)
          };
      }).filter(cwp => cwp.projectCount > 0 || (new Date(cwp.created_at) >= startDate && new Date(cwp.created_at) <= endDate));

      const monthlyData = {};
      const monthsInRange = [];
      let currentMonthPointer = new Date(startDate);
      while(currentMonthPointer <= endDate) {
        const monthKey = format(currentMonthPointer, 'MMM/yy', { locale: ptBR });
        monthsInRange.push(monthKey);
        monthlyData[monthKey] = { revenue: 0, expense: 0, proLabore: 0 };
        currentMonthPointer.setMonth(currentMonthPointer.getMonth() + 1);
      }
      
      let totalRevenue = 0;
      let totalExpenses = 0;
      let totalProLabore = 0;
      const categoryCounts = {};

      transactions.forEach(t => {
        const transactionDate = t.data_recebimento ? parseISO(t.data_recebimento) : null; 
        if (transactionDate && transactionDate >= startDate && transactionDate <= endDate) {
            const monthKey = format(transactionDate, 'MMM/yy', { locale: ptBR });
            if (monthlyData[monthKey]) {
              if (t.tipo === 'ENTRADA' && t.status === 'PAGO') {
                monthlyData[monthKey].revenue += Number(t.valor);
                totalRevenue += Number(t.valor);
                if (categoryFilter === 'all' || categoryFilter === t.category) {
                  categoryCounts[t.category || 'Sem Categoria'] = (categoryCounts[t.category || 'Sem Categoria'] || 0) + Number(t.valor);
                }
              } else if (t.tipo === 'SAIDA' && t.status === 'PAGO') {
                if (t.category === 'Pró-labore') {
                  monthlyData[monthKey].proLabore += Number(t.valor);
                  totalProLabore += Number(t.valor);
                } else {
                  monthlyData[monthKey].expense += Number(t.valor);
                  totalExpenses += Number(t.valor);
                }
              }
            }
        }
      });
      
      const operationalProfit = totalRevenue - totalExpenses;
      const netProfit = operationalProfit - totalProLabore;

      const currentQuickStats = {
        totalRevenue: totalRevenue,
        totalExpenses: totalExpenses,
        operationalProfit: operationalProfit,
        totalProLabore: totalProLabore,
        netProfit: netProfit,
        completedProjects: projects.filter(p => p.status === 'concluido').length,
        newClients: newClientsData.length,
      };

      setQuickStats(currentQuickStats);

      setDetailedReportData({
        transactions: transactions.filter(t => t.status === 'PAGO'),
        clientsWithProjects: clientsWithProjectsDetails,
        projects: projects,
        quickStats: currentQuickStats,
        getStatusLabel: getStatusLabel,
      });
      
      setRevenueExpenseData({
        labels: monthsInRange,
        datasets: [
          {
            label: 'Receitas (Pagas)',
            data: monthsInRange.map(m => monthlyData[m]?.revenue || 0),
            backgroundColor: 'rgba(13, 223, 155, 0.7)', 
            borderColor: 'rgba(13, 223, 155, 1)',
            borderWidth: 1,
          },
          {
            label: 'Despesas Operacionais (Pagas)',
            data: monthsInRange.map(m => monthlyData[m]?.expense || 0),
            backgroundColor: 'rgba(255, 99, 132, 0.7)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
          },
          {
            label: 'Pró-labore (Pago)',
            data: monthsInRange.map(m => monthlyData[m]?.proLabore || 0),
            backgroundColor: 'rgba(255, 159, 64, 0.7)',
            borderColor: 'rgba(255, 159, 64, 1)',
            borderWidth: 1,
          },
        ],
      });

      setCategoryDistributionData({
        labels: Object.keys(categoryCounts),
        datasets: [
          {
            label: 'Distribuição de Receitas por Categoria',
            data: Object.values(categoryCounts),
            backgroundColor: [
              'rgba(62, 18, 128, 0.7)', 
              'rgba(13, 223, 155, 0.7)', 
              'rgba(54, 162, 235, 0.7)',
              'rgba(255, 206, 86, 0.7)',
              'rgba(153, 102, 255, 0.7)',
              'rgba(255, 159, 64, 0.7)',
            ],
            borderColor: [
              'rgba(62, 18, 128, 1)',
              'rgba(13, 223, 155, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)',
            ],
            borderWidth: 1,
          },
        ],
      });

    } catch (error) {
      console.error('Error fetching chart data:', error);
      toast({
        title: "Erro ao buscar dados",
        description: `Não foi possível carregar os dados para os relatórios: ${error.message}`,
        variant: "destructive",
      });
      setRevenueExpenseData(null);
      setCategoryDistributionData(null);
      setDetailedReportData({ transactions: [], clientsWithProjects: [], projects: [], quickStats: {}, getStatusLabel: null });
    } finally {
      setLoadingReportData(false);
    }
  }, [user, toast, getStatusLabel]);

  useEffect(() => {
    fetchReportData(selectedPeriod, selectedCategory);
  }, [fetchReportData, selectedPeriod, selectedCategory]);

  return {
    loadingReportData,
    revenueExpenseData,
    categoryDistributionData,
    quickStats,
    detailedReportData,
    fetchReportData,
  };
};

export default useReportData;