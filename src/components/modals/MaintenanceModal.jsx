import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea'; 
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { Wrench, CalendarDays, DollarSign, FileText, Loader2, TrendingUp } from 'lucide-react';

const MaintenanceModal = ({ isOpen, onClose, onSave, isLoading }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    data_manutencao: '',
    descricao_servico: '',
    custo: '',
  });
  const [launchAsExpense, setLaunchAsExpense] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        data_manutencao: '',
        descricao_servico: '',
        custo: '',
      });
      setLaunchAsExpense(false);
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.data_manutencao || !formData.descricao_servico) {
      toast({
        title: "Campos Obrigatórios",
        description: "Data da Manutenção e Serviço Realizado são obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    if (launchAsExpense && (!formData.custo || parseFloat(formData.custo) <= 0)) {
      toast({
        title: "Custo Inválido",
        description: "Para lançar como despesa, o custo deve ser maior que zero.",
        variant: "destructive",
      });
      return;
    }
    const dataToSave = {
      ...formData,
      custo: formData.custo ? parseFloat(formData.custo) : null,
    };
    onSave(dataToSave, launchAsExpense);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] bg-card shadow-2xl border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground flex items-center">
            <Wrench className="w-7 h-7 mr-3 text-customGreen" />
            Adicionar Manutenção
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Registre os detalhes da manutenção realizada no equipamento.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-6 py-4">
          <div>
            <Label htmlFor="data_manutencao" className="flex items-center mb-1.5 text-muted-foreground">
              <CalendarDays className="w-4 h-4 mr-2 text-customGreen" /> Data da Manutenção*
            </Label>
            <Input 
              id="data_manutencao" 
              name="data_manutencao" 
              type="date" 
              value={formData.data_manutencao} 
              onChange={handleChange} 
              required 
              className="bg-input border-border focus:border-customGreen"
              max={today}
            />
          </div>
          
          <div>
            <Label htmlFor="descricao_servico" className="flex items-center mb-1.5 text-muted-foreground">
              <FileText className="w-4 h-4 mr-2 text-customGreen" /> Serviço Realizado*
            </Label>
            <Textarea
              id="descricao_servico"
              name="descricao_servico"
              value={formData.descricao_servico}
              onChange={handleChange}
              placeholder="Ex: Limpeza de sensor, troca de peça..."
              required
              className="bg-input border-border focus:border-customGreen min-h-[100px]"
            />
          </div>

          <div>
            <Label htmlFor="custo" className="flex items-center mb-1.5 text-muted-foreground">
              <DollarSign className="w-4 h-4 mr-2 text-customGreen" /> Custo do Serviço (R$)
            </Label>
            <Input 
              id="custo" 
              name="custo" 
              type="number" 
              step="0.01" 
              value={formData.custo} 
              onChange={handleChange} 
              placeholder="Ex: 150.00" 
              className="bg-input border-border focus:border-customGreen" 
            />
          </div>

          <div className="flex items-center space-x-2 mt-2">
            <Checkbox 
              id="launchAsExpense" 
              checked={launchAsExpense} 
              onCheckedChange={setLaunchAsExpense}
              className="data-[state=checked]:bg-customGreen data-[state=checked]:border-customGreen border-muted-foreground"
            />
            <Label htmlFor="launchAsExpense" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center text-muted-foreground">
              <TrendingUp className="w-4 h-4 mr-2 text-customGreen" /> Lançar como despesa no financeiro?
            </Label>
          </div>

        </form>
        <DialogFooter className="pt-6 border-t border-border">
          <Button variant="outline" onClick={onClose} disabled={isLoading} className="hover:border-destructive hover:text-destructive">
            Cancelar
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={isLoading} className="btn-custom-gradient bg-customGreen hover:bg-customGreen/90">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar Manutenção'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MaintenanceModal;