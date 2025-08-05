import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PiggyBank, Edit3, PackagePlus, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const GoalModal = ({ isOpen, onClose, onSave, goalData, isLoading }) => {
  const [nomeMeta, setNomeMeta] = useState('');
  const [valorMeta, setValorMeta] = useState('');
  const [icone, setIcone] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (goalData) {
      setNomeMeta(goalData.nome_meta || '');
      setValorMeta(goalData.valor_meta?.toString() || '');
      setIcone(goalData.icone || '');
    } else {
      setNomeMeta('');
      setValorMeta('');
      setIcone('');
    }
  }, [goalData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nomeMeta.trim()) {
      toast({ title: "Campo Obrigatório", description: "Por favor, preencha o Nome da Meta.", variant: "destructive" });
      return;
    }
    if (!valorMeta || parseFloat(valorMeta) <= 0) {
      toast({ title: "Valor Inválido", description: "O Valor da Meta deve ser maior que zero.", variant: "destructive" });
      return;
    }
    onSave({ nome_meta: nomeMeta, valor_meta: parseFloat(valorMeta), icone });
  };
  
  const modalTitle = goalData ? "Editar Meta de Reserva" : "Nova Meta de Reserva";
  const modalDescription = goalData 
    ? "Atualize os detalhes da sua meta de economia." 
    : "Defina um novo objetivo para suas economias.";
  const buttonIcon = goalData ? <Edit3 className="mr-2 h-4 w-4" /> : <PackagePlus className="mr-2 h-4 w-4" />;
  const buttonText = goalData ? "Salvar Alterações" : "Criar Meta";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md shadow-2xl border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center text-2xl font-bold text-foreground">
            <PiggyBank className="mr-3 h-7 w-7 text-customPurple" />
            {modalTitle}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {modalDescription}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div>
            <Label htmlFor="nomeMeta" className="text-muted-foreground">Nome da Meta*</Label>
            <Input
              id="nomeMeta"
              value={nomeMeta}
              onChange={(e) => setNomeMeta(e.target.value)}
              placeholder="Ex: Câmera Nova, Viagem dos Sonhos"
              className="mt-1 bg-input border-border focus:border-customPurple"
              required
            />
          </div>
          <div>
            <Label htmlFor="valorMeta" className="text-muted-foreground">Valor da Meta (R$)*</Label>
            <Input
              id="valorMeta"
              type="number"
              value={valorMeta}
              onChange={(e) => setValorMeta(e.target.value)}
              placeholder="Ex: 15000"
              className="mt-1 bg-input border-border focus:border-customPurple"
              min="0.01"
              step="0.01"
              required
            />
          </div>
          <div>
            <Label htmlFor="icone" className="text-muted-foreground">Ícone (Opcional)</Label>
            <Input
              id="icone"
              value={icone}
              onChange={(e) => setIcone(e.target.value)}
              placeholder="Ex: 📸, ✈️, 🏠 (Copie e cole um emoji)"
              className="mt-1 bg-input border-border focus:border-customPurple"
            />
             <p className="text-xs text-muted-foreground mt-1">Dica: Use um emoji para identificar sua meta visualmente!</p>
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="mr-2">
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="btn-custom-gradient">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : buttonIcon}
              {isLoading ? (goalData ? "Salvando..." : "Criando...") : buttonText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default GoalModal;