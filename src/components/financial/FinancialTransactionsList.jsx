import React from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, MoreVertical, Hourglass } from 'lucide-react';
import ReceiptButton from '@/components/receipts/ReceiptButton';
import { Button } from '@/components/ui/button';
import LazyImage from '@/components/common/LazyImage';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const FinancialTransactionsList = ({ transactions, onEdit, onDelete, isMobile }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [transactionToDelete, setTransactionToDelete] = React.useState(null);

  const handleDeleteRequest = (transactionId) => {
    setTransactionToDelete(transactionId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAction = () => {
    if (transactionToDelete) {
      onDelete(transactionToDelete); 
    }
    setShowDeleteConfirm(false);
    setTransactionToDelete(null);
  };

  const closeDeleteConfirmDialog = () => {
    setShowDeleteConfirm(false);
    setTransactionToDelete(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const date = parseISO(dateString); 
        if (isNaN(date.getTime())) { 
            return 'Data inválida';
        }
        return isMobile ? format(date, 'dd/MM/yy', { locale: ptBR }) : format(date, 'dd/MM/yyyy', { locale: ptBR });
    } catch (e) {
        console.error("Error formatting date:", dateString, e);
        return 'Data inválida';
    }
  };


  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-card rounded-xl shadow-lg border border-border"
      >
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">
            Últimos Lançamentos
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-accent/50 dark:bg-accent/30">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Data</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Descrição</th>
                <th className={`px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider ${isMobile ? 'hidden' : 'table-cell'}`}>Carteira</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Valor</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className={`px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider ${isMobile ? 'hidden' : 'table-cell'}`}>Pagamento</th>
                <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={isMobile ? 5 : 7} className="px-6 py-8 text-center text-muted-foreground">Nenhum lançamento encontrado.</td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr 
                    key={transaction.id} 
                    className={`
                      ${transaction.tipo === 'ENTRADA' ? 'bg-green-500/5 dark:bg-green-500/10' : 'bg-red-500/5 dark:bg-red-500/10'}
                      hover:bg-accent/50 dark:hover:bg-accent/30
                    `}
                  >
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-foreground">{formatDate(transaction.data_recebimento || transaction.release_date || transaction.data_vencimento || transaction.created_at)}</td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-foreground truncate max-w-[100px] sm:max-w-xs" title={transaction.descricao}>{transaction.descricao}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-muted-foreground ${isMobile ? 'hidden' : 'table-cell'}`}>
                        {transaction.wallet ? (
                            <div className="flex items-center">
                                {transaction.wallet.icon_url && <LazyImage src={transaction.wallet.icon_url} alt={transaction.wallet.name} className="w-4 h-4 mr-2 object-contain" />}
                                <span className="truncate">{transaction.wallet.name}</span>
                            </div>
                        ) : 'N/A'}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={transaction.tipo === 'ENTRADA' ? 'text-customGreen' : 'text-red-500'}>
                        {transaction.tipo === 'SAIDA' ? '- R$ ' : '+ R$ '}{Number(transaction.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                       {transaction.original_value && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="ml-1 text-xs text-muted-foreground cursor-help">
                                (de {Number(transaction.original_value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Taxa de R$ {Number(transaction.fee_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} descontada</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                        transaction.status === 'PAGO' ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100' 
                        : transaction.status === 'PENDENTE' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100'
                        : transaction.status === 'AGUARDANDO_LIBERACAO' ? 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-100'
                        : transaction.status === 'CANCELADO' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100' 
                      }`}>
                         {transaction.status === 'AGUARDANDO_LIBERACAO' && <Hourglass className="w-3 h-3 mr-1" />}
                        {transaction.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-muted-foreground ${isMobile ? 'hidden' : 'table-cell'}`}>{transaction.metodo_pagamento || 'N/A'}</td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center gap-2 justify-end">
                        <ReceiptButton 
                          transaction={{
                            ...transaction,
                            type: transaction.tipo === 'ENTRADA' ? 'entrada' : 'saida'
                          }}
                          size="sm"
                          showDropdown={false}
                        />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit(transaction)}><Edit className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteRequest(transaction.id)} className="text-red-600 dark:text-red-400 hover:!text-red-600 dark:hover:!text-red-400"><Trash2 className="mr-2 h-4 w-4" /> Excluir</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>Tem certeza que deseja excluir este lançamento? Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeDeleteConfirmDialog}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteAction} className="bg-red-600 hover:bg-red-700">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default FinancialTransactionsList;