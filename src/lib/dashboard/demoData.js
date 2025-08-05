import { format, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const emptyChartData = { labels: [], datasets: [{ data: [] }] };
const emptyListData = { items: [] };

export const getDemoChartData = (chartId) => {
  if (chartId === 'grafico_faturamento') {
    const labels = [];
    const revenueData = [];
    const expensesData = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = subMonths(now, i);
      labels.push(format(date, 'MMM/yy', { locale: ptBR }));
      revenueData.push(Math.floor(Math.random() * (7000 - 2000 + 1)) + 2000);
      expensesData.push(Math.floor(Math.random() * (3000 - 500 + 1)) + 500);
    }

    return {
      labels,
      datasets: [
        {
          label: 'Faturamento',
          data: revenueData,
          backgroundColor: 'rgba(52, 211, 153, 0.7)',
          borderColor: 'rgba(52, 211, 153, 1)',
          borderWidth: 1,
          borderRadius: 4,
          barPercentage: 0.6,
          categoryPercentage: 0.7,
        },
        {
          label: 'Saídas',
          data: expensesData,
          backgroundColor: 'rgba(239, 68, 68, 0.7)',
          borderColor: 'rgba(239, 68, 68, 1)',
          borderWidth: 1,
          borderRadius: 4,
          barPercentage: 0.6,
          categoryPercentage: 0.7,
        },
      ],
    };
  }

  if (chartId === 'status_trabalhos') {
    const labels = ['Novos Leads', 'Propostas Enviadas', 'Em Andamento', 'Concluídos'];
    const data = [5, 3, 8, 12];
    const backgroundColors = [
      'rgba(59, 130, 246, 0.7)',
      'rgba(234, 179, 8, 0.7)',
      'rgba(139, 92, 246, 0.7)',
      'rgba(16, 185, 129, 0.7)',
    ];
    const borderColors = backgroundColors.map(color => color.replace('0.7', '1'));

    return {
      labels,
      datasets: [{
        label: 'Status dos Trabalhos',
        data,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1,
      }],
    };
  }

  if (chartId === 'ultimos_lancamentos') {
    return {
      items: [
        { id: 'demo1', descricao: 'Ensaio Fotográfico - Família Silva', valor: 850.00, tipo: 'ENTRADA', status: 'PAGO', date: new Date().toISOString() },
        { id: 'demo2', descricao: 'Assinatura Adobe Creative Cloud', valor: 275.00, tipo: 'SAIDA', status: 'PAGO', date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString() },
        { id: 'demo3', descricao: 'Casamento - Joana e Pedro (Entrada)', valor: 2500.00, tipo: 'ENTRADA', status: 'PAGO', date: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString() },
        { id: 'demo4', descricao: 'Aluguel do Estúdio', valor: 600.00, tipo: 'SAIDA', status: 'PAGO', date: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString() },
      ]
    };
  }

  return emptyChartData;
};

export const getDemoGoals = () => {
  return [
    { id: 'demo_goal_1', nome_meta: 'Comprar Nova Lente', valor_meta: 5000, saldo_atual: 1750, icone: 'Camera' },
    { id: 'demo_goal_2', nome_meta: 'Fundo de Emergência', valor_meta: 10000, saldo_atual: 4500, icone: 'Shield' },
    { id: 'demo_goal_3', nome_meta: 'Viagem de Férias', valor_meta: 8000, saldo_atual: 8000, icone: 'Plane' },
  ];
};