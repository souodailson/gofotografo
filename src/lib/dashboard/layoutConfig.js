/*
 * Build the initial card configuration.  This function accepts
 * the navigation handler (`setActiveTab`) and an optional array
 * of wallets.  For each wallet provided, a dedicated stat card
 * will be added to the returned configuration.  The wallet cards
 * allow users to view the balance of each wallet and click to
 * navigate directly to the financial page filtered by that wallet.
 */
export const getInitialCardConfig = (setActiveTab, wallets = []) => ({
  saldo_geral: {
    id: 'saldo_geral',
    title: 'Saldo Geral',
    type: 'stat',
    icon: 'Landmark',
    color: 'text-green-500',
    onClick: () =>
      setActiveTab('financial', { type: 'all', period: 'all', isDashboardClick: true }),
    defaultSize: { w: 3, h: 2 },
  },
  pagamentos_receber: {
    id: 'pagamentos_receber',
    title: 'A Receber',
    type: 'stat',
    icon: 'TrendingUp',
    color: 'text-blue-500',
    onClick: () =>
      setActiveTab('financial', {
        type: 'entrada',
        status: 'pendente',
        isDashboardClick: true,
      }),
    defaultSize: { w: 3, h: 2 },
  },
  despesas_pagar: {
    id: 'despesas_pagar',
    title: 'Contas a Pagar',
    type: 'stat',
    icon: 'TrendingDown',
    color: 'text-red-500',
    onClick: () =>
      setActiveTab('financial', {
        type: 'saida',
        status: 'pendente',
        period: 'future',
        isDashboardClick: true,
      }),
    defaultSize: { w: 3, h: 2 },
  },
  awaiting_release: {
    id: 'awaiting_release',
    title: 'Aguardando Liberação',
    type: 'stat',
    icon: 'Wallet',
    color: 'text-cyan-500',
    onClick: () =>
      setActiveTab('financial', {
        status: 'AGUARDANDO_LIBERACAO',
        isDashboardClick: true,
      }),
    defaultSize: { w: 3, h: 2 },
  },
  imposto_estimado: {
    id: 'imposto_estimado',
    title: 'Imposto Estimado (Mês)',
    type: 'stat',
    icon: 'Receipt',
    color: 'text-yellow-500',
    onClick: () => setActiveTab('precifique'),
    defaultSize: { w: 3, h: 2 },
  },
  pro_labore: {
    id: 'pro_labore',
    title: 'Pró‑labore (Mês)',
    type: 'stat',
    icon: 'DollarSign',
    color: 'text-indigo-500',
    onClick: () =>
      setActiveTab('financial', {
        type: 'saida',
        category: 'Pró-labore',
        period: 'current_month',
        isDashboardClick: true,
      }),
    defaultSize: { w: 3, h: 2 },
  },
  despesas_mes: {
    id: 'despesas_mes',
    title: 'Despesas (Mês)',
    type: 'stat',
    icon: 'TrendingDown',
    color: 'text-red-500',
    onClick: () =>
      setActiveTab('financial', {
        type: 'saida',
        status: 'pago',
        period: 'current_month',
        isDashboardClick: true,
      }),
    defaultSize: { w: 3, h: 2 },
  },
  lucro_mes: {
    id: 'lucro_mes',
    title: 'Lucro (Mês)',
    type: 'stat',
    icon: 'TrendingUp',
    color: 'text-green-500',
    onClick: () => setActiveTab('reports'),
    defaultSize: { w: 3, h: 2 },
  },
  depreciacao_mensal: {
    id: 'depreciacao_mensal',
    title: 'Depreciação Mensal',
    type: 'stat',
    icon: 'TrendingDown',
    color: 'text-gray-500',
    onClick: () => setActiveTab('my-setup'),
    defaultSize: { w: 3, h: 2 },
  },
  clientes_ativos: {
    id: 'clientes_ativos',
    title: 'Clientes Ativos',
    type: 'smallStat',
    icon: 'Users',
    iconColor: 'text-purple-500',
    onClick: () => setActiveTab('clients'),
    defaultSize: { w: 2, h: 2 },
  },
  trabalhos_em_andamento: {
    id: 'trabalhos_em_andamento',
    title: 'Em Andamento',
    type: 'smallStat',
    icon: 'Briefcase',
    iconColor: 'text-orange-500',
    onClick: () => setActiveTab('workflow', { status: 'em-andamento' }),
    defaultSize: { w: 2, h: 2 },
  },
  trabalhos_agendados: {
    id: 'trabalhos_agendados',
    title: 'Agendados (Mês)',
    type: 'smallStat',
    icon: 'Calendar',
    iconColor: 'text-teal-500',
    onClick: () => setActiveTab('workflow', { status: 'agendado' }),
    defaultSize: { w: 2, h: 2 },
  },
  conversao_clientes: {
    id: 'conversao_clientes',
    title: 'Conversão de Clientes',
    type: 'smallStat',
    icon: 'Target',
    iconColor: 'text-pink-500',
    onClick: () => setActiveTab('workflow'),
    defaultSize: { w: 2, h: 2 },
  },
  grafico_faturamento: {
    id: 'grafico_faturamento',
    title: 'Faturamento Anual',
    type: 'chart',
    chartType: 'bar',
    icon: 'BarChart2',
    color: 'text-green-500',
    onClick: () => setActiveTab('reports'),
    defaultSize: { w: 6, h: 5 },
  },
  status_trabalhos: {
    id: 'status_trabalhos',
    title: 'Status dos Trabalhos',
    type: 'chart',
    chartType: 'pie',
    icon: 'PieChart',
    color: 'text-blue-500',
    onClick: () => setActiveTab('workflow'),
    defaultSize: { w: 3, h: 5 },
  },
  ultimos_lancamentos: {
    id: 'ultimos_lancamentos',
    title: 'Últimos Lançamentos',
    type: 'chart',
    chartType: 'list',
    icon: 'List',
    color: 'text-gray-500',
    onClick: () => setActiveTab('financial'),
    defaultSize: { w: 3, h: 5 },
  },
  lembretes: {
    id: 'lembretes',
    title: 'Lembretes e Tarefas',
    type: 'reminders',
    icon: 'BellRing',
    color: 'text-yellow-500',
    onClick: () => setActiveTab('workflow'),
    defaultSize: { w: 4, h: 5 },
  },
  metas_reserva: {
    id: 'metas_reserva',
    title: 'Resumo das Metas',
    type: 'goals_summary',
    icon: 'Target',
    color: 'text-cyan-500',
    onClick: () => setActiveTab('reserva-inteligente'),
    defaultSize: { w: 4, h: 5 },
  },

  // Dynamically generated wallet cards.
  ...((wallets || []).reduce((acc, wallet) => {
    const id = `wallet_${wallet.id}`;
    acc[id] = {
      id,
      title: wallet.name || 'Carteira',
      type: 'stat',
      icon: 'Wallet',
      iconUrl: wallet.icon_url || undefined,
      color: 'text-blue-500',
      onClick: () =>
        setActiveTab('financial', {
          walletId: wallet.id,
          isDashboardClick: true,
        }),
      defaultSize: { w: 3, h: 2 },
    };
    return acc;
  }, {})),

  // New charts
  grafico_despesas_faturamento: {
    id: 'grafico_despesas_faturamento',
    title: 'Faturamento x Despesas',
    type: 'chart',
    chartType: 'bar',
    icon: 'BarChart3',
    color: 'text-purple-500',
    onClick: () => setActiveTab('reports'),
    defaultSize: { w: 6, h: 5 },
  },
  grafico_despesas_lucro: {
    id: 'grafico_despesas_lucro',
    title: 'Lucro x Despesas',
    type: 'chart',
    chartType: 'bar',
    icon: 'BarChartBig',
    color: 'text-orange-500',
    onClick: () => setActiveTab('reports'),
    defaultSize: { w: 6, h: 5 },
  },
  grafico_conversao_leads: {
    id: 'grafico_conversao_leads',
    title: 'Conversão de Leads',
    type: 'chart',
    chartType: 'pie',
    icon: 'PieChart',
    color: 'text-pink-500',
    onClick: () => setActiveTab('workflow'),
    defaultSize: { w: 3, h: 5 },
  },
  grafico_inadimplentes: {
    id: 'grafico_inadimplentes',
    title: 'Clientes Inadimplentes',
    type: 'chart',
    chartType: 'pie',
    icon: 'Users',
    color: 'text-red-500',
    onClick: () => setActiveTab('clients', { status: 'inadimplentes' }),
    defaultSize: { w: 3, h: 5 },
  },
});

// Compute a default “lg” layout and then adapt it for each breakpoint.
export const getDefaultLayout = (config) => {
  const baseLayout = [
    { i: 'saldo_geral', x: 0, y: 0, w: 3, h: 2 },
    { i: 'pagamentos_receber', x: 3, y: 0, w: 3, h: 2 },
    { i: 'despesas_pagar', x: 6, y: 0, w: 3, h: 2 },
    { i: 'awaiting_release', x: 9, y: 0, w: 3, h: 2 },

    { i: 'grafico_faturamento', x: 0, y: 2, w: 6, h: 5 },
    { i: 'ultimos_lancamentos', x: 6, y: 2, w: 3, h: 5 },
    { i: 'status_trabalhos', x: 9, y: 2, w: 3, h: 5 },

    { i: 'lembretes', x: 0, y: 7, w: 4, h: 5 },
    { i: 'metas_reserva', x: 4, y: 7, w: 4, h: 5 },

    { i: 'clientes_ativos', x: 8, y: 7, w: 2, h: 2 },
    { i: 'trabalhos_em_andamento', x: 10, y: 7, w: 2, h: 2 },
    { i: 'trabalhos_agendados', x: 8, y: 9, w: 2, h: 2 },
    { i: 'conversao_clientes', x: 10, y: 9, w: 2, h: 2 },
  ];

  const layout = [...baseLayout];
  let lastY = Math.max(...layout.map((item) => (item.y || 0) + (item.h || 0)), 0);

  // Insert wallet cards after the base cards.
  Object.keys(config).forEach((key) => {
    if (key.startsWith('wallet_') && !layout.some((item) => item.i === key)) {
      const cardConfig = config[key];
      layout.push({
        i: key,
        x: 0,
        y: lastY,
        w: cardConfig.defaultSize?.w || 3,
        h: cardConfig.defaultSize?.h || 2,
      });
      lastY += cardConfig.defaultSize?.h || 2;
    }
  });

  // Append new chart cards at the bottom if they are present in the config.
  const extraCards = [
    { id: 'grafico_despesas_faturamento', x: 0, y: lastY, w: 6, h: 5 },
    { id: 'grafico_despesas_lucro', x: 6, y: lastY, w: 6, h: 5 },
    { id: 'grafico_conversao_leads', x: 0, y: lastY + 5, w: 3, h: 5 },
    { id: 'grafico_inadimplentes', x: 3, y: lastY + 5, w: 3, h: 5 },
  ];
  extraCards.forEach((card) => {
    if (config[card.id] && !layout.some((item) => item.i === card.id)) {
      layout.push({
        i: card.id,
        x: card.x,
        y: card.y,
        w: card.w,
        h: card.h,
      });
    }
  });

  return layout;
};

export const getTabletLayout = (lgLayout, config) => {
  return lgLayout.map((item) => {
    const cardConfig = config[item.i];
    let newItem = { ...item };
    if (cardConfig.type === 'stat') {
      newItem.w = 5;
      newItem.h = 2;
    } else if (cardConfig.type === 'smallStat') {
      newItem.w = 2;
      newItem.h = 2;
    } else {
      newItem.w = Math.min(10, item.w * 1.5);
    }
    return newItem;
  });
};

export const getMobileLayout = (lgLayout, config) => {
  let y = 0;
  return lgLayout.map((item) => {
    const cardConfig = config[item.i];
    let h;
    switch (cardConfig.type) {
      case 'stat':
      case 'smallStat':
        h = 2;
        break;
      case 'chart':
        h = cardConfig.chartType === 'list' ? 6 : 5;
        break;
      case 'reminders':
      case 'goals_summary':
        h = 6;
        break;
      default:
        h = 4;
    }
    const layoutItem = { i: item.i, x: 0, y: y, w: 4, h: h };
    y += h;
    return layoutItem;
  });
};

export const getExtraSmallMobileLayout = (lgLayout, config) => {
  let y = 0;
  return lgLayout.map((item) => {
    const cardConfig = config[item.i];
    let h;
    switch (cardConfig.type) {
      case 'stat':
      case 'smallStat':
        h = 2;
        break;
      case 'chart':
        h = cardConfig.chartType === 'list' ? 7 : 5;
        break;
      case 'reminders':
      case 'goals_summary':
        h = 7;
        break;
      default:
        h = 4;
    }
    const layoutItem = { i: item.i, x: 0, y: y, w: 2, h: h };
    y += h;
    return layoutItem;
  });
};

export const getExtraExtraSmallMobileLayout = (lgLayout, config) => {
  let y = 0;
  return lgLayout.map((item) => {
    const cardConfig = config[item.i];
    let h;
    switch (cardConfig.type) {
      case 'stat':
      case 'smallStat':
        h = 2;
        break;
      case 'chart':
        h = cardConfig.chartType === 'list' ? 8 : 6;
        break;
      case 'reminders':
      case 'goals_summary':
        h = 8;
        break;
      default:
        h = 5;
    }
    const layoutItem = { i: item.i, x: 0, y: y, w: 2, h: h };
    y += h;
    return layoutItem;
  });
};

// Export default object with helpers for compatibility with bundlers that
// may not detect named exports properly.
const layoutConfigHelpers = {
  getInitialCardConfig,
  getDefaultLayout,
  getTabletLayout,
  getMobileLayout,
  getExtraSmallMobileLayout,
  getExtraExtraSmallMobileLayout,
};
export default layoutConfigHelpers;

// ---------------------------------------------------------------------------
// Additional exports for backward compatibility
//
// These restore the behaviour of an earlier version of this module,
// which exposed `defaultLayouts` and `componentMap`.  They are defined
// at the end of the file to ensure that helper functions like
// `getDefaultLayout` have been initialized.

const __noopSetActiveTab = () => {};
const __defaultDashboardConfig = getInitialCardConfig(__noopSetActiveTab, []);

export const defaultLayouts = {
  lg: getDefaultLayout(__defaultDashboardConfig),
  md: getTabletLayout(
    getDefaultLayout(__defaultDashboardConfig),
    __defaultDashboardConfig,
  ),
  sm: getMobileLayout(
    getDefaultLayout(__defaultDashboardConfig),
    __defaultDashboardConfig,
  ),
  xs: getExtraSmallMobileLayout(
    getDefaultLayout(__defaultDashboardConfig),
    __defaultDashboardConfig,
  ),
  xxs: getExtraExtraSmallMobileLayout(
    getDefaultLayout(__defaultDashboardConfig),
    __defaultDashboardConfig,
  ),
};

// Provide an empty component map for legacy imports.  The original
// implementation associated each card ID with a specific component;
// this logic now resides in DashboardCard.jsx.
export const componentMap = {};
