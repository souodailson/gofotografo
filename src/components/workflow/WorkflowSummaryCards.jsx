import React from 'react';
import { Users, FileText, Briefcase, DollarSign, TrendingUp, Archive } from 'lucide-react';
import { motion } from 'framer-motion';
import { useData } from '@/contexts/DataContext';

const SummaryCard = ({ title, value, icon: Icon, color, isMobile, activeViewSummary, isFeatured = false, isInsideModal = false }) => {
  const cardBaseClasses = "bg-card p-4 rounded-xl shadow-lg border flex items-center space-x-3 transition-all duration-200 ease-in-out";
  
  const desktopFeaturedClasses = isFeatured && !isInsideModal && !isMobile ? "border-border" : "border-border";
  const mobileFeaturedClasses = isFeatured && (isInsideModal || activeViewSummary === 'cards') ? 'border-customGreen ring-2 ring-customGreen' : 'border-border';
  
  let dynamicFeaturedClasses = '';
  if (isMobile) {
    dynamicFeaturedClasses = mobileFeaturedClasses;
  } else {
    dynamicFeaturedClasses = desktopFeaturedClasses;
  }
  
  const mobileIconViewClasses = "flex flex-col items-center justify-center p-3 h-24";
  
  if (isMobile && activeViewSummary === 'icons' && !isInsideModal) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className={`${cardBaseClasses} ${mobileIconViewClasses} ${dynamicFeaturedClasses}`}
      >
        <div className={`p-2 rounded-full ${color} mb-1`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <p className="text-[10px] text-muted-foreground text-center leading-tight">{title}</p>
        <p className={`text-sm font-semibold ${isFeatured ? 'text-lg text-customGreen dark:text-customGreen' : 'text-foreground'}`}>{value}</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 15 }}
      className={`${cardBaseClasses} ${dynamicFeaturedClasses} card-hover`}
    >
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className={`text-white w-5 h-5`} />
      </div>
      <div>
        <p className={`text-muted-foreground text-xs`}>{title}</p>
        <p className={`font-semibold text-lg ${isFeatured && !isMobile ? 'text-customGreen dark:text-customGreen' : 'text-foreground'}`}>{value}</p>
      </div>
    </motion.div>
  );
};


const WorkflowSummaryCards = ({ cards, isMobile, activeViewSummary, isInsideModal = false }) => {
  const { settings } = useData();

  if (!cards) {
    return null;
  }

  const firstColumnId = settings?.workflow_columns?.[0]?.id || 'novo-lead';
  const conversionStages = ['agendado', 'em-andamento', 'concluido'];

  const totalLeads = cards.filter(card => card.status === firstColumnId).length;
  const convertedLeads = cards.filter(card => 
    card.status !== firstColumnId &&
    conversionStages.includes(card.status) &&
    !card.archived
  ).length;

  const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : 0;

  const proposalsSent = cards.filter(card => card.status === 'proposta-enviada').length;
  const projectsInProgress = cards.filter(card => card.status === 'em-andamento').length;

  const expectedRevenue = cards.reduce((sum, card) => {
    if (card.status !== 'concluido' && card.value && !card.archived) { 
      return sum + Number(card.value);
    }
    return sum;
  }, 0);
  
  const totalArchived = cards.filter(card => card.archived).length;


  const summaryData = [
    { title: 'Previsto', value: `R$ ${expectedRevenue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`, icon: DollarSign, color: 'bg-emerald-500', isFeatured: true },
    { title: 'Leads', value: cards.filter(c => c.status === firstColumnId && !c.archived).length, icon: Users, color: 'bg-sky-500' },
    { title: 'Propostas', value: proposalsSent, icon: FileText, color: 'bg-amber-500' },
    { title: 'Em Andamento', value: projectsInProgress, icon: Briefcase, color: 'bg-violet-500' },
    { title: 'Conversão', value: `${conversionRate}%`, icon: TrendingUp, color: 'bg-rose-500' },
    ...(isMobile && activeViewSummary === 'icons' && !isInsideModal ? [{ title: 'Arquivados', value: totalArchived, icon: Archive, color: 'bg-slate-500' }] : []),
  ];
  
  if (isMobile && activeViewSummary === 'icons' && !isInsideModal) {
    return (
      <div className="grid grid-cols-3 gap-2 mb-6">
        {summaryData.map(item => (
          <SummaryCard key={item.title} {...item} isMobile={isMobile} activeViewSummary={activeViewSummary} isInsideModal={isInsideModal} />
        ))}
      </div>
    );
  }

  const gridClasses = isInsideModal 
    ? "grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6" 
    : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6";

  return (
    <div className={gridClasses}>
      {summaryData.filter(item => !(isMobile && activeViewSummary === 'icons' && item.title === 'Arquivados')).map(item => (
        <div key={item.title} className={`${isInsideModal ? '' : 'lg:col-span-1'} ${item.isFeatured && isInsideModal ? 'sm:col-span-2' : ''}`}>
          <SummaryCard {...item} isMobile={isMobile} activeViewSummary={activeViewSummary} isInsideModal={isInsideModal}/>
        </div>
      ))}
    </div>
  );
};

export default WorkflowSummaryCards;