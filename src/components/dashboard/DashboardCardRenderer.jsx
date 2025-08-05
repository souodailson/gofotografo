import React from 'react';
import StatCard from '@/components/dashboard/StatCard';
import ChartCard from '@/components/dashboard/ChartCard';
import SmallStatCard from '@/components/dashboard/SmallStatCard';
import RemindersCard from '@/components/dashboard/RemindersCard';
import StatCardSkeleton from '@/components/dashboard/StatCardSkeleton';
import ChartCardSkeleton from '@/components/dashboard/ChartCardSkeleton';
import SmallStatCardSkeleton from '@/components/dashboard/SmallStatCardSkeleton';
import { Users, FileText, Briefcase, Target, BellRing } from 'lucide-react';

const IconComponents = {
  Users,
  FileText,
  Briefcase,
  Target,
  BellRing,
};

const DashboardCardRenderer = ({ 
  cardConfig, 
  getCardValue, 
  getChartData, 
  dataContextLoading, 
  loadingDashboardMetrics, 
  loadingWorkflowMetrics, 
  loadingClientMetrics, 
  loadingReminders, 
  upcomingReminders, 
  showBalances, 
  handleToggleBalances, 
  isMobile, 
  setActiveTab, 
  deleteTransaction, 
  isPersonalizing, 
  handleRemoveCard 
}) => {
  if (!cardConfig || !cardConfig.visible) return null;
  
  const isLoading = dataContextLoading || loadingDashboardMetrics || 
                    (cardConfig.type === 'chart' && (loadingWorkflowMetrics || loadingDashboardMetrics)) || 
                    (cardConfig.id === 'activeClients' && loadingClientMetrics) ||
                    (cardConfig.id === 'remindersCard' && loadingReminders);
  
  const IconCmp = IconComponents[cardConfig.icon] || null;

  const cardProps = {
    id: `dashboard-${cardConfig.type}-card-${cardConfig.id}`, 
    title: cardConfig.title,
    icon: cardConfig.icon,
    color: cardConfig.color,
    onClick: cardConfig.onClick,
    isPersonalizing: isPersonalizing,
    onRemove: () => handleRemoveCard(cardConfig.id),
    showBalances: showBalances,
    handleToggleBalances: cardConfig.id === 'netBalance' ? handleToggleBalances : undefined,
    isMobile: isMobile,
    onEditTransaction: (transactionId) => setActiveTab('financial', { modal: 'editTransaction', transactionId: transactionId }),
    onDeleteTransaction: deleteTransaction,
  };

  if (isLoading && cardConfig.id !== 'remindersCard') {
    switch (cardConfig.type) {
      case 'stat': return <StatCardSkeleton key={cardConfig.id} id={`dashboard-stat-card-${cardConfig.id}-skeleton`} />;
      case 'chart': return <ChartCardSkeleton key={cardConfig.id} id={`dashboard-chart-card-${cardConfig.id}-skeleton`} />;
      case 'smallStat': return <SmallStatCardSkeleton key={cardConfig.id} id={`dashboard-smallStat-card-${cardConfig.id}-skeleton`} />;
      default: return null;
    }
  }
  
  if (cardConfig.component === 'RemindersCard') {
    return <RemindersCard key={cardConfig.id} {...cardProps} reminders={upcomingReminders} isLoading={isLoading} />;
  }

  switch (cardConfig.type) {
    case 'stat':
      return <StatCard key={cardConfig.id} {...cardProps} value={getCardValue(cardConfig.id)} icon={IconCmp} />;
    case 'chart':
      return <ChartCard key={cardConfig.id} {...cardProps} chartData={getChartData(cardConfig.id)} type={cardConfig.chartType} icon={IconCmp} />;
    case 'smallStat':
      return <SmallStatCard key={cardConfig.id} {...cardProps} value={getCardValue(cardConfig.id)} icon={IconCmp} iconColor={cardConfig.iconColor} />;
    default:
      return null;
  }
};

export default DashboardCardRenderer;