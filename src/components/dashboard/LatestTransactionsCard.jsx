import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const LatestTransactionsCard = ({ transactions = [] }) => {
  const latestTransactions = transactions
    .sort((a, b) => parseISO(b.created_at).getTime() - parseISO(a.created_at).getTime())
    .slice(0, 10);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = parseISO(dateString);
      return format(date, "dd 'de' MMM, yyyy", { locale: ptBR });
    } catch (e) {
      return 'Data inválida';
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Últimos Lançamentos</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <ScrollArea className="h-full">
          {latestTransactions.length > 0 ? (
            <div className="space-y-4">
              {latestTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center">
                  <div className={`p-2 rounded-full mr-4 ${transaction.tipo === 'ENTRADA' ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
                    {transaction.tipo === 'ENTRADA' ? (
                      <ArrowUpRight className="h-5 w-5 text-green-500" />
                    ) : (
                      <ArrowDownLeft className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex-grow">
                    <p className="font-medium text-sm truncate">{transaction.descricao}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(transaction.data_vencimento || transaction.created_at)}</p>
                  </div>
                  <div className={`font-semibold text-sm ${transaction.tipo === 'ENTRADA' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    R$ {Number(transaction.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground h-full flex items-center justify-center">
              Nenhuma transação encontrada.
            </p>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default LatestTransactionsCard;