import React from 'react';
import { motion } from 'framer-motion';
import ReportDownloadButtons from './ReportDownloadButtons';

const ReportTypeCard = ({ report, onGenerate, loading, index }) => {
  const Icon = report.icon;
  return (
    <motion.div
      key={report.title}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 + index * 0.1 }}
      className="bg-card rounded-xl p-6 shadow-lg border border-border flex flex-col"
    >
      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${report.color} flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {report.title}
      </h3>
      <p className="text-muted-foreground text-sm flex-grow">
        {report.description}
      </p>
      <div className="mt-4">
        <ReportDownloadButtons
          onGenerate={() => onGenerate(report.reportKey)}
          reportType={report.reportKey}
          loading={loading}
        />
      </div>
    </motion.div>
  );
};

export default ReportTypeCard;