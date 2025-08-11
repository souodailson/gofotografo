import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Settings } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PERIOD_FILTERS } from '@/lib/financialConstants';

const StatCard = ({ title, value, icon: Icon, color, bgColor, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className={`${bgColor} bg-card rounded-xl p-6 shadow-lg border border-border card-hover`}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground">
          {title}
        </p>
        <p className="text-2xl font-bold text-foreground mt-1">
          {value}
        </p>
      </div>
      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </motion.div>
);

const FinancialSummary = ({ summary, summaryPeriod, onSummaryPeriodChange }) => {
  const stats = [
    {
      title: 'Faturamento Total (Pago)',
      value: `R$ ${(summary.totalRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'dark:bg-green-900/10'
    },
    {
      title: 'Despesas Totais (Pagas)', 
      value: `R$ ${(summary.totalExpenses || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: TrendingDown,
      color: 'from-red-500 to-pink-600',
      bgColor: 'dark:bg-red-900/10'
    },
    {
      title: 'Lucro Líquido (Pago)',
      value: `R$ ${(summary.netBalance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: (summary.netBalance || 0) >= 0 ? 'from-blue-500 to-cyan-600' : 'from-red-500 to-pink-600',
      bgColor: (summary.netBalance || 0) >= 0 ? 'dark:bg-blue-900/10' : 'dark:bg-red-900/10'
    }
  ];

  const getPeriodLabel = () => {
    const period = PERIOD_FILTERS.find(p => p.value === summaryPeriod);
    return period ? period.label.toLowerCase() : 'todos os períodos';
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Resumo Financeiro</h3>
          <p className="text-sm text-muted-foreground">Dados baseados em: {getPeriodLabel()}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-muted-foreground" />
          <Select value={summaryPeriod} onValueChange={onSummaryPeriodChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Período dos cards" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {PERIOD_FILTERS.map(filter => (
                <SelectItem key={filter.value} value={filter.value}>
                  {filter.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={stat.title} {...stat} delay={index * 0.1} />
        ))}
      </div>
    </div>
  );
};

export default FinancialSummary;