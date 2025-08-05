import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChartComponent = ({ chartData, options, isCompact = false }) => {
   if (!chartData || !chartData.labels || !chartData.datasets || chartData.datasets.length === 0 || !chartData.datasets.some(ds => ds.data && ds.data.length > 0)) {
    return <div className="flex items-center justify-center h-full text-muted-foreground">Carregando dados do gráfico...</div>;
  }
  
  const legendFontSize = isCompact ? 10 : 12;

  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
         labels: {
          color: document.documentElement.classList.contains('dark') ? '#e2e8f0' : '#334155',
          font: {
            size: legendFontSize,
          },
          boxWidth: isCompact ? 10 : 12,
          padding: isCompact ? 8 : 10,
        },
      },
      tooltip: {
        backgroundColor: document.documentElement.classList.contains('dark') ? '#1e293b' : '#ffffff',
        titleColor: document.documentElement.classList.contains('dark') ? '#e2e8f0' : '#334155',
        bodyColor: document.documentElement.classList.contains('dark') ? '#e2e8f0' : '#334155',
        borderColor: document.documentElement.classList.contains('dark') ? '#334155' : '#e2e8f0',
        borderWidth: 1,
      }
    },
  };

  const mergedOptions = { ...defaultOptions, ...options };

  return <Pie data={chartData} options={mergedOptions} />;
};

export default PieChartComponent;