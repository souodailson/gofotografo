import React from 'react';
import { motion } from 'framer-motion';
import { Filter, Calendar as CalendarIcon } from 'lucide-react';
import { PERIOD_FILTERS } from '@/lib/financialConstants';

const selectBaseClasses = "w-full md:w-auto px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent";


const FinancialFilters = ({ filterType, setFilterType, filterPeriod, setFilterPeriod }) => {
  
  const handleTypeChange = (value) => {
    setFilterType(value === "ALL" ? "ALL" : value);
  };

  const handlePeriodChange = (value) => {
    setFilterPeriod(value === "all-periods" ? "all" : value);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-card rounded-xl p-6 shadow-lg border border-border"
    >
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select value={filterType} onChange={(e) => handleTypeChange(e.target.value)} className={selectBaseClasses}>
            <option value="ALL">Todos os tipos</option>
            <option value="ENTRADA">Entradas</option>
            <option value="SAIDA">Saídas</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-muted-foreground" />
          <select value={filterPeriod} onChange={(e) => handlePeriodChange(e.target.value)} className={selectBaseClasses}>
            {PERIOD_FILTERS.map(filter => (
              <option key={filter.value} value={filter.value}>{filter.label}</option>
            ))}
          </select>
        </div>
      </div>
    </motion.div>
  );
};

export default FinancialFilters;