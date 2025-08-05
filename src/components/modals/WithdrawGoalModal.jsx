import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowDownCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const WithdrawGoalModal = ({ isOpen, onClose, onSave, goalData, isLoading }) => {
  const [valorSaque, setValorSaque] = useState('');
  const [descricaoSaque, setDescricaoSaque] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setValorSaque('');
      setDescricaoSaque('');
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!valorSaque || parseFloat(valorSaque) <= 0) {
      toast({ title: "Valor Inválido", description: "O Valor do Saque deve ser maior que zero.", variant: "destructive" });
      return;
    }
    if (goalData && parseFloat(valorSaque) > goalData.saldo_atual) {
      toast({ title: "Saldo Insuficiente", description: `O valor do saque não pode ser maior que o saldo atual (R$ ${goalData.saldo_atual.toFixed(2)}).`, variant: "destructive" });
      return;
    }
    if (!descricaoSaque.trim()) {
      toast({ title: "Campo Obrigatório", description: "Por favor, preencha a Descrição do Saque.", variant: "destructive" });
      return;
    }
    onSave({ valor_saque: parseFloat(valorSaque), descricao_saque: descricaoSaque });
  };
  
  const modalTitle = `Sacar / Registrar Gasto de "${goalData?.nome_meta || 'Meta'}"`;
  const modalDescription = `Informe o valor e a descrição para este saque/gasto. O saldo atual é R$ ${goalData?.saldo_atual?.toFixed(2) || '0.00'}.`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md shadow-2xl border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center text-2xl font-bold text-foreground">
            <ArrowDownCircle className="mr-3 h-7 w-7 text-red-500" />
            {modalTitle}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {modalDescription}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div>
            <Label htmlFor="valorSaque" className="text-muted-foreground">Valor do Saque (R$)*</Label>
            <Input
              id="valorSaque"
              type="number"
              value={valorSaque}
              onChange={(e) => setValorSaque(e.target.value)}
              placeholder="Ex: 150.00"
              className="mt-1 bg-input border-border focus:border-customPurple"
              min="0.01"
              step="0.01"
              required
            />
          </div>
          <div>
            <Label htmlFor="descricaoSaque" className="text-muted-foreground">Descrição do Saque*</Label>
            <Input
              id="descricaoSaque"
              value={descricaoSaque}
              onChange={(e) => setDescricaoSaque(e.target.value)}
              placeholder="Ex: Conserto da lente, Adiantamento"
              className="mt-1 bg-input border-border focus:border-customPurple"
              required
            />
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="mr-2">
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-red-600 hover:bg-red-700 text-white">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowDownCircle className="mr-2 h-4 w-4" />}
              {isLoading ? "Registrando..." : "Registrar Saque"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawGoalModal;