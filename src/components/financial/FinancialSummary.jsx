import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

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

const FinancialSummary = ({ summary }) => {
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <StatCard key={stat.title} {...stat} delay={index * 0.1} />
      ))}
    </div>
  );
};

export default FinancialSummary;