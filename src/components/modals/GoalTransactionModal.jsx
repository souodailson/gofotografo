import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

const GoalTransactionModal = ({ isOpen, onClose, onSave, goalData, transactionType, isLoading }) => {
  const [valor, setValor] = useState('');
  const [descricao, setDescricao] = useState('');
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setValor('');
      setDescricao('');
      setFormErrors({});
    }
  }, [isOpen]);

  const validateForm = () => {
    const errors = {};
    if (!valor || isNaN(parseFloat(valor)) || parseFloat(valor) <= 0) {
      errors.valor = 'Por favor, insira um valor válido.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave({ valor, descricao });
    }
  };

  if (!goalData) return null;

  const title = transactionType === 'deposit' ? 'Depositar na Reserva' : 'Sacar da Reserva';
  const Icon = transactionType === 'deposit' ? ArrowUpCircle : ArrowDownCircle;
  const iconColor = transactionType === 'deposit' ? 'text-green-500' : 'text-red-500';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] border-border shadow-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Icon className={`w-6 h-6 mr-2 ${iconColor}`} />
            {title}: <span className="ml-1 font-semibold text-customPurple">{goalData.nome_meta}</span>
          </DialogTitle>
          <DialogDescription>
            {transactionType === 'deposit' 
              ? 'Adicione fundos à sua meta de reserva.' 
              : 'Retire fundos da sua meta de reserva.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-1">
              <Label htmlFor="valor" className="text-foreground">Valor (R$)</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder="Ex: 50,00"
                className={`bg-input border-input-border ${formErrors.valor ? 'border-red-500' : ''}`}
              />
              {formErrors.valor && <p className="text-xs text-red-500 mt-1">{formErrors.valor}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="descricao" className="text-foreground">Descrição (Opcional)</Label>
              <Input
                id="descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder={transactionType === 'deposit' ? "Ex: Bônus de Fim de Ano" : "Ex: Conserto da Lente"}
                className="bg-input border-input-border"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" className="btn-custom-gradient" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Confirmar {transactionType === 'deposit' ? 'Depósito' : 'Saque'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default GoalTransactionModal;