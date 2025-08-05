// Calculates financial summary from a list of transactions
export const calculateFinancialSummary = (transactions) => {
  if (!transactions || !Array.isArray(transactions)) {
    return {
      transactions: [],
      totalRevenue: 0,
      totalExpenses: 0,
      operationalProfit: 0,
      totalProLabore: 0,
      netBalance: 0,
      pendingPayments: 0 
    };
  }

  const totalRevenue = transactions
    .filter(t => t.tipo === 'ENTRADA' && t.status === 'PAGO')
    .reduce((sum, t) => sum + Number(t.valor), 0);

  const totalOperationalExpenses = transactions
    .filter(t => t.tipo === 'SAIDA' && t.status === 'PAGO' && t.category !== 'Pró-labore')
    .reduce((sum, t) => sum + Number(t.valor), 0);
  
  const totalProLabore = transactions
    .filter(t => t.tipo === 'SAIDA' && t.status === 'PAGO' && t.category === 'Pró-labore')
    .reduce((sum, t) => sum + Number(t.valor), 0);

  const operationalProfit = totalRevenue - totalOperationalExpenses;
  const netBalance = operationalProfit - totalProLabore;

  const pendingPayments = transactions
    .filter(t => t.tipo === 'ENTRADA' && t.status === 'PENDENTE')
    .reduce((sum, t) => sum + Number(t.valor), 0);

  return {
    transactions, 
    totalRevenue,
    totalExpenses: totalOperationalExpenses, // Renamed to reflect operational expenses
    operationalProfit,
    totalProLabore,
    netBalance,
    pendingPayments
  };
};