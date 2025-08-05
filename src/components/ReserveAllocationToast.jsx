import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PiggyBank, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const ReserveAllocationToast = ({ allocation, savingGoals, onConfirm, onDismiss }) => {
  const [selectedGoalId, setSelectedGoalId] = useState('');
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (savingGoals && savingGoals.length > 0) {
      const emergencyGoal = savingGoals.find(goal => goal.nome_meta.toLowerCase().includes('emergência') || goal.nome_meta.toLowerCase().includes('reserva'));
      if (emergencyGoal) {
        setSelectedGoalId(emergencyGoal.id);
      } else if (savingGoals[0]?.id) {
        setSelectedGoalId(savingGoals[0].id);
      } else {
        setSelectedGoalId('');
      }
    } else {
      setSelectedGoalId('');
    }
  }, [savingGoals]);

  const handleConfirm = () => {
    if (selectedGoalId) {
      onConfirm(selectedGoalId);
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    onDismiss();
    setIsVisible(false);
  };

  if (!isVisible || !allocation) {
    return null;
  }

  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const hasSavingGoals = savingGoals && savingGoals.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50, transition: { duration: 0.2 } }}
      className="fixed bottom-4 right-4 z-[101] w-full max-w-md"
    >
      <Card className="shadow-2xl border-l-4 border-customPurple bg-card">
        <CardHeader>
          <div className="flex items-center">
            <PiggyBank className="w-8 h-8 mr-3 text-customPurple" />
            <div>
              <CardTitle className="text-lg font-semibold text-foreground">Alocar Reserva Financeira?</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Pagamento de {formatCurrency(allocation.transactionValue)} recebido para "{allocation.serviceName}".
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-base text-foreground">
            Sugerimos guardar <strong className="text-customGreen">{formatCurrency(allocation.reserveAmount)}</strong>.
          </p>
          {hasSavingGoals ? (
            <div>
              <label htmlFor="goalSelect" className="text-sm font-medium text-muted-foreground mb-1 block">
                Escolha a meta de destino:
              </label>
              <Select value={selectedGoalId} onValueChange={setSelectedGoalId} disabled={!selectedGoalId}>
                <SelectTrigger id="goalSelect" className="w-full bg-input border-border focus:border-customPurple">
                  <SelectValue placeholder="Selecione uma meta..." />
                </SelectTrigger>
                <SelectContent>
                  {savingGoals.filter(g => g.id).map(goal => (
                    <SelectItem key={goal.id} value={goal.id}>
                      {goal.icone && <span className="mr-2">{goal.icone}</span>}
                      {goal.nome_meta} ({formatCurrency(goal.saldo_atual)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <p className="text-sm text-amber-600 dark:text-amber-400">
              Nenhuma meta de reserva encontrada. Crie uma em "Reserva Inteligente" para alocar.
            </p>
          )}
        </CardContent>
        <CardFooter className="flex justify-end space-x-3 pt-4">
          <Button variant="outline" onClick={handleDismiss} className="text-muted-foreground hover:bg-accent">
            <XCircle className="mr-2 h-4 w-4" /> Agora não
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={!selectedGoalId || !hasSavingGoals}
            className="bg-customGreen hover:bg-customGreen/90 text-white"
          >
            <CheckCircle className="mr-2 h-4 w-4" /> Confirmar
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default ReserveAllocationToast;