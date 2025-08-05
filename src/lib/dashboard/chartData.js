import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Gera dados de gráficos para o dashboard. Cada caso do switch refere-se a
 * um tipo de card (bar chart, pie chart, lista de lançamentos, etc.).
 *
 * @param {string} cardId - ID do card
 * @param {Object} metrics - métricas calculadas em metrics.js
 * @param {Array} workflowCards - cards do workflow (leads e trabalhos)
 * @param {Array} transactions - lista de transações
 * @param {Function} setActiveTab - função de navegação do dashboard
 * @param {Array} wallets - carteiras cadastradas (para listar nome/ícone)
 * @returns {Object} dados para o gráfico
 */
export const getChartDataForDashboard = (
  cardId,
  metrics,
  workflowCards,
  transactions,
  setActiveTab,
  wallets = []
) => {
  switch (cardId) {
    // Gráfico de barras com faturamento mensal
    case 'grafico_faturamento': {
      if (!metrics || !metrics.monthlyRevenue) {
        return { labels: [], datasets: [] };
      }
      const monthlyRevenue = metrics.monthlyRevenue;
      const labelsSorted = Object.keys(monthlyRevenue).sort((a, b) => {
        const [aMonth, aYear] = a.split('/');
        const [bMonth, bYear] = b.split('/');
        return new Date(aYear, aMonth - 1) - new Date(bYear, bMonth - 1);
      });
      return {
        labels: labelsSorted.map((l) => {
          const [month, year] = l.split('/');
          const date = new Date(year, month - 1);
          return format(date, 'MMM/yy', { locale: ptBR });
        }),
        datasets: [
          {
            label: 'Faturamento',
            data: labelsSorted.map((l) => monthlyRevenue[l]),
            backgroundColor: 'rgba(59, 130, 246, 0.6)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1,
            tension: 0.4,
          },
        ],
      };
    }

    // Gráfico de barras comparando faturamento x despesas
    case 'grafico_despesas_faturamento': {
      if (!metrics || !metrics.monthlyRevenue || !metrics.monthlyExpenses) {
        return { labels: [], datasets: [] };
      }
      const rev = metrics.monthlyRevenue;
      const exp = metrics.monthlyExpenses;
      const keys = Object.keys(rev).sort((a, b) => {
        const [aM, aY] = a.split('/');
        const [bM, bY] = b.split('/');
        return new Date(aY, aM - 1) - new Date(bY, bM - 1);
      });
      return {
        labels: keys.map((key) => {
          const [month, year] = key.split('/');
          const date = new Date(year, month - 1);
          return format(date, 'MMM/yy', { locale: ptBR });
        }),
        datasets: [
          {
            label: 'Faturamento',
            data: keys.map((key) => rev[key]),
            backgroundColor: 'rgba(34, 197, 94, 0.6)',
            borderColor: 'rgba(34, 197, 94, 1)',
            borderWidth: 1,
          },
          {
            label: 'Despesas',
            data: keys.map((key) => exp[key]),
            backgroundColor: 'rgba(239, 68, 68, 0.6)',
            borderColor: 'rgba(239, 68, 68, 1)',
            borderWidth: 1,
          },
        ],
      };
    }

    // Gráfico de barras comparando lucro x despesas
    case 'grafico_despesas_lucro': {
      if (!metrics || !metrics.monthlyRevenue || !metrics.monthlyExpenses) {
        return { labels: [], datasets: [] };
      }
      const rev2 = metrics.monthlyRevenue;
      const exp2 = metrics.monthlyExpenses;
      const keys2 = Object.keys(rev2).sort((a, b) => {
        const [aM, aY] = a.split('/');
        const [bM, bY] = b.split('/');
        return new Date(aY, aM - 1) - new Date(bY, bM - 1);
      });
      return {
        labels: keys2.map((key) => {
          const [month, year] = key.split('/');
          const date = new Date(year, month - 1);
          return format(date, 'MMM/yy', { locale: ptBR });
        }),
        datasets: [
          {
            label: 'Lucro',
            data: keys2.map((key) => rev2[key] - exp2[key]),
            backgroundColor: 'rgba(52, 211, 153, 0.6)',
            borderColor: 'rgba(52, 211, 153, 1)',
            borderWidth: 1,
          },
          {
            label: 'Despesas',
            data: keys2.map((key) => exp2[key]),
            backgroundColor: 'rgba(234, 179, 8, 0.6)',
            borderColor: 'rgba(234, 179, 8, 1)',
            borderWidth: 1,
          },
        ],
      };
    }

    // Gráfico de pizza para conversão de leads (0–100%)
    case 'grafico_conversao_leads': {
      // Utiliza contagem de leads válidos e convertidos das métricas (se existir)
      let validCount = metrics?.validLeadsCount;
      let convertedCount = metrics?.convertedLeadsCount;
      // Caso não existam esses campos, calcula localmente a partir do workflow
      if (
        typeof validCount !== 'number' ||
        typeof convertedCount !== 'number'
      ) {
        if (!Array.isArray(workflowCards)) {
          return { labels: [], datasets: [] };
        }
        const invalidStatuses = ['arquivado', 'excluido', 'cancelado', 'perdido'];
        const conversionStatuses = [
          'em-andamento',
          'concluido',
          'negocio-fechado',
        ];
        const validLeads = (workflowCards || []).filter(
          (c) =>
            !invalidStatuses.includes(
              (c.status || '').toLowerCase()
            )
        );
        const convertedLeads = validLeads.filter((c) =>
          conversionStatuses.includes(
            (c.status || '').toLowerCase()
          )
        );
        validCount = validLeads.length;
        convertedCount = convertedLeads.length;
      }
      const notConverted = validCount - convertedCount;
      if (validCount === 0) {
        return {
          labels: ['Sem dados'],
          datasets: [
            {
              data: [1],
              backgroundColor: ['#E5E7EB'],
            },
          ],
        };
      }
      return {
        labels: ['Convertidos', 'Não convertidos'],
        datasets: [
          {
            label: 'Conversão de Leads',
            data: [convertedCount, notConverted],
            backgroundColor: [
              'rgba(59, 130, 246, 0.6)',
              'rgba(156, 163, 175, 0.6)',
            ],
            borderColor: [
              'rgba(59, 130, 246, 1)',
              'rgba(156, 163, 175, 1)',
            ],
            borderWidth: 1,
          },
        ],
      };
    }

    // Gráfico de pizza para inadimplentes (inadimplentes x outros)
    case 'grafico_inadimplentes': {
      if (
        !metrics ||
        typeof metrics.clientsInadimplentes !== 'number' ||
        typeof metrics.totalClients !== 'number'
      ) {
        return { labels: [], datasets: [] };
      }
      const inad = metrics.clientsInadimplentes;
      const total = metrics.totalClients;
      if (total === 0) {
        return {
          labels: ['Sem clientes'],
          datasets: [
            {
              data: [1],
              backgroundColor: ['#E5E7EB'],
            },
          ],
        };
      }
      const outros = Math.max(total - inad, 0);
      return {
        labels: ['Inadimplentes', 'Outros'],
        datasets: [
          {
            label: 'Clientes',
            data: [inad, outros],
            backgroundColor: [
              'rgba(239, 68, 68, 0.6)',
              'rgba(156, 163, 175, 0.6)',
            ],
            borderColor: [
              'rgba(239, 68, 68, 1)',
              'rgba(156, 163, 175, 1)',
            ],
            borderWidth: 1,
          },
        ],
      };
    }

    // Gráfico de pizza para status dos trabalhos
    case 'status_trabalhos': {
      const statusCounts = (workflowCards || []).reduce(
        (acc, card) => {
          const status = card.status || 'sem-status';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        },
        {}
      );
      return {
        labels: Object.keys(statusCounts),
        datasets: [
          {
            label: 'Status dos Trabalhos',
            data: Object.values(statusCounts),
            backgroundColor: [
              'rgba(255, 99, 132, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(75, 192, 192, 0.6)',
              'rgba(153, 102, 255, 0.6)',
              'rgba(255, 159, 64, 0.6)',
            ],
          },
        ],
      };
    }

    // Lista de últimos lançamentos (transações mais recentes)
    case 'ultimos_lancamentos': {
      // Ordena as transações pelo campo de criação, decrescentemente
      const sortedTransactions = (transactions || [])
        .slice()
        .sort((a, b) => {
          const dateA = a.created_at
            ? new Date(a.created_at)
            : new Date(a.data_recebimento || a.data || 0);
          const dateB = b.created_at
            ? new Date(b.created_at)
            : new Date(b.data_recebimento || b.data || 0);
          return dateB - dateA;
        });
      return {
        items: sortedTransactions.slice(0, 10).map((t) => ({
          ...t,
          date: t.data,
          wallet: (wallets || []).find((w) => w.id === t.wallet_id),
        })),
      };
    }

    default:
      return { labels: [], datasets: [] };
  }
};
