import React from 'react';

const PeriodSelector = ({ selectedPeriod, setSelectedPeriod }) => (
  <select
    value={selectedPeriod}
    onChange={(e) => setSelectedPeriod(e.target.value)}
    className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
  >
    <option value="last_month">Último mês</option>
    <option value="last_3_months">Últimos 3 meses</option>
    <option value="last_year">Último ano</option>
    <option value="all_time">Todo o período</option>
  </select>
);

export default PeriodSelector;