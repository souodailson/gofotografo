import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, User, Calendar, Tag, Info } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const PaymentsToReceiveList = ({ cards }) => {
  const { getClientById, getServicePackageById } = useData();

  if (!cards || cards.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 bg-card rounded-xl shadow-lg border border-border text-center"
      >
        <Info size={48} className="mx-auto text-primary mb-4" />
        <h3 className="text-xl font-semibold mb-2 text-foreground">Nenhum Pagamento a Receber</h3>
        <p className="text-muted-foreground">Não há trabalhos ou transações com valores pendentes no momento.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl shadow-lg border border-border"
    >
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">
          Pagamentos a Receber
        </h3>
        <p className="text-sm text-muted-foreground">Trabalhos e transações com valores pendentes de clientes.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-accent/50 dark:bg-accent/30">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Trabalho / Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Data Evento/Vencimento</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Pacote/Descrição</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Valor Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Valor Pendente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status Contrato/Lanç.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {cards.map((item) => { // item can be a workflow card or a pending transaction
              const isWorkflowCard = !!item.title; // Heuristic to differentiate
              const client = item.client_id ? getClientById(item.client_id) : null;
              const servicePackage = isWorkflowCard && item.service_package_id ? getServicePackageById(item.service_package_id) : null;
              
              const displayTitle = isWorkflowCard ? item.title : item.descricao;
              const displayDate = isWorkflowCard ? (item.date ? format(parseISO(item.date), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A') : (item.data_vencimento ? format(parseISO(item.data_vencimento), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A');
              const displayPackageOrDescription = isWorkflowCard ? (servicePackage ? servicePackage.name : 'N/A') : item.descricao; // Or category for transaction
              const displayTotalValue = isWorkflowCard ? (item.value || 0) : (item.valor || 0);
              const displayPendingValue = isWorkflowCard ? (item.pending_amount || 0) : (item.valor || 0);
              const displayStatus = isWorkflowCard 
                ? (item.contract_status === 'signed' ? 'Assinado' : item.contract_status === 'sent' ? 'Enviado' : 'Pendente')
                : item.status; // e.g., 'PENDENTE'

              const statusBgColor = isWorkflowCard ? (
                  item.contract_status === 'signed' ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100' 
                  : item.contract_status === 'sent' ? 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-100' 
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100'
              ) : (
                  item.status === 'PENDENTE' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
              );

              return (
                <tr key={item.id} className="hover:bg-accent/50 dark:hover:bg-accent/30">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-foreground">{displayTitle}</div>
                    {client && <div className="text-xs text-muted-foreground flex items-center"><User size={12} className="mr-1" />{client.name}</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {displayDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {displayPackageOrDescription}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    R$ {Number(displayTotalValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-orange-600 dark:text-orange-400">
                    R$ {Number(displayPendingValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${statusBgColor}`}>
                      {displayStatus}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default PaymentsToReceiveList;