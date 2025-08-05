import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Chart } from 'chart.js';

const addHeader = (pdf, settings, reportTitle, yPos) => {
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const margin = 15;
  let currentY = yPos;

  if (settings.logo) {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = settings.logo;
      
      const imageWidth = 30; 
      const imageHeight = (img.height * imageWidth) / img.width;
      pdf.addImage(img, 'PNG', margin, currentY, imageWidth, imageHeight > 15 ? 15 : imageHeight);
      currentY += (imageHeight > 15 ? 15 : imageHeight) + 2;
    } catch (e) {
      console.warn("Não foi possível carregar o logo para o PDF:", e);
      if (settings.business_name) {
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'bold');
        pdf.text(settings.business_name, margin, currentY);
        currentY += 6;
      }
    }
  } else if (settings.business_name) {
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    pdf.text(settings.business_name, margin, currentY);
    currentY += 6;
  }

  if (settings.business_name && settings.logo) {
     pdf.setFontSize(10);
     pdf.setFont(undefined, 'normal');
     pdf.text(settings.business_name, margin, currentY);
     currentY += 5;
  }

  if (settings.cnpj) {
    pdf.setFontSize(9);
    pdf.text(`CNPJ: ${settings.cnpj}`, margin, currentY);
    currentY += 4;
  }
  if (settings.address) {
    pdf.setFontSize(9);
    const addressLines = pdf.splitTextToSize(settings.address, pdfWidth - margin * 2);
    addressLines.forEach(line => {
      pdf.text(line, margin, currentY);
      currentY += 4;
    });
  }
  if (settings.contact_email) {
    pdf.setFontSize(9);
    pdf.text(`Email: ${settings.contact_email}`, margin, currentY);
    currentY += 4;
  }
  if (settings.phones && settings.phones.length > 0 && settings.phones[0].number) {
    pdf.setFontSize(9);
    pdf.text(`Telefone: ${settings.phones[0].number}`, margin, currentY);
    currentY += 4;
  }
  
  currentY += 5; 
  pdf.setLineWidth(0.5);
  pdf.line(margin, currentY, pdfWidth - margin, currentY);
  currentY += 8;

  pdf.setFontSize(16);
  pdf.setFont(undefined, 'bold');
  const titleWidth = pdf.getTextWidth(reportTitle);
  pdf.text(reportTitle, (pdfWidth - titleWidth) / 2, currentY);
  currentY += 8;
  
  pdf.setFontSize(9);
  pdf.setFont(undefined, 'normal');
  const generationDate = `Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`;
  const dateWidth = pdf.getTextWidth(generationDate);
  pdf.text(generationDate, pdfWidth - margin - dateWidth, margin + 5); 

  return currentY; 
};

const addFooter = (pdf) => {
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const pageCount = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.text(`Página ${i} de ${pageCount}`, pdfWidth - margin - 20, pdfHeight - margin + 10);
  }
};

const addClientInfoToPdf = (pdf, client, yPos, margin) => {
  let currentY = yPos;
  if (client) {
    pdf.setFontSize(11);
    pdf.setFont(undefined, 'bold');
    pdf.text('Informações do Cliente:', margin, currentY);
    currentY += 6;
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'normal');
    pdf.text(`Nome: ${client.name || 'N/A'}`, margin, currentY);
    currentY += 5;
    if (client.email) {
      pdf.text(`Email: ${client.email}`, margin, currentY);
      currentY += 5;
    }
    if (client.phone) {
      pdf.text(`Telefone: ${client.phone}`, margin, currentY);
      currentY += 5;
    }
    currentY += 3; 
  }
  return currentY;
};

const addChartToPdf = async (pdf, chartData, chartType, x, y, width, height) => {
  if (!chartData || !chartData.labels || chartData.labels.length === 0 || !chartData.datasets || chartData.datasets.length === 0 || !chartData.datasets.some(ds => ds.data && ds.data.length > 0)) {
    console.warn("Dados do gráfico insuficientes para renderização no PDF.");
    return;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width * 3; 
  canvas.height = height * 3;
  const ctx = canvas.getContext('2d');

  new Chart(ctx, {
    type: chartType,
    data: chartData,
    options: {
      responsive: false, 
      animation: { duration: 0 }, 
      devicePixelRatio: 3,
      plugins: {
        legend: { display: true, position: 'bottom' },
      },
    },
  });
  
  await new Promise(resolve => setTimeout(resolve, 500));

  const imgData = canvas.toDataURL('image/png');
  pdf.addImage(imgData, 'PNG', x, y, width, height);
  canvas.remove();
};


const generatePdfCore = async (reportTitle, settings, dataForPdf, period, clientInfo = null) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const margin = 15;
  let yPosition = margin;

  yPosition = addHeader(pdf, settings, reportTitle, yPosition);
  
  if (clientInfo) {
    yPosition = addClientInfoToPdf(pdf, clientInfo, yPosition, margin);
  }

  pdf.setFontSize(10);
  pdf.setFont(undefined, 'normal');
  pdf.text(`Período do Relatório: ${period}`, margin, yPosition);
  yPosition += 8;

  if (dataForPdf.sections) {
    for (const section of dataForPdf.sections) {
      if (yPosition > pdf.internal.pageSize.getHeight() - margin - 20) {
        pdf.addPage();
        yPosition = margin;
        yPosition = addHeader(pdf, settings, `${reportTitle} (cont.)`, yPosition);
      }
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'bold');
      pdf.text(section.title, margin, yPosition);
      yPosition += 7;
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');

      if (section.summary) {
        section.summary.forEach(item => {
          if (yPosition > pdf.internal.pageSize.getHeight() - margin - 10) {
            pdf.addPage();
            yPosition = margin;
            yPosition = addHeader(pdf, settings, `${reportTitle} (cont.)`, yPosition);
            pdf.setFontSize(12);
            pdf.setFont(undefined, 'bold');
            pdf.text(`${section.title} (cont.)`, margin, yPosition);
            yPosition += 7;
            pdf.setFontSize(10);
            pdf.setFont(undefined, 'normal');
          }
          pdf.text(`${item.label}: ${item.value}`, margin + 5, yPosition);
          yPosition += 5;
        });
        yPosition += 3;
      }

      if (section.tableData && section.tableData.rows && section.tableData.rows.length > 0) {
        if (yPosition > pdf.internal.pageSize.getHeight() - margin - 30) { 
          pdf.addPage();
          yPosition = margin;
          yPosition = addHeader(pdf, settings, `${reportTitle} (cont.)`, yPosition);
          pdf.setFontSize(12);
          pdf.setFont(undefined, 'bold');
          pdf.text(`${section.title} (cont.)`, margin, yPosition);
          yPosition += 7;
        }
        pdf.autoTable({
          head: [section.tableData.headers],
          body: section.tableData.rows,
          startY: yPosition,
          theme: 'grid',
          headStyles: { fillColor: [62, 18, 128], textColor: 255, fontStyle: 'bold' },
          styles: { fontSize: 8, cellPadding: 1.5 },
          columnStyles: { 0: { cellWidth: 'auto' } },
          didDrawPage: (hookData) => { yPosition = hookData.cursor.y + 5; }
        });
        yPosition = pdf.previousAutoTable.finalY + 10;
      } else if (section.tableData) {
         pdf.text("Nenhum dado para exibir nesta tabela.", margin + 5, yPosition);
         yPosition += 8;
      }
      
      if (section.chartData && section.chartType) {
        if (yPosition > pdf.internal.pageSize.getHeight() - margin - 60) { 
            pdf.addPage();
            yPosition = margin;
            yPosition = addHeader(pdf, settings, `${reportTitle} (cont.)`, yPosition);
            pdf.setFontSize(12);
            pdf.setFont(undefined, 'bold');
            pdf.text(`${section.title} (cont.)`, margin, yPosition);
            yPosition += 7;
        }
        const chartWidth = pdfWidth - margin * 2;
        const chartHeight = 50; 
        await addChartToPdf(pdf, section.chartData, section.chartType, margin, yPosition, chartWidth, chartHeight);
        yPosition += chartHeight + 10;
      }
      yPosition += 5; 
    }
  }

  addFooter(pdf);
  pdf.save(`${reportTitle.toLowerCase().replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`);
};


export const generateFinancialReport = async (data, settings, period, chartData) => {
  const reportData = {
    sections: [
      {
        title: "Resumo Financeiro",
        summary: [
          { label: "Receita Total (Paga)", value: `R$ ${data.quickStats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
          { label: "Despesa Operacional Total (Paga)", value: `R$ ${data.quickStats.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
          { label: "Lucro Operacional (Receitas - Desp. Operacionais)", value: `R$ ${(data.quickStats.operationalProfit).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
          { label: "Total Pró-labore (Pago)", value: `R$ ${data.quickStats.totalProLabore.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
          { label: "Lucro Líquido Final (Lucro Operacional - Pró-labore)", value: `R$ ${(data.quickStats.netProfit).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` }
        ],
        chartData: chartData?.revenueExpense,
        chartType: 'bar'
      },
      {
        title: "Transações do Período (Pagas)",
        tableData: {
          headers: ["Data Receb.", "Descrição", "Categoria", "Tipo", "Valor (R$)"],
          rows: data.transactions.map(t => [
            t.data_recebimento ? format(parseISO(t.data_recebimento), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A',
            t.descricao,
            t.category || 'Sem categoria', 
            t.tipo === 'ENTRADA' ? 'Receita' : 'Despesa',
            Number(t.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          ])
        }
      }
    ]
  };
  if (chartData?.categoryDistribution && chartData.categoryDistribution.labels.length > 0) {
    reportData.sections.push({
        title: "Distribuição de Receitas por Categoria",
        chartData: chartData.categoryDistribution,
        chartType: 'pie'
    });
  }
  await generatePdfCore('Relatório Financeiro Detalhado', settings, reportData, period);
};

export const generateClientReport = async (data, settings, period) => {
  const reportData = {
    sections: [
      {
        title: "Estatísticas de Clientes",
        summary: [
          { label: "Novos Clientes no Período", value: data.quickStats.newClients }
        ]
      },
      {
        title: "Clientes com Projetos no Período",
        tableData: {
          headers: ["Nome", "Cadastrado em", "Nº Projetos", "Valor Total Projetos (R$)"],
          rows: data.clientsWithProjects.map(client => [
            client.name,
            client.created_at ? format(parseISO(client.created_at), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A',
            client.projectCount,
            Number(client.totalValue).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          ])
        }
      }
    ]
  };
  await generatePdfCore('Relatório de Desempenho de Clientes', settings, reportData, period);
};

export const generateProjectReport = async (data, settings, period) => {
  const reportData = {
    sections: [
      {
        title: "Estatísticas de Projetos",
        summary: [
          { label: "Total de Projetos Concluídos no Período", value: data.quickStats.completedProjects }
        ]
      },
      {
        title: "Lista de Projetos",
        tableData: {
          headers: ["Título", "Cliente", "Status", "Valor (R$)", "Criado em"],
          rows: data.projects.map(project => [
            project.title || 'Projeto sem título',
            project.client_name || 'Não informado',
            data.getStatusLabel ? data.getStatusLabel(project.status) : project.status,
            Number(project.value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            project.created_at ? format(parseISO(project.created_at), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A'
          ])
        }
      }
    ]
  };
  await generatePdfCore('Relatório de Produtividade de Projetos', settings, reportData, period);
};

export const generateFullReport = async (data, settings, period, chartData) => {
    const reportData = {
      sections: [
        {
          title: "Resumo Financeiro",
          summary: [
            { label: "Receita Total (Paga)", value: `R$ ${data.quickStats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
            { label: "Despesa Operacional Total (Paga)", value: `R$ ${data.quickStats.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
            { label: "Lucro Operacional", value: `R$ ${(data.quickStats.operationalProfit).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
            { label: "Total Pró-labore (Pago)", value: `R$ ${data.quickStats.totalProLabore.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
            { label: "Lucro Líquido Final", value: `R$ ${(data.quickStats.netProfit).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
          ],
          chartData: chartData?.revenueExpense,
          chartType: 'bar'
        },
        {
          title: "Transações Financeiras (Pagas)",
          tableData: {
            headers: ["Data Receb.", "Descrição", "Categoria", "Tipo", "Valor (R$)"],
            rows: data.transactions.map(t => [
              t.data_recebimento ? format(parseISO(t.data_recebimento), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A',
              t.descricao,
              t.category || 'Sem categoria',
              t.tipo === 'ENTRADA' ? 'Receita' : 'Despesa',
              Number(t.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            ])
          }
        },
        {
          title: "Resumo de Clientes",
          summary: [
            { label: "Novos Clientes no Período", value: data.quickStats.newClients },
          ],
        },
        {
          title: "Clientes com Projetos",
          tableData: {
            headers: ["Nome", "Nº Projetos", "Valor Total Projetos (R$)"],
            rows: data.clientsWithProjects.map(client => [
              client.name,
              client.projectCount,
              Number(client.totalValue).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            ])
          }
        },
        {
          title: "Resumo de Projetos",
          summary: [
            { label: "Total de Projetos Concluídos", value: data.quickStats.completedProjects }
          ]
        },
        {
          title: "Lista de Projetos",
          tableData: {
            headers: ["Título", "Cliente", "Status", "Valor (R$)"],
            rows: data.projects.map(project => [
              project.title || 'Projeto sem título',
              project.client_name || 'Não informado',
              data.getStatusLabel ? data.getStatusLabel(project.status) : project.status,
              Number(project.value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            ])
          }
        }
      ]
    };
    if (chartData?.categoryDistribution && chartData.categoryDistribution.labels.length > 0) {
      reportData.sections.splice(2,0, { 
          title: "Distribuição de Receitas por Categoria",
          chartData: chartData.categoryDistribution,
          chartType: 'pie'
      });
    }
    await generatePdfCore('Relatório Completo Consolidado', settings, reportData, period);
};