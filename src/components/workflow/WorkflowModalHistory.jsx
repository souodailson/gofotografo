import React from 'react';
import { Clock } from 'lucide-react';

const WorkflowModalHistory = ({ history }) => {
  return (
    <div className="space-y-3 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
      {history && history.length > 0 ? (
        history.slice().reverse().map((entry, index) => ( 
          <div key={index} className="flex items-start space-x-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg shadow-sm">
            <div className="mt-1 w-2.5 h-2.5 bg-purple-500 rounded-full flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{entry.action}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {new Date(entry.date).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })} 
                {entry.user && ` • ${entry.user}`}
              </p>
            </div>
            <Clock className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0 mt-1" />
          </div>
        ))
      ) : <p className="text-slate-500 dark:text-slate-400 text-center py-4">Nenhum histórico disponível.</p>}
    </div>
  );
};

export default WorkflowModalHistory;