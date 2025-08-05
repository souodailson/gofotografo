import React from 'react';
import { motion } from 'framer-motion';
import ReportDownloadButtons from './ReportDownloadButtons';

const ReportHeader = ({ onGenerateFullReport, loading }) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-foreground titulo-gradiente">
          Relatórios Dinâmicos
        </h1>
        <p className="text-muted-foreground mt-1">
          Análises e insights do seu negócio em tempo real.
        </p>
      </motion.div>
      <ReportDownloadButtons
        onGenerate={onGenerateFullReport}
        reportType="full_report"
        loading={loading}
      />
    </div>
  );
};

export default ReportHeader;