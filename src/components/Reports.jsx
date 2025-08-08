import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, PieChart as PieIcon, TrendingUp, Filter, Calendar as CalendarIconLucide, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import BarChartComponent from '@/components/charts/BarChart'; 
import PieChartComponent from '@/components/charts/PieChart';
import { 
  generateFinancialReport, 
  generateClientReport, 
  generateProjectReport, 
  generateFullReport 
} from '@/lib/reportUtils';
import 'jspdf-autotable';
import ReportHeader from './reports/ReportHeader';
import ReportTypeCard from './reports/ReportTypeCard';
import { useData } from '@/contexts/DataContext';
import useReportData from '@/hooks/useReportData';
import PeriodSelector from './reports/PeriodSelector';
import CategorySelector from './reports/CategorySelector';
import useMobileLayout from '@/hooks/useMobileLayout';

const Reports = () => {
  const { toast } = useToast();
  const { settings } = useData(); 
  const [selectedPeriod, setSelectedPeriod] = useState('last_3_months');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { isMobile } = useMobileLayout();

  const {
    loadingReportData,
    revenueExpenseData,
    categoryDistributionData,
    quickStats,
    detailedReportData,
    fetchReportData,
  } = useReportData(selectedPeriod, selectedCategory);

  const selectedPeriodLabel = (periodKey) => {
    const labels = {
      last_month: 'Último Mês',
      last_3_months: 'Últimos 3 Meses',
      last_year: 'Último Ano',
      all_time: 'Todo o Período'
    };
    return labels[periodKey] || periodKey;
  };
  
  const reportTypes = [
    {
      title: 'Relatório Financeiro Detalhado',
      description: 'Análise completa de receitas, despesas e lucros.',
      icon: TrendingUp,
      color: 'from-customPurple to-customGreen',
      reportKey: 'financial_detailed',
      action: () => generateFinancialReport(detailedReportData, settings, selectedPeriodLabel(selectedPeriod), {revenueExpense: revenueExpenseData, categoryDistribution: categoryDistributionData})
    },
    {
      title: 'Relatório de Desempenho de Clientes',
      description: 'Estatísticas sobre aquisição e valor por cliente.',
      icon: PieIcon,
      color: 'from-blue-500 to-cyan-600',
      reportKey: 'client_performance',
      action: () => generateClientReport(detailedReportData, settings, selectedPeriodLabel(selectedPeriod))
    },
    {
      title: 'Relatório de Produtividade de Projetos',
      description: 'Análise de status, tempo e rentabilidade por projeto.',
      icon: BarChart3,
      color: 'from-purple-500 to-pink-600',
      reportKey: 'project_productivity',
      action: () => generateProjectReport(detailedReportData, settings, selectedPeriodLabel(selectedPeriod))
    }
  ];

  const handleApplyFilters = () => {
    fetchReportData(selectedPeriod, selectedCategory);
    toast({
      title: "Relatórios Atualizados",
      description: "Os gráficos e estatísticas foram atualizados com base nos filtros selecionados."
    });
  };
  
  const [reportGenerationState, setReportGenerationState] = useState({ loading: false, key: null });

  const handleGenerateReport = async (reportKey) => {
    setReportGenerationState({ loading: true, key: reportKey });
    try {
      const reportGenerator = reportTypes.find(r => r.reportKey === reportKey)?.action;
      if (reportGenerator) {
        await reportGenerator();
        toast({ title: "Download Iniciado", description: `Seu relatório está sendo gerado.` });
      } else {
        throw new Error("Tipo de relatório desconhecido.");
      }
    } catch (e) {
      toast({ title: "Erro ao Gerar PDF", description: e.message, variant: "destructive" });
    } finally {
      setReportGenerationState({ loading: false, key: null });
    }
  };

  const handleGenerateFullReport = async () => {
    setReportGenerationState({ loading: true, key: 'full_report' });
    try {
      await generateFullReport(detailedReportData, settings, selectedPeriodLabel(selectedPeriod), { revenueExpense: revenueExpenseData, categoryDistribution: categoryDistributionData });
      toast({ title: "Download Iniciado", description: "Seu relatório completo está sendo gerado." });
    } catch (e) {
      toast({ title: "Erro ao Gerar PDF", description: e.message, variant: "destructive" });
    } finally {
      setReportGenerationState({ loading: false, key: null });
    }
  };


  const renderLoadingPlaceholder = (message = "Carregando dados...") => (
    <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-8 h-8 border-4 border-customPurple dark:border-customGreen border-t-transparent rounded-full mb-3"
      />
      {message}
    </div>
  );
  
  const renderNoDataPlaceholder = (message = "Sem dados para exibir.") => (
    <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
      <AlertCircle className="w-12 h-12 text-muted-foreground/50 mb-3" />
      {message}
    </div>
  );


  return (
    <div className="space-y-8">
      <ReportHeader onGenerateFullReport={handleGenerateFullReport} loading={reportGenerationState.loading && reportGenerationState.key === 'full_report'} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-xl p-6 shadow-lg border border-border"
      >
        <h3 className="text-xl font-semibold text-foreground mb-4">
          Filtros de Relatório
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-muted-foreground">Período</label>
            <div className="flex items-center gap-2">
              <CalendarIconLucide className="w-5 h-5 text-muted-foreground" />
              <PeriodSelector selectedPeriod={selectedPeriod} setSelectedPeriod={setSelectedPeriod} />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-muted-foreground">Categoria (Receitas)</label>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <CategorySelector selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />
            </div>
          </div>
          <Button onClick={handleApplyFilters} className="w-full md:w-auto btn-custom-gradient text-white self-end" disabled={loadingReportData}>
            {loadingReportData ? 'Atualizando...' : 'Aplicar Filtros e Atualizar'}
          </Button>
        </div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-xl p-6 shadow-lg border border-border"
      >
        <h3 className="text-xl font-semibold text-foreground mb-4">
          Estatísticas Rápidas do Período (Valores Pagos)
        </h3>
        {loadingReportData ? renderLoadingPlaceholder() : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { label: "Receita Total", value: `R$ ${quickStats.totalRevenue.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, color: "text-customGreen" },
              { label: "Despesas Operacionais", value: `R$ ${quickStats.totalExpenses.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, color: "text-red-600 dark:text-red-400" },
              { label: "Lucro Operacional", value: `R$ ${quickStats.operationalProfit.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, color: quickStats.operationalProfit >= 0 ? "text-sky-500 dark:text-sky-400" : "text-orange-500" },
              { label: "Pró-labore", value: `R$ ${quickStats.totalProLabore.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, color: "text-amber-500 dark:text-amber-400" },
              { label: "Lucro Líquido Final", value: `R$ ${quickStats.netProfit.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, color: quickStats.netProfit >= 0 ? "text-blue-600 dark:text-blue-400" : "text-orange-500" },
              { label: "Projetos Concluídos", value: quickStats.completedProjects, color: "text-neutral-600 dark:text-purple-400" },
              { label: "Novos Clientes", value: quickStats.newClients, color: "text-pink-600 dark:text-pink-400" },
            ].map(stat => (
              <div key={stat.label} className="text-center bg-background p-4 rounded-lg border border-border">
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-xl p-6 shadow-lg border border-border"
        >
          <h3 className="text-xl font-semibold text-foreground mb-4">
            Fluxo Financeiro Mensal (Valores Pagos)
          </h3>
          <div className="h-80">
            {loadingReportData ? renderLoadingPlaceholder() : revenueExpenseData && revenueExpenseData.labels.length > 0 ? (
              <BarChartComponent chartData={revenueExpenseData} />
            ) : (
              renderNoDataPlaceholder("Sem dados de receita/despesa para o período.")
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-xl p-6 shadow-lg border border-border"
        >
          <h3 className="text-xl font-semibold text-foreground mb-4">
            Distribuição de Receitas (Pagas) por Categoria
          </h3>
          <div className="h-80">
            {loadingReportData ? renderLoadingPlaceholder() : categoryDistributionData && categoryDistributionData.labels.length > 0 ? (
              <PieChartComponent chartData={categoryDistributionData} />
            ) : (
              renderNoDataPlaceholder(categoryDistributionData ? "Sem dados de receita para o período/categoria selecionado." : "Sem dados para exibir.")
            )}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reportTypes.map((report, index) => (
          <ReportTypeCard
            key={report.reportKey}
            report={report}
            onGenerate={() => handleGenerateReport(report.reportKey)}
            loading={reportGenerationState.loading && reportGenerationState.key === report.reportKey}
            index={index}
          />
        ))}
      </div>
    </div>
  );
};

export default Reports;