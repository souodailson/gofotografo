import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, TrendingUp, ListFilter, Search, TrendingDown, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import FinancialSummary from '@/components/financial/FinancialSummary';
import FinancialFilters from '@/components/financial/FinancialFilters';
import FinancialTransactionsList from '@/components/financial/FinancialTransactionsList';
import FinancialPastMonthsSummary from '@/components/financial/FinancialPastMonthsSummary';
import useFinancialLogic from '@/hooks/useFinancialLogic';
import PaymentsToReceiveList from '@/components/financial/PaymentsToReceiveList';
import { useModalState } from '@/contexts/ModalStateContext';
import useMobileLayout from '@/hooks/useMobileLayout';
import WalletsManager from '@/components/financial/WalletsManager';

const Financial = ({ initialFilter, isMobile: propIsMobile }) => {
  const {
    financialSummary,
    filteredTransactions,
    filterType,
    setFilterType,
    filterPeriod,
    setFilterPeriod,
    pastMonthsSummaryData,
    showPaymentsToReceive,
    setShowPaymentsToReceive,
    pendingToReceiveWorkflowCards,
    handleDeleteTransaction, 
    searchTerm,
    setSearchTerm,
  } = useFinancialLogic(initialFilter);

  const { openModal } = useModalState();
  const { isMobile } = useMobileLayout();

  useEffect(() => {
    if (initialFilter && initialFilter.isDashboardClick) {
        if (initialFilter.type === 'saida' && initialFilter.status === 'pendente' && initialFilter.period === 'future') {
            setActiveListFilter('pagar');
            setFilterType('SAIDA');
            setFilterPeriod('all'); 
            setShowPaymentsToReceive(false);
        } else if (initialFilter.type === 'entrada' && initialFilter.status === 'pendente') {
            setActiveListFilter('receber');
            setShowPaymentsToReceive(true);
            setFilterType('ALL');
            setFilterPeriod('all');
        } else if (initialFilter.type === 'entrada' && initialFilter.status === 'pago') {
            setActiveListFilter('geral');
            setShowPaymentsToReceive(false);
            setFilterType('ENTRADA');
            setFilterPeriod('all');
        } else if (initialFilter.type === 'saida' && initialFilter.status === 'pago') {
            setActiveListFilter('geral');
            setShowPaymentsToReceive(false);
            setFilterType('SAIDA');
            setFilterPeriod('all');
        }
         else {
            setActiveListFilter('geral');
            setFilterType(initialFilter.type?.toUpperCase() || 'ALL');
            setFilterPeriod(initialFilter.period || 'all');
            setShowPaymentsToReceive(false);
        }
    } else if (!initialFilter || Object.keys(initialFilter).length === 0) {
        setActiveListFilter('geral');
        setShowPaymentsToReceive(false);
        setFilterType('ALL');
        setFilterPeriod('all');
    }
  }, [initialFilter, setFilterType, setFilterPeriod, setShowPaymentsToReceive]);

  const [activeListFilter, setActiveListFilter] = useState('geral');

  const handleAddTransaction = (type) => {
    setShowPaymentsToReceive(false);
    openModal('financial', { type: type, transaction: null });
  };

  const handleEditTransactionLocal = (transaction) => {
    setShowPaymentsToReceive(false);
    openModal('financial', { type: transaction.tipo, transaction: transaction });
  };

  const handleListFilterClick = (filter) => {
    setActiveListFilter(filter);
    if (filter === 'geral') {
      setShowPaymentsToReceive(false);
      setFilterType('ALL');
      setFilterPeriod('all');
    } else if (filter === 'pagar') {
      setShowPaymentsToReceive(false);
      setFilterType('SAIDA'); 
      setFilterPeriod('all'); 
    } else if (filter === 'receber') {
      setShowPaymentsToReceive(true);
      setFilterType('ALL');
      setFilterPeriod('all');
    }
  };


  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={isMobile ? "hidden" : ""}
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground titulo-gradiente">
            Gestão Financeira
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Controle suas receitas, despesas e carteiras.
          </p>
        </motion.div>

        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
           <Button 
            onClick={() => handleAddTransaction('entrada')}
            variant="success"
            className="text-white shadow-lg w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Nova Entrada</span>
            <span className="sm:hidden">Entrada</span>
          </Button>
          <Button 
            onClick={() => handleAddTransaction('saida')}
            className="bg-red-500 hover:bg-red-600 text-white shadow-lg w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Nova Saída</span>
            <span className="sm:hidden">Saída</span>
          </Button>
        </div>
      </div>

      <FinancialSummary summary={financialSummary} />
      
      <WalletsManager />

      <FinancialPastMonthsSummary
        data={pastMonthsSummaryData}
      />

      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mb-4">
        <Button 
            variant={activeListFilter === 'geral' ? 'default' : 'outline'}
            onClick={() => handleListFilterClick('geral')}
            className={`${activeListFilter === 'geral' ? "bg-blue-600 hover:bg-blue-700 text-white" : "border-border text-muted-foreground hover:bg-accent"} w-full sm:w-auto`}
        >
            <ListFilter className="w-4 h-4 mr-2" /> Lançamentos Gerais
        </Button>
        <Button 
            variant={activeListFilter === 'pagar' ? 'default' : 'outline'}
            onClick={() => handleListFilterClick('pagar')}
            className={`${activeListFilter === 'pagar' ? "bg-red-500 hover:bg-red-600 text-white" : "border-border text-muted-foreground hover:bg-accent"} w-full sm:w-auto`}
        >
            <TrendingDown className="w-4 h-4 mr-2" /> Contas a Pagar
        </Button>
        <Button 
            variant={activeListFilter === 'receber' ? 'default' : 'outline'}
            onClick={() => handleListFilterClick('receber')}
            className={`${activeListFilter === 'receber' ? "bg-green-500 hover:bg-green-600 text-white" : "border-border text-muted-foreground hover:bg-accent"} w-full sm:w-auto`}
        >
            <TrendingUp className="w-4 h-4 mr-2" /> Contas a Receber
        </Button>
      </div>

      {activeListFilter !== 'receber' && (
        <div className="bg-card rounded-xl p-4 sm:p-6 shadow-lg border border-border">
          <div className="flex-1 relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Buscar por descrição ou valor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-background focus:ring-primary focus:border-primary"
            />
          </div>
          <FinancialFilters
            filterType={filterType}
            setFilterType={setFilterType}
            filterPeriod={filterPeriod}
            setFilterPeriod={setFilterPeriod}
          />
        </div>
      )}


      {activeListFilter === 'receber' ? (
        <PaymentsToReceiveList cards={pendingToReceiveWorkflowCards} />
      ) : (
        <FinancialTransactionsList
          transactions={filteredTransactions}
          onEdit={handleEditTransactionLocal}
          onDelete={handleDeleteTransaction}
          isMobile={isMobile}
        />
      )}
    </div>
  );
};

export default Financial;