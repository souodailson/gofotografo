import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, BarChart2 } from 'lucide-react';

const FinancialPastMonthsSummary = ({ data }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-card rounded-xl p-6 shadow-lg border border-border"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Resumo de Meses Anteriores (Últimos 3 meses)
        </h3>
      </div>
      <div className="space-y-4">
        {data.length > 0 ? data.map((summary, index) => {
          const total = summary.revenue + summary.expenses;
          const revenuePercent = total > 0 ? (summary.revenue / total) * 100 : 0;
          const expensePercent = total > 0 ? (summary.expenses / total) * 100 : 0;

          return (
            <motion.div 
              key={summary.monthYear}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 bg-background/50 rounded-lg border border-border"
            >
              <div className="flex justify-between items-center mb-2">
                <p className="font-semibold text-foreground">{summary.monthYear}</p>
                <span className="text-xs text-muted-foreground">{summary.transactions} transações</span>
              </div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                  <TrendingUp size={16} className="mr-1" />
                  Receitas: R$ {Number(summary.revenue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="flex items-center text-sm text-red-600 dark:text-red-400">
                  <TrendingDown size={16} className="mr-1" />
                  Despesas: R$ {Number(summary.expenses).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
              {total > 0 && (
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div 
                    className="bg-green-500 h-2.5 rounded-l-full" 
                    style={{ width: `${revenuePercent}%`, display: 'inline-block' }}
                    title={`Receitas: ${revenuePercent.toFixed(1)}%`}
                  ></div>
                  <div 
                    className="bg-red-500 h-2.5 rounded-r-full" 
                    style={{ width: `${expensePercent}%`, display: 'inline-block', marginLeft: revenuePercent > 0 && expensePercent > 0 ? '-1px' : '0' }}
                    title={`Despesas: ${expensePercent.toFixed(1)}%`}
                  ></div>
                </div>
              )}
            </motion.div>
          );
        }) : <p className="text-muted-foreground text-center py-4">Nenhum dado para os últimos 3 meses.</p>}
      </div>
    </motion.div>
  );
};

export default FinancialPastMonthsSummary;