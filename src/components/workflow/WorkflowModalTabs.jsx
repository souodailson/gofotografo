import React from 'react';

const WorkflowModalTabs = ({ activeTab, setActiveTab, cardId, subtasksCount, commentsCount }) => {
  const tabs = [
    { id: 'details', label: 'Detalhes' },
    { id: 'subtasks', label: `Subtarefas (${subtasksCount || 0})` },
  ];

  if (cardId) {
    tabs.push({ id: 'comments', label: `Comentários (${commentsCount || 0})` });
    tabs.push({ id: 'history', label: 'Histórico' });
  }

  return (
    <div className="flex border-b border-slate-200 dark:border-slate-700">
      {tabs.map(tab => (
        <button 
          key={tab.id}
          onClick={() => setActiveTab(tab.id)} 
          className={`px-4 sm:px-6 py-3 text-sm font-medium whitespace-nowrap ${activeTab === tab.id 
            ? 'text-neutral-600 border-b-2 border-neutral-600' 
            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default WorkflowModalTabs;