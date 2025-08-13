import { useState, useMemo, useCallback, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';
import { format, startOfMonth, endOfMonth, subMonths, parseISO, startOfDay, endOfDay, startOfWeek, endOfWeek, subDays, startOfYear, endOfYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const useFinancialLogic = (initialFilter) => {
  const { financialData, deleteTransaction: deleteTransactionContext, workflowCards, getClientById, wallets } = useData();
  const { toast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState('entrada');
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [filterType, setFilterType] = useState(() => {
    if (initialFilter && initialFilter.isDashboardClick) {
      if (initialFilter.type === 'saida' && initialFilter.status === 'pendente' && initialFilter.period === 'future') return 'SAIDA';
      if (initialFilter.type === 'entrada' && initialFilter.status === 'pendente') return 'ALL';
      if (initialFilter.type === 'entrada' && initialFilter.status === 'pago') return 'ENTRADA';
      if (initialFilter.type === 'saida' && initialFilter.status === 'pago') return 'SAIDA';
      return initialFilter.type?.toUpperCase() || 'ALL';
    }
    return 'ALL';
  });

  const [filterPeriod, setFilterPeriod] = useState(() => {
    if (initialFilter && initialFilter.isDashboardClick) {
      if (initialFilter.type === 'saida' && initialFilter.status === 'pendente' && initialFilter.period === 'future') return 'all';
      return initialFilter.period || 'all';
    }
    return 'all';
  });
  
  const [summaryPeriod, setSummaryPeriod] = useState('month'); // Período padrão mensal para os cards
  
  const [showPaymentsToReceive, setShowPaymentsToReceive] = useState(() => {
    if (initialFilter && initialFilter.isDashboardClick) {
      return initialFilter.type === 'entrada' && initialFilter.status === 'pendente';
    }
    return false;
  });


  useEffect(() => {
    if (initialFilter && initialFilter.isDashboardClick) {
        if (initialFilter.type === 'saida' && initialFilter.status === 'pendente' && initialFilter.period === 'future') {
            setFilterType('SAIDA');
            setFilterPeriod('all'); 
            setShowPaymentsToReceive(false);
        } else if (initialFilter.type === 'entrada' && initialFilter.status === 'pendente') {
            setShowPaymentsToReceive(true);
            setFilterType('ALL');
            setFilterPeriod('all');
        } else if (initialFilter.type === 'entrada' && initialFilter.status === 'pago') {
            setShowPaymentsToReceive(false);
            setFilterType('ENTRADA');
            setFilterPeriod('all');
        } else if (initialFilter.type === 'saida' && initialFilter.status === 'pago') {
            setShowPaymentsToReceive(false);
            setFilterType('SAIDA');
            setFilterPeriod('all');
        }
         else {
            setFilterType(initialFilter.type?.toUpperCase() || 'ALL');
            setFilterPeriod(initialFilter.period || 'all');
            setShowPaymentsToReceive(false);
        }
    } else if (!initialFilter || Object.keys(initialFilter).length === 0) {
        setShowPaymentsToReceive(false);
        setFilterType('ALL');
        setFilterPeriod('all');
    }
  }, [initialFilter]);

  const financialSummary = useMemo(() => {
    if (!financialData || !financialData.transactions) {
      return { totalRevenue: 0, totalExpenses: 0, netBalance: 0 };
    }
    
    let transactionsToSummarize = financialData.transactions;

    // Apply summary period filter to summary calculations (independent from list filter)
    if (summaryPeriod !== 'all') {
      transactionsToSummarize = financialData.transactions.filter(transaction => {
        const relevantDateString = (transaction.status === 'PAGO' && transaction.data_recebimento) 
                                  ? transaction.data_recebimento 
                                  : transaction.data_vencimento || transaction.created_at;
        
        if (!relevantDateString) return false;

        const transactionDate = parseISO(relevantDateString);
        const now = new Date();

        switch (summaryPeriod) {
          case 'today':
            const todayStart = startOfDay(now);
            const todayEnd = endOfDay(now);
            return transactionDate >= todayStart && transactionDate <= todayEnd;
          case 'week':
            const weekStart = startOfWeek(now, { locale: ptBR });
            const weekEnd = endOfWeek(now, { locale: ptBR });
            return transactionDate >= weekStart && transactionDate <= weekEnd;
          case 'month':
            const monthStart = startOfMonth(now);
            const monthEnd = endOfMonth(now);
            return transactionDate >= monthStart && transactionDate <= monthEnd;
          case 'last_7_days':
            const last7DaysStart = startOfDay(subDays(now, 6));
            const last7DaysEnd = endOfDay(now);
            return transactionDate >= last7DaysStart && transactionDate <= last7DaysEnd;
          case 'last_30_days':
            const last30DaysStart = startOfDay(subDays(now, 29));
            const last30DaysEnd = endOfDay(now);
            return transactionDate >= last30DaysStart && transactionDate <= last30DaysEnd;
          case 'last_90_days':
            const last90DaysStart = startOfDay(subDays(now, 89));
            const last90DaysEnd = endOfDay(now);
            return transactionDate >= last90DaysStart && transactionDate <= last90DaysEnd;
          case 'last_year':
            const lastYearStart = startOfDay(subDays(now, 364));
            const lastYearEnd = endOfDay(now);
            return transactionDate >= lastYearStart && transactionDate <= lastYearEnd;
          case 'current_year':
            const currentYearStart = startOfYear(now);
            const currentYearEnd = endOfYear(now);
            return transactionDate >= currentYearStart && transactionDate <= currentYearEnd;
          default: 
            return true;
        }
      });
    }

    const totalRevenue = transactionsToSummarize
      .filter(t => t.tipo === 'ENTRADA' && t.status === 'PAGO')
      .reduce((sum, t) => sum + Number(t.valor), 0);

    const totalExpenses = transactionsToSummarize
      .filter(t => t.tipo === 'SAIDA' && t.status === 'PAGO')
      .reduce((sum, t) => sum + Number(t.valor), 0);
    
    const netBalance = totalRevenue - totalExpenses;
    return { totalRevenue, totalExpenses, netBalance };
  }, [financialData.transactions, summaryPeriod]);

  const filteredTransactions = useMemo(() => {
    let transactionsToFilter = financialData.transactions.map(t => ({
      ...t,
      wallet: wallets.find(w => w.id === t.wallet_id)
    }));

    if (searchTerm) {
        const lowercasedTerm = searchTerm.toLowerCase();
        transactionsToFilter = transactionsToFilter.filter(transaction =>
            transaction.descricao.toLowerCase().includes(lowercasedTerm) ||
            transaction.valor.toString().includes(lowercasedTerm)
        );
    }

    return transactionsToFilter.filter(transaction => {
      let matchesType = filterType === 'ALL' || transaction.tipo === filterType;
      
      if (initialFilter?.isDashboardClick) {
        if (initialFilter.type === 'saida' && initialFilter.status === 'pendente' && initialFilter.period === 'future' && filterType === 'SAIDA') {
          matchesType = matchesType && transaction.status === 'PENDENTE';
        } else if (initialFilter.type === 'entrada' && initialFilter.status === 'pago' && filterType === 'ENTRADA') {
          matchesType = matchesType && transaction.status === 'PAGO';
        } else if (initialFilter.type === 'saida' && initialFilter.status === 'pago' && filterType === 'SAIDA') {
          matchesType = matchesType && transaction.status === 'PAGO';
        }
      }

      let matchesPeriod = true;
      if (filterPeriod !== 'all') {
        const relevantDateString = (transaction.status === 'PAGO' && transaction.data_recebimento) 
                                  ? transaction.data_recebimento 
                                  : transaction.data_vencimento || transaction.created_at;
        
        if (!relevantDateString) return false; 

        const transactionDate = parseISO(relevantDateString); 
        const now = new Date();
        switch (filterPeriod) {
          case 'today':
            const todayStart = startOfDay(now);
            const todayEnd = endOfDay(now);
            matchesPeriod = transactionDate >= todayStart && transactionDate <= todayEnd;
            break;
          case 'week':
            const weekStart = startOfWeek(now, { locale: ptBR });
            const weekEnd = endOfWeek(now, { locale: ptBR });
            matchesPeriod = transactionDate >= weekStart && transactionDate <= weekEnd;
            break;
          case 'month':
            const monthStart = startOfMonth(now);
            const monthEnd = endOfMonth(now);
            matchesPeriod = transactionDate >= monthStart && transactionDate <= monthEnd;
            break;
          case 'last_7_days':
            const last7DaysStart = startOfDay(subDays(now, 6));
            const last7DaysEnd = endOfDay(now);
            matchesPeriod = transactionDate >= last7DaysStart && transactionDate <= last7DaysEnd;
            break;
          case 'last_30_days':
            const last30DaysStart = startOfDay(subDays(now, 29));
            const last30DaysEnd = endOfDay(now);
            matchesPeriod = transactionDate >= last30DaysStart && transactionDate <= last30DaysEnd;
            break;
          case 'last_90_days':
            const last90DaysStart = startOfDay(subDays(now, 89));
            const last90DaysEnd = endOfDay(now);
            matchesPeriod = transactionDate >= last90DaysStart && transactionDate <= last90DaysEnd;
            break;
          case 'last_year':
            const lastYearStart = startOfDay(subDays(now, 364));
            const lastYearEnd = endOfDay(now);
            matchesPeriod = transactionDate >= lastYearStart && transactionDate <= lastYearEnd;
            break;
          case 'current_year':
            const currentYearStart = startOfYear(now);
            const currentYearEnd = endOfYear(now);
            matchesPeriod = transactionDate >= currentYearStart && transactionDate <= currentYearEnd;
            break;
          default: break;
        }
      }
      return matchesType && matchesPeriod;
    }).sort((a, b) => parseISO(b.created_at).getTime() - parseISO(a.created_at).getTime());
  }, [financialData.transactions, filterType, filterPeriod, initialFilter, searchTerm, wallets]);

  // New filtered functions for specific views
  const getFilteredTransactionsByListType = useMemo(() => {
    const now = new Date();
    
    switch (true) {
      case filterType === 'SAIDA': // Contas a Pagar
        return filteredTransactions.filter(t => 
          t.tipo === 'SAIDA' && 
          t.status === 'PENDENTE' && 
          (!t.data_vencimento || parseISO(t.data_vencimento) >= now)
        );
      
      case initialFilter?.isDashboardClick && initialFilter.type === 'saida' && initialFilter.status === 'pendente':
        return filteredTransactions.filter(t => 
          t.tipo === 'SAIDA' && 
          t.status === 'PENDENTE'
        );
      
      default:
        return filteredTransactions;
    }
  }, [filteredTransactions, filterType, initialFilter]);

  const overdueTransactions = useMemo(() => {
    const now = new Date();
    return financialData.transactions.filter(t => 
      t.status === 'PENDENTE' && 
      t.data_vencimento && 
      parseISO(t.data_vencimento) < now
    ).map(t => ({
      ...t,
      wallet: wallets.find(w => w.id === t.wallet_id)
    }));
  }, [financialData.transactions, wallets]);

  const defaultDebtorTransactions = useMemo(() => {
    const now = new Date();
    const clientDebts = {};
    
    financialData.transactions
      .filter(t => 
        t.tipo === 'ENTRADA' && 
        t.status === 'PENDENTE' && 
        t.cliente_id &&
        t.data_vencimento && 
        parseISO(t.data_vencimento) < now
      )
      .forEach(t => {
        if (!clientDebts[t.cliente_id]) {
          clientDebts[t.cliente_id] = [];
        }
        clientDebts[t.cliente_id].push({
          ...t,
          wallet: wallets.find(w => w.id === t.wallet_id)
        });
      });

    return Object.values(clientDebts).flat();
  }, [financialData.transactions, wallets]);

  const handleAddTransaction = (type) => {
    setTransactionType(type);
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleEditTransaction = (transaction) => {
    setTransactionType(transaction.tipo); 
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleDeleteTransaction = async (transactionId) => {
    try {
      await deleteTransactionContext(transactionId);
      toast({ title: "Lançamento Removido", description: "O lançamento financeiro foi removido com sucesso." });
    } catch (error) {
      toast({ title: "Erro ao remover", description: error.message, variant: "destructive" });
    }
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  const getMonthNumber = (monthName) => {
    const months = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
    return months.indexOf(monthName.toLowerCase());
  };

  const pastMonthsSummaryData = useMemo(() => {
    const months = {};
    const currentDate = new Date();
    
    financialData.transactions.forEach(t => {
      const transactionDate = parseISO(t.data_recebimento || t.created_at); 
      const monthYear = format(transactionDate, 'MMMM/yyyy', { locale: ptBR });
      if (!months[monthYear]) {
        months[monthYear] = { revenue: 0, expenses: 0, transactions: 0 };
      }
      if (t.tipo === 'ENTRADA' && t.status === 'PAGO') months[monthYear].revenue += Number(t.valor);
      if (t.tipo === 'SAIDA' && t.status === 'PAGO') months[monthYear].expenses += Number(t.valor);
      months[monthYear].transactions++;
    });

    return Object.entries(months).map(([key, value]) => ({ monthYear: key, ...value }))
       .sort((a,b) => {
           const [aMonthName, aYear] = a.monthYear.split('/');
           const [bMonthName, bYear] = b.monthYear.split('/');
           return new Date(bYear, getMonthNumber(bMonthName)) - new Date(aYear, getMonthNumber(aMonthName));
        }).slice(0,3); // Get only the last 3 months including current
  }, [financialData.transactions]);
  
  const pendingToReceiveWorkflowCards = useMemo(() => {
    return workflowCards.map(card => {
      const associatedTransactions = financialData.transactions.filter(t => t.trabalho_id === card.id && t.tipo === 'ENTRADA');
      const totalPaidForCard = associatedTransactions
                                .filter(t => t.status === 'PAGO')
                                .reduce((sum, t) => sum + Number(t.valor), 0);
      
      let pendingAmountFromTransactions = associatedTransactions
                                .filter(t => t.status === 'PENDENTE')
                                .reduce((sum, t) => sum + Number(t.valor), 0);

      let cardValue = Number(card.value) || 0;
      let pendingAmountBasedOnCardValue = 0;

      if (cardValue > totalPaidForCard) {
        pendingAmountBasedOnCardValue = cardValue - totalPaidForCard;
      }
      
      const finalPendingAmount = pendingAmountFromTransactions > 0 ? pendingAmountFromTransactions : pendingAmountBasedOnCardValue;

      return {
        ...card,
        pending_amount: finalPendingAmount,
        client: card.client_id ? getClientById(card.client_id) : null,
      };
    }).filter(card => card.pending_amount > 0 && card.status !== 'concluido' && !card.archived);
  }, [workflowCards, financialData.transactions, getClientById]);


  return {
    financialSummary,
    summaryPeriod,
    setSummaryPeriod,
    filteredTransactions,
    getFilteredTransactionsByListType,
    overdueTransactions,
    defaultDebtorTransactions,
    isModalOpen,
    transactionType,
    editingTransaction,
    filterType,
    setFilterType,
    filterPeriod,
    setFilterPeriod,
    handleAddTransaction,
    handleEditTransaction,
    handleDeleteTransaction,
    closeModal,
    pastMonthsSummaryData,
    showPaymentsToReceive,
    setShowPaymentsToReceive,
    pendingToReceiveWorkflowCards,
    searchTerm,
    setSearchTerm,
  };
};

export default useFinancialLogic;