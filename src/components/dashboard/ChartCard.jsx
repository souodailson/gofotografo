import React from 'react';
import { motion } from 'framer-motion';
import {
  BarChart2,
  PieChart,
  List,
  Edit,
  Trash2,
  MoreVertical,
} from 'lucide-react';
import BarChartComponent from '@/components/charts/BarChart';
import PieChartComponent from '@/components/charts/PieChart';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

const IconMap = {
  BarChart2,
  PieChart,
  List,
};

const ChartCard = ({
  title,
  icon,
  color,
  chartData,
  chartType,
  onClick,
  isPersonalizing,
  deleteTransaction,
  setActiveTab,
  isDemo = false,
  layout,
}) => {
  const IconComponent = IconMap[icon] || BarChart2;
  const [showDeleteConfirm, setShowDeleteConfirm] =
    React.useState(false);
  const [transactionToDelete, setTransactionToDelete] =
    React.useState(null);

  const handleDeleteRequest = (transactionId) => {
    setTransactionToDelete(transactionId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAction = () => {
    if (transactionToDelete && deleteTransaction) {
      deleteTransaction(transactionToDelete);
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
      if (isNaN(date.getTime())) return 'Data inválida';
      return format(date, 'dd/MM/yy', { locale: ptBR });
    } catch (e) {
      return 'Data inválida';
    }
  };

  const getResponsiveClasses = () => {
    if (!layout)
      return {
        title: 'text-sm',
        icon: 'w-4 h-4',
        listText: 'text-xs',
        listValue: 'text-xs',
      };
    const { h, w } = layout;
    // Ajustes responsivos para cards menores
    if (w <= 2) {
      return {
        title: 'text-[11px]',
        icon: 'w-3.5 h-3.5',
        listText: 'text-[10px]',
        listValue: 'text-[11px]',
      };
    }
    if (h <= 3 || w <= 4) {
      return {
        title: 'text-xs',
        icon: 'w-3.5 h-3.5',
        listText: 'text-[11px]',
        listValue: 'text-xs',
      };
    }
    return {
      title: 'text-sm',
      icon: 'w-4 h-4',
      listText: 'text-xs',
      listValue: 'text-sm',
    };
  };

  const responsiveClasses = getResponsiveClasses();

  const renderContent = () => {
    // Renderiza cada tipo de gráfico conforme o chartType
    if (!chartData) {
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          Carregando...
        </div>
      );
    }
    if (chartType === 'bar') {
      return (
        <BarChartComponent
          chartData={chartData}
          isCompact={layout?.h <= 3 || layout?.w <= 4}
        />
      );
    }
    if (chartType === 'pie') {
      return (
        <PieChartComponent
          chartData={chartData}
          isCompact={layout?.h <= 3 || layout?.w <= 2}
        />
      );
    }
    if (chartType === 'list') {
      if (!chartData.items) {
        return (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Carregando...
          </div>
        );
      }
      if (chartData.items.length === 0) {
        return (
          <p className="text-center text-muted-foreground text-xs py-4">
            Nenhum lançamento recente.
          </p>
        );
      }
      return (
        <ScrollArea className="h-full pr-2">
          <div className="space-y-2">
            {chartData.items.map((item, index) => {
              // Ao clicar no item da lista, abrir o modal de edição de lançamento
              const handleItemClick = () => {
                if (!isDemo && setActiveTab) {
                  setActiveTab('financial', {
                    modal: 'editTransaction',
                    transactionId: item.id,
                  });
                }
              };
              return (
                <div
                  key={item.id || index}
                  onClick={handleItemClick}
                  className={
                    `flex items-center justify-between p-1.5 rounded-md transition-all duration-200 ease-in-out ` +
                    (item.tipo === 'ENTRADA'
                      ? 'bg-green-500/10 hover:bg-green-500/20'
                      : 'bg-red-500/10 hover:bg-red-500/20')
                  }
                >
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        'font-medium text-foreground truncate',
                        responsiveClasses.listText
                      )}
                      title={item.descricao}
                    >
                      {item.descricao}
                    </p>
                    <p
                      className={cn(
                        'text-muted-foreground',
                        responsiveClasses.listText
                      )}
                    >
                      {formatDate(item.date)} - {item.status}
                    </p>
                  </div>
                  {/* Menu de ações: evita propagação do clique para o item */}
                  <div
                    className="flex items-center ml-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <p
                      className={cn(
                        'font-semibold mr-1',
                        responsiveClasses.listValue,
                        item.tipo === 'ENTRADA'
                          ? 'text-customGreen'
                          : 'text-red-500'
                      )}
                    >
                      {item.tipo === 'SAIDA' ? '- R$' : '+ R$'}
                      {Number(item.valor).toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                    {!isDemo &&
                      deleteTransaction &&
                      setActiveTab && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0 data-[state=open]:bg-muted"
                            >
                              <MoreVertical className="h-3 w-3" />
                              <span className="sr-only">
                                Abrir menu
                              </span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                setActiveTab(
                                  'financial',
                                  {
                                    modal: 'editTransaction',
                                    transactionId:
                                      item.id,
                                  }
                                )
                              }
                            >
                              <Edit className="mr-2 h-3 w-3 text-muted-foreground/70" />
                              <span className="text-xs">
                                Editar
                              </span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleDeleteRequest(
                                  item.id
                                )
                              }
                              className="text-red-600 dark:text-red-400 hover:!text-red-600 dark:hover:!text-red-400"
                            >
                              <Trash2 className="mr-2 h-3 w-3 text-muted-foreground/70" />
                              <span className="text-xs">
                                Excluir
                              </span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      );
    }
    return (
      <p className="text-center text-muted-foreground text-xs py-4">
        Tipo de gráfico desconhecido.
      </p>
    );
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`bg-card rounded-xl shadow-sm border border-border/50 overflow-hidden flex flex-col h-full p-3 ${
          isPersonalizing
            ? 'cursor-grab active:cursor-grabbing'
            : ''
        }`}
      >
        {/* Cabeçalho clicável apenas se houver onClick e não estiver em edição */}
        <div
          className="flex items-center justify-between pb-2 mb-2 border-b border-border/50"
          onClick={!isPersonalizing && onClick ? onClick : undefined}
          style={{
            cursor:
              !isPersonalizing && onClick ? 'pointer' : 'default',
          }}
        >
          <div className="flex items-center min-w-0">
            <IconComponent
              className={cn(
                'mr-2 shrink-0',
                responsiveClasses.icon,
                color || 'text-primary'
              )}
            />
            <h3
              className={cn(
                'font-semibold text-foreground truncate',
                responsiveClasses.title
              )}
            >
              {title}
            </h3>
          </div>
        </div>
        <div
          className="flex-grow relative cursor-pointer hover:bg-accent/30"
        >
          {isDemo && chartType !== 'list' && (
            <div className="absolute top-0 left-0 w-full text-center z-10">
              <p className="text-xs text-muted-foreground bg-card/50 backdrop-blur-sm px-2 py-0.5 rounded-full inline-block">
                Gráfico demonstrativo
              </p>
            </div>
          )}
          {renderContent()}
        </div>
      </motion.div>
      {/* Modal de confirmação para exclusão de lançamento */}
      <AlertDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este lançamento? Esta
              ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeDeleteConfirmDialog}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteAction}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ChartCard;
