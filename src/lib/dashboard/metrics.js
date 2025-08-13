import { isSameMonth, parseISO, subMonths } from 'date-fns';

/**
 * Calcula todas as métricas do dashboard:
 * - Faturamento, despesas, lucro do mês
 * - Valores pendentes, impostos estimados, pró-labore
 * - Progresso do workflow, taxa de conversão, depreciação de equipamentos
 * - Faturamento e despesas mensais (últimos 6 meses)
 * - Contagem de leads válidos e convertidos para cálculo de conversão
 * - Clientes inadimplentes e total de clientes
 *
 * @param {Array} transactions - Lista de transações financeiras
 * @param {Array} workflowCards - Cards de workflow (leads e trabalhos)
 * @param {Array} clients - Lista de clientes
 * @param {Object} settings - Configurações do usuário (regime tributário, etc.)
 * @param {Array} equipments - Lista de equipamentos para depreciação
 * @returns {Object} métricas calculadas
 */
export function getDashboardMetrics(
  transactions,
  workflowCards,
  clients,
  settings,
  equipments
) {
  const now = new Date();

  // Validação de entrada
  if (!Array.isArray(transactions)) {
    transactions = [];
  }
  if (!Array.isArray(workflowCards)) {
    workflowCards = [];
  }
  if (!Array.isArray(clients)) {
    clients = [];
  }
  if (!Array.isArray(equipments)) {
    equipments = [];
  }

  // Filtra transações pagas
  const paidTransactions = transactions.filter((t) => t.status === 'PAGO');
  // Filtra transações pagas no mês atual
  const thisMonthTransactions = paidTransactions.filter((t) => {
    const dateStr = t.data_recebimento || t.data || t.created_at;
    if (!dateStr) return false;
    try {
      return isSameMonth(parseISO(dateStr), now);
    } catch {
      return false;
    }
  });

  // Soma de receitas e despesas totais
  const totalRevenue = paidTransactions
    .filter((t) => t.tipo === 'ENTRADA')
    .reduce((sum, t) => sum + (Number(t.valor) || 0), 0);
  const totalExpenses = paidTransactions
    .filter((t) => t.tipo === 'SAIDA')
    .reduce((sum, t) => sum + (Number(t.valor) || 0), 0);

  // Receitas e despesas (excluindo pró-labore) do mês corrente
  const revenueThisMonth = thisMonthTransactions
    .filter((t) => t.tipo === 'ENTRADA')
    .reduce((sum, t) => sum + (Number(t.valor) || 0), 0);
  const expensesThisMonth = thisMonthTransactions
    .filter((t) => t.tipo === 'SAIDA' && t.category !== 'Pró-labore')
    .reduce((sum, t) => sum + (Number(t.valor) || 0), 0);
  const proLaboreThisMonth = thisMonthTransactions
    .filter((t) => t.tipo === 'SAIDA' && t.category === 'Pró-labore')
    .reduce((sum, t) => sum + (Number(t.valor) || 0), 0);
  const profitThisMonth = revenueThisMonth - expensesThisMonth;

  // Valores pendentes a receber (workflow + transações)
  const workflowPendingAmount = workflowCards
    .filter(
      (card) =>
        card.status !== 'concluido' && card.status !== 'arquivado' && !card.archived
    )
    .reduce((sum, card) => {
      const cardValue = Number(card.value) || 0;
      const pendingAmount = Number(card.pending_amount) || 0;
      return sum + (pendingAmount > 0 ? pendingAmount : cardValue);
    }, 0);
  
  const transactionsPendingAmount = transactions
    .filter((t) => t.tipo === 'ENTRADA' && t.status === 'PENDENTE')
    .reduce((sum, t) => sum + (Number(t.valor) || 0), 0);
  
  const pendingToReceive = workflowPendingAmount + transactionsPendingAmount;

  // Despesas pendentes com vencimento futuro
  const futurePendingPayments = transactions
    .filter(
      (t) =>
        t.tipo === 'SAIDA' &&
        t.status === 'PENDENTE' &&
        t.data_vencimento &&
        new Date(t.data_vencimento) > now
    )
    .reduce((sum, t) => sum + (Number(t.valor) || 0), 0);

  // Transações aguardando liberação (ex.: crédito a liberar)
  const awaitingRelease = transactions
    .filter(
      (t) =>
        t.status === 'AGUARDANDO_LIBERACAO' &&
        t.release_date &&
        new Date(t.release_date) > now
    )
    .reduce((sum, t) => sum + (Number(t.valor) || 0), 0);

  // Cálculo de impostos estimados (MEI, Simples Nacional, etc.)
  let estimatedTax = 0;
  if (settings?.regime_tributario === 'mei') {
    estimatedTax = Number(settings.valor_fixo_mei) || 0;
  } else if (
    settings?.regime_tributario === 'simples' &&
    settings.aliquotas_simples_nacional
  ) {
    const aliquot =
      settings.aliquotas_simples_nacional.find(
        (a) => revenueThisMonth <= a.faixa_faturamento
      )?.aliquota || 0;
    estimatedTax = (revenueThisMonth * aliquot) / 100;
  }

  const netBalance = totalRevenue - totalExpenses;

  // Workflow: cards em andamento e agendados
  const workInProgress = workflowCards.filter(
    (c) => c.status === 'em-andamento' && !c.archived
  ).length;
  const scheduledThisMonth = workflowCards.filter((c) => {
    if (!c.date || c.archived) return false;
    try {
      return isSameMonth(parseISO(c.date), now);
    } catch {
      return false;
    }
  }).length;

  // Cálculo de conversão: leads válidos x convertidos
  const invalidStatuses = ['arquivado', 'excluido', 'cancelado', 'perdido'];
  const conversionStatuses = [
    'em-andamento',
    'concluido',
    'negocio-fechado',
  ];
  const validLeads = (workflowCards || []).filter(
    (c) =>
      !invalidStatuses.includes((c.status || '').toLowerCase())
  );
  const convertedLeads = validLeads.filter((c) =>
    conversionStatuses.includes((c.status || '').toLowerCase())
  );
  const validLeadsCount = validLeads.length;
  const convertedLeadsCount = convertedLeads.length;
  const conversionRate =
    validLeadsCount > 0
      ? (convertedLeadsCount / validLeadsCount) * 100
      : 0;

  // Soma de depreciação mensal dos equipamentos
  const monthlyDepreciation = (equipments || []).reduce(
    (acc, eq) => acc + (Number(eq.depreciacao_mensal) || 0),
    0
  );

  // Faturamento e despesas dos últimos 6 meses
  const monthlyRevenue = {};
  const monthlyExpenses = {};
  for (let i = 5; i >= 0; i--) {
    const date = subMonths(now, i);
    const key = `${date.getMonth() + 1}/${date.getFullYear()}`;
    monthlyRevenue[key] = 0;
    monthlyExpenses[key] = 0;
  }
  paidTransactions.forEach((t) => {
    const dateStr = t.data_recebimento || t.data || t.created_at;
    if (!dateStr) return;
    try {
      const date = parseISO(dateStr);
      const key = `${date.getMonth() + 1}/${date.getFullYear()}`;
      if (!Object.prototype.hasOwnProperty.call(monthlyRevenue, key))
        return;
      if (t.tipo === 'ENTRADA') {
        monthlyRevenue[key] += Number(t.valor) || 0;
      } else if (t.tipo === 'SAIDA') {
        monthlyExpenses[key] += Number(t.valor) || 0;
      }
    } catch {
      // Ignora datas inválidas
    }
  });

  // Clientes inadimplentes (possui pelo menos um ENTRADA pendente e vencida)
  let clientsInadimplentes = 0;
  if (Array.isArray(clients) && Array.isArray(transactions)) {
    const nowDate = new Date();
    const inadClientsSet = new Set();
    transactions.forEach((t) => {
      if (t.tipo === 'ENTRADA' && t.status === 'PENDENTE') {
        const dueDate = t.data_vencimento || t.data;
        const due = dueDate ? new Date(dueDate) : null;
        if (!due || due < nowDate) {
          inadClientsSet.add(t.cliente_id || t.clienteId);
        }
      }
    });
    clientsInadimplentes = Array.from(inadClientsSet).filter(
      (id) => id != null
    ).length;
  }

  // Total de clientes
  const totalClients = Array.isArray(clients) ? clients.length : 0;

  return {
    revenueThisMonth,
    expensesThisMonth,
    profitThisMonth,
    pendingToReceive,
    futurePendingPayments,
    estimatedTax,
    proLaboreThisMonth,
    netBalance,
    workInProgress,
    scheduledThisMonth,
    conversionRate,
    monthlyDepreciation,
    awaitingRelease,
    monthlyRevenue,
    monthlyExpenses,
    clientsInadimplentes,
    totalClients,
    validLeadsCount,
    convertedLeadsCount,
  };
}
