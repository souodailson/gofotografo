import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineController, LineElement, PointElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineController, LineElement, PointElement);

const BarChartComponent = ({ chartData, options, isCompact = false }) => {
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
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: document.documentElement.classList.contains('dark') ? '#1e293b' : '#ffffff',
        titleColor: document.documentElement.classList.contains('dark') ? '#e2e8f0' : '#334155',
        bodyColor: document.documentElement.classList.contains('dark') ? '#e2e8f0' : '#334155',
        borderColor: document.documentElement.classList.contains('dark') ? '#334155' : '#e2e8f0',
        borderWidth: 1,
      }
    },
    scales: {
      x: {
        ticks: {
          color: document.documentElement.classList.contains('dark') ? '#94a3b8' : '#64748b',
          font: { size: isCompact ? 9 : 12 },
        },
        grid: {
          color: document.documentElement.classList.contains('dark') ? '#334155' : '#e2e8f0',
        },
      },
      y: {
        ticks: {
          color: document.documentElement.classList.contains('dark') ? '#94a3b8' : '#64748b',
           font: { size: isCompact ? 9 : 12 },
           callback: function(value) {
            if (value >= 1000) {
              return (value / 1000) + 'k';
            }
            return value;
          }
        },
        grid: {
          color: document.documentElement.classList.contains('dark') ? '#334155' : '#e2e8f0',
        },
      },
    },
  };

  const mergedOptions = { ...defaultOptions, ...options };

  return <Bar data={chartData} options={mergedOptions} />;
};

export default BarChartComponent;