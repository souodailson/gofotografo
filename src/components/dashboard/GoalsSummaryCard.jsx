import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/**
 * Card de resumo das metas. Mostra o progresso de cada meta utilizando
 * o componente Progress. Quando a meta é alcançada (saldo_atual >= valor_meta),
 * a barra fica verde; caso contrário, azul.
 *
 * @param {Object} props
 * @param {Array} props.goals - Lista de metas com saldo_atual e valor_meta
 * @param {Function} props.onClick - Função chamada ao clicar no card
 * @param {Boolean} props.isDemo - Indica se são dados de demonstração
 * @param {Boolean} props.isLoading - Indica se está carregando
 */
const GoalsSummaryCard = ({
  goals,
  onClick,
  isDemo = false,
  isLoading = false,
}) => {
  return (
    <Card
      className="bg-card/80 backdrop-blur-sm border border-border rounded-xl shadow-sm h-full flex flex-col"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Resumo das Metas
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        {isLoading ? (
          <p className="text-muted-foreground text-xs">
            Carregando metas...
          </p>
        ) : !goals || goals.length === 0 ? (
          <p className="text-muted-foreground text-xs">
            Nenhuma meta cadastrada.
          </p>
        ) : (
          goals.map((goal) => {
            const value =
              (goal.saldo_atual / goal.valor_meta) * 100;
            const progressValue = Math.min(Math.max(value, 0), 100);
            const colorClass =
              goal.saldo_atual >= goal.valor_meta
                ? 'bg-customGreen'
                : 'bg-primary';
            return (
              <div
                key={goal.id || goal.name}
                className="space-y-1"
              >
                <div className="flex justify-between items-center">
                  <p className="text-xs font-medium">
                    {goal.nome || goal.name}
                  </p>
                  <Badge
                    variant="outline"
                    className="text-xs border-border"
                  >
                    {progressValue.toFixed(1)}%
                  </Badge>
                </div>
                {/* Barra de progresso usando componente Progress */}
                <Progress
                  value={progressValue}
                  indicatorClassName={colorClass}
                />
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

export default GoalsSummaryCard;
