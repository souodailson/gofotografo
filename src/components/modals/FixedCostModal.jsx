import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { DollarSign, Edit3, Loader2, Receipt } from 'lucide-react';

const FixedCostModal = ({ isOpen, onClose, onSave, fixedCostData, isLoading }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    nome_custo: '',
    valor_mensal: '',
  });

  useEffect(() => {
    if (isOpen) {
      if (fixedCostData) {
        setFormData({
          nome_custo: fixedCostData.nome_custo || '',
          valor_mensal: fixedCostData.valor_mensal !== null && fixedCostData.valor_mensal !== undefined ? String(fixedCostData.valor_mensal) : '',
        });
      } else {
        setFormData({
          nome_custo: '',
          valor_mensal: '',
        });
      }
    }
  }, [isOpen, fixedCostData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nome_custo || !formData.valor_mensal) {
      toast({
        title: "Campos Obrigatórios",
        description: "Nome do Custo e Valor Mensal são obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    const valorMensalNum = parseFloat(formData.valor_mensal);
    if (isNaN(valorMensalNum) || valorMensalNum < 0) {
      toast({
        title: "Valor Inválido",
        description: "O valor mensal deve ser um número positivo.",
        variant: "destructive",
      });
      return;
    }
    onSave({ ...formData, valor_mensal: valorMensalNum });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] shadow-2xl border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground flex items-center">
            <Receipt className="w-7 h-7 mr-3 text-customPurple" />
            {fixedCostData ? 'Editar Custo Fixo' : 'Adicionar Custo Fixo'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {fixedCostData ? 'Atualize os detalhes deste custo fixo.' : 'Informe os detalhes do novo custo fixo mensal.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-6 py-4">
          <div>
            <Label htmlFor="nome_custo" className="flex items-center mb-1.5 text-muted-foreground">
              <Edit3 className="w-4 h-4 mr-2 text-customPurple" /> Nome do Custo*
            </Label>
            <Input 
              id="nome_custo" 
              name="nome_custo" 
              value={formData.nome_custo} 
              onChange={handleChange} 
              placeholder="Ex: Plano Adobe, Aluguel"
              required 
              className="bg-input border-border focus:border-customPurple"
            />
          </div>
          
          <div>
            <Label htmlFor="valor_mensal" className="flex items-center mb-1.5 text-muted-foreground">
              <DollarSign className="w-4 h-4 mr-2 text-customPurple" /> Valor Mensal (R$)*
            </Label>
            <Input 
              id="valor_mensal" 
              name="valor_mensal" 
              type="number" 
              step="0.01" 
              min="0"
              value={formData.valor_mensal} 
              onChange={handleChange} 
              placeholder="Ex: 150.00" 
              required
              className="bg-input border-border focus:border-customPurple"
            />
          </div>
        </form>
        <DialogFooter className="pt-6 border-t border-border">
          <Button variant="outline" onClick={onClose} disabled={isLoading} className="hover:border-destructive hover:text-destructive">
            Cancelar
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={isLoading} className="btn-custom-gradient bg-customPurple hover:opacity-90">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar Custo'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FixedCostModal;