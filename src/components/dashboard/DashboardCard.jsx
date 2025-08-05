import React from 'react';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';

import StatCard from '@/components/dashboard/StatCard';
import SmallStatCard from '@/components/dashboard/SmallStatCard';
import ChartCard from '@/components/dashboard/ChartCard';
import RemindersCard from '@/components/dashboard/RemindersCard';
import GoalsSummaryCard from '@/components/dashboard/GoalsSummaryCard';
import StatCardSkeleton from '@/components/dashboard/StatCardSkeleton';
import SmallStatCardSkeleton from '@/components/dashboard/SmallStatCardSkeleton';
import ChartCardSkeleton from '@/components/dashboard/ChartCardSkeleton';
import RemindersCardSkeleton from '@/components/dashboard/RemindersCardSkeleton';

import { getDashboardMetrics } from '@/lib/dashboard/metrics';
import { getChartDataForDashboard } from '@/lib/dashboard/chartData';
import { getInitialCardConfig } from '@/lib/dashboard/layoutConfig';
import { getDemoChartData, getDemoGoals } from '@/lib/dashboard/demoData';
import { formatCurrency } from '@/lib/utils';

import FollowUpModal from './FollowUpModal';

import {
  AlertTriangle,
  Clock,
  Gift,
  Sparkles,
} from 'lucide-react';

const DashboardCard = ({
  cardId,
  layout,
  isEditing,
  setActiveTab,
}) => {
  const {
    workflowCards,
    financialData,
    clients,
    settings,
    loading: dataContextLoading,
    deleteTransaction,
    refreshData,
    equipments,
    savingGoals,
    wallets,
    getWalletBalance,
  } = useData();
  const { toast } = useToast();

  const isLoading =
    dataContextLoading || !financialData;
  const userHasData =
    financialData &&
    (financialData.transactions.length > 0 ||
      workflowCards.length > 0 ||
      clients.length > 0);
  const isNewUser = !userHasData;

  // Estado de follow-up
  const [followUpOpen, setFollowUpOpen] =
    React.useState(false);
  const [selectedReminder, setSelectedReminder] =
    React.useState(null);

  // Calcula métricas
  const dashboardData = React.useMemo(() => {
    if (isLoading || !financialData) return null;
    return getDashboardMetrics(
      financialData.transactions,
      workflowCards,
      clients,
      settings,
      equipments
    );
  }, [
    isLoading,
    financialData,
    workflowCards,
    clients,
    settings,
    equipments,
  ]);

  // Dados de gráficos
  const chartsData = React.useMemo(() => {
    if (isLoading || !dashboardData) return {};
    const commonParams = [
      dashboardData,
      workflowCards,
      financialData.transactions,
      setActiveTab,
    ];
    return {
      grafico_faturamento: getChartDataForDashboard(
        'grafico_faturamento',
        ...commonParams
      ),
      grafico_despesas_faturamento:
        getChartDataForDashboard(
          'grafico_despesas_faturamento',
          ...commonParams
        ),
      grafico_despesas_lucro: getChartDataForDashboard(
        'grafico_despesas_lucro',
        ...commonParams
      ),
      grafico_conversao_leads: getChartDataForDashboard(
        'grafico_conversao_leads',
        ...commonParams
      ),
      grafico_inadimplentes: getChartDataForDashboard(
        'grafico_inadimplentes',
        ...commonParams
      ),
      status_trabalhos: getChartDataForDashboard(
        'status_trabalhos',
        ...commonParams
      ),
      ultimos_lancamentos: getChartDataForDashboard(
        'ultimos_lancamentos',
        dashboardData,
        workflowCards,
        financialData.transactions,
        setActiveTab,
        wallets
      ),
    };
  }, [
    isLoading,
    dashboardData,
    workflowCards,
    financialData.transactions,
    setActiveTab,
    wallets,
  ]);

  /**
   * Gera lembretes com id único e dispara notificações globais
   * para lembretes urgentes (vencidos ou para hoje).
   */
  const remindersData = React.useMemo(() => {
    if (isLoading) return [];
    const nowDate = new Date();
    const result = [];

    // Transações pendentes
    (financialData?.transactions || []).forEach((t) => {
      if (t.status !== 'PENDENTE') return;
      const dueStr =
        t.data_vencimento ||
        t.data ||
        t.created_at;
      if (!dueStr) return;
      const dueDate = new Date(dueStr);
      const diff = Math.floor(
        (dueDate - nowDate) /
          (1000 * 60 * 60 * 24)
      );
      const isExpense = t.tipo === 'SAIDA';
      if (diff < 0 || diff <= 7) {
        const type =
          diff < 0
            ? isExpense
              ? 'expense_overdue'
              : 'payment_overdue'
            : isExpense
            ? 'expense_due'
            : 'payment_due';
        const client = (clients || []).find(
          (c) =>
            c.id ===
            (t.cliente_id || t.clienteId)
        );
        const clientName =
          client?.nome || client?.name || '';
        const id = `${type}-${dueStr}-${clientName}`;
        const reminder = {
          id,
          icon:
            diff < 0 ? AlertTriangle : Clock,
          color:
            diff < 0
              ? 'bg-red-500'
              : 'bg-yellow-500',
          title:
            diff < 0
              ? isExpense
                ? 'Despesa vencida'
                : 'Recebimento vencido'
              : isExpense
              ? 'Despesa a vencer'
              : 'Recebimento a vencer',
          description: `${clientName} - ${formatCurrency(
            t.valor
          )}`,
          date: dueDate.toISOString(),
          reminderType: type,
          clientName,
          clientPhone:
            client?.celular ||
            client?.telefone ||
            client?.whatsapp ||
            client?.phone ||
            '',
          onFollowUp: () => {
            setSelectedReminder(reminder);
            setFollowUpOpen(true);
          },
        };
        result.push(reminder);
        // Dispara notificação global se vencido ou hoje
        if (diff < 0 || diff === 0) {
          window.dispatchEvent(
            new CustomEvent('addNotification', {
              detail: reminder,
            })
          );
        }
      }
    });

    // Aniversários
    (clients || []).forEach((c) => {
      const bStr = c.birthday || c.data_nascimento;
      if (!bStr) return;
      const bDate = new Date(bStr);
      const nextB = new Date(
        nowDate.getFullYear(),
        bDate.getMonth(),
        bDate.getDate()
      );
      if (nextB < nowDate)
        nextB.setFullYear(nowDate.getFullYear() + 1);
      const diff = Math.floor(
        (nextB - nowDate) /
          (1000 * 60 * 60 * 24)
      );
      if (diff >= 0 && diff <= 7) {
        const id = `birthday-${c.id}-${nextB.toISOString()}`;
        const reminder = {
          id,
          icon: Gift,
          color: 'bg-pink-500',
          title:
            diff === 0
              ? `Aniversário de ${c.nome || c.name}`
              : `Aniv. em ${diff} dia(s): ${c.nome || c.name}`,
          description:
            'Envie uma mensagem ou oferta',
          date: nextB.toISOString(),
          reminderType: 'birthday',
          clientName: c.nome || c.name || '',
          clientPhone:
            c.celular ||
            c.telefone ||
            c.whatsapp ||
            c.phone ||
            '',
          onFollowUp: () => {
            setSelectedReminder(reminder);
            setFollowUpOpen(true);
          },
        };
        result.push(reminder);
        if (diff === 0) {
          window.dispatchEvent(
            new CustomEvent('addNotification', {
              detail: reminder,
            })
          );
        }
      }
    });

    // Tarefas
    (workflowCards || []).forEach((card) => {
      if (!card.date) return;
      const taskDate = new Date(card.date);
      const diff = Math.floor(
        (taskDate - nowDate) /
          (1000 * 60 * 60 * 24)
      );
      if (diff >= 0 && diff <= 7) {
        const id = `task-${card.id || card.title}-${taskDate.toISOString()}`;
        const reminder = {
          id,
          icon: Sparkles,
          color: 'bg-cyan-500',
          title:
            diff === 0
              ? `Tarefa hoje: ${card.title || card.titulo}`
              : `Tarefa em ${diff} dia(s): ${card.title || card.titulo}`,
          description: `Agendado para ${taskDate.toLocaleDateString(
            'pt-BR'
          )}`,
          date: taskDate.toISOString(),
          reminderType: 'task_due',
          onFollowUp: () => {
            setSelectedReminder(reminder);
            setFollowUpOpen(true);
          },
        };
        result.push(reminder);
        if (diff === 0) {
          window.dispatchEvent(
            new CustomEvent('addNotification', {
              detail: reminder,
            })
          );
        }
      }
    });

    result.sort((a, b) => {
      const da = new Date(a.date || 0);
      const db = new Date(b.date || 0);
      return da - db;
    });
    return result;
  }, [
    isLoading,
    financialData?.transactions,
    clients,
    workflowCards,
  ]);

  // Escuta evento global para abrir follow-up
  React.useEffect(() => {
    const handler = (e) => {
      if (e.detail) {
        setSelectedReminder(e.detail);
        setFollowUpOpen(true);
      }
    };
    window.addEventListener('openFollowUp', handler);
    return () => {
      window.removeEventListener('openFollowUp', handler);
    };
  }, []);

  // Stat card value
  const getCardValue = React.useCallback(
    (id) => {
      if (isLoading || !dashboardData) return '...';
      if (isNewUser) {
        return id.includes('conversao')
          ? '0.0%'
          : 'R$ 0,00';
      }
      const showBalances =
        settings?.hide_dashboard_balances === false;
      const placeholder = '••••';
      if (id.startsWith('wallet_')) {
        const walletId = id.replace('wallet_', '');
        const balance = getWalletBalance(walletId);
        return showBalances
          ? formatCurrency(balance)
          : placeholder;
      }
      const formatValue = (val) =>
        showBalances
          ? formatCurrency(val)
          : placeholder;
      switch (id) {
        case 'saldo_geral':
          return formatValue(dashboardData.netBalance);
        case 'pagamentos_receber':
          return formatValue(dashboardData.pendingToReceive);
        case 'despesas_pagar':
          return formatValue(dashboardData.futurePendingPayments);
        case 'imposto_estimado':
          return formatValue(dashboardData.estimatedTax);
        case 'pro_labore':
          return formatValue(dashboardData.proLaboreThisMonth);
        case 'despesas_mes':
          return formatValue(dashboardData.expensesThisMonth);
        case 'lucro_mes':
          return formatValue(dashboardData.profitThisMonth);
        case 'depreciacao_mensal':
          return formatValue(dashboardData.monthlyDepreciation);
        case 'awaiting_release':
          return formatValue(dashboardData.awaitingRelease);
        case 'clientes_ativos':
          return clients.length;
        case 'trabalhos_em_andamento':
          return dashboardData.workInProgress;
        case 'trabalhos_agendados':
          return dashboardData.scheduledThisMonth;
        case 'conversao_clientes':
          return `${dashboardData.conversionRate.toFixed(1)}%`;
        default:
          return '';
      }
    },
    [
      isLoading,
      dashboardData,
      settings?.hide_dashboard_balances,
      clients,
      isNewUser,
      getWalletBalance,
    ]
  );

  const getChartData = React.useCallback(
    (id) => {
      if (isNewUser) return getDemoChartData(id);
      if (isLoading || !chartsData[id]) {
        return {
          labels: [],
          datasets: [{ data: [] }],
        };
      }
      return chartsData[id];
    },
    [isLoading, chartsData, isNewUser]
  );

  const handleDeleteTransactionDashboard =
    async (transactionId) => {
      try {
        await deleteTransaction(transactionId);
        toast({
          title: 'Lançamento excluído',
          description:
            'O lançamento foi excluído com sucesso.',
        });
        await refreshData();
      } catch (error) {
        toast({
          title: 'Erro ao excluir',
          description: `Não foi possível excluir o lançamento: ${error.message}`,
          variant: 'destructive',
        });
      }
    };

  const cardConfig = React.useMemo(() => {
    try {
      const configs = getInitialCardConfig(
        setActiveTab,
        wallets
      );
      return configs[cardId];
    } catch {
      return null;
    }
  }, [setActiveTab, wallets, cardId]);

  if (!cardConfig) return null;

  if (isLoading) {
    switch (cardConfig.type) {
      case 'stat':
        return <StatCardSkeleton />;
      case 'smallStat':
        return <SmallStatCardSkeleton />;
      case 'chart':
        return (
          <ChartCardSkeleton
            isList={cardConfig.chartType === 'list'}
          />
        );
      case 'reminders':
        return <RemindersCardSkeleton />;
      case 'goals_summary':
        return (
          <ChartCardSkeleton isList={true} />
        );
      default:
        return <StatCardSkeleton />;
    }
  }

  // Renderiza conforme tipo
  switch (cardConfig.type) {
    case 'stat': {
      const handleStatClick = () => {
        if (
          cardId === 'lucro_mes' &&
          dashboardData
        ) {
          const revenue =
            dashboardData.revenueThisMonth || 0;
          const expenses =
            dashboardData.expensesThisMonth || 0;
          const profit =
            dashboardData.profitThisMonth || 0;
          toast({
            title: 'Lucro do mês',
            description: `Receitas: ${formatCurrency(
              revenue
            )}\nDespesas: ${formatCurrency(
              expenses
            )}\nLucro: ${formatCurrency(profit)}`,
          });
        }
        if (cardConfig.onClick)
          cardConfig.onClick();
      };
      return (
        <StatCard
          title={cardConfig.title}
          value={getCardValue(cardId)}
          icon={cardConfig.icon}
          iconUrl={cardConfig.iconUrl}
          color={cardConfig.color}
          onClick={
            cardId === 'lucro_mes'
              ? handleStatClick
              : cardConfig.onClick
          }
          isPersonalizing={isEditing}
          layout={layout}
        />
      );
    }
    case 'smallStat':
      return (
        <SmallStatCard
          title={cardConfig.title}
          value={getCardValue(cardId)}
          icon={cardConfig.icon}
          iconColor={cardConfig.iconColor}
          onClick={cardConfig.onClick}
          isPersonalizing={isEditing}
          layout={layout}
        />
      );
    case 'chart':
      return (
        <ChartCard
          title={cardConfig.title}
          icon={cardConfig.icon}
          color={cardConfig.color}
          chartType={cardConfig.chartType}
          chartData={getChartData(cardId)}
          onClick={cardConfig.onClick}
          isPersonalizing={isEditing}
          deleteTransaction={
            cardId === 'ultimos_lancamentos'
              ? handleDeleteTransactionDashboard
              : undefined
          }
          setActiveTab={
            cardId === 'ultimos_lancamentos'
              ? setActiveTab
              : undefined
          }
          isDemo={isNewUser}
          layout={layout}
        />
      );
    case 'reminders':
      return (
        <>
          <RemindersCard
            reminders={
              isNewUser ? [] : remindersData
            }
            isLoading={isLoading}
            isDemo={isNewUser}
            layout={layout}
            onFollowUp={(
              reminder
            ) => {
              setSelectedReminder(reminder);
              setFollowUpOpen(true);
            }}
          />
          <FollowUpModal
            open={followUpOpen}
            onOpenChange={
              setFollowUpOpen
            }
            reminder={selectedReminder}
          />
        </>
      );
    case 'goals_summary':
      return (
        <GoalsSummaryCard
          goals={
            isNewUser
              ? getDemoGoals()
              : savingGoals
          }
          isLoading={isLoading}
          onClick={cardConfig.onClick}
          isDemo={isNewUser}
        />
      );
    default:
      return null;
  }
};

export default DashboardCard;
