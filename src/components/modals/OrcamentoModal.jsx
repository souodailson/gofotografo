import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useData } from '@/contexts/DataContext';
import { supabase } from '@/lib/supabaseClient'; // Importar supabase diretamente para consistência
import { PlusCircle, Save, Edit3, XCircle } from 'lucide-react';

const OrcamentoModal = ({ isOpen, onClose, clientId, editingOrcamento, onSuccess }) => {
  const { toast } = useToast();
  const { user, addOrcamento, updateOrcamento } = useData();
  const [formData, setFormData] = useState({
    descricao_servico: '',
    valor: '',
    data_envio: new Date().toISOString().split('T')[0],
    status: 'Enviado',
    link_pdf: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (editingOrcamento) {
      setFormData({
        descricao_servico: editingOrcamento.descricao_servico || '',
        valor: editingOrcamento.valor || '',
        data_envio: editingOrcamento.data_envio ? new Date(editingOrcamento.data_envio + 'T00:00:00').toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        status: editingOrcamento.status || 'Enviado',
        link_pdf: editingOrcamento.link_pdf || '',
      });
    } else {
      setFormData({
        descricao_servico: '',
        valor: '',
        data_envio: new Date().toISOString().split('T')[0],
        status: 'Enviado',
        link_pdf: '',
      });
    }
  }, [editingOrcamento, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !clientId) {
      toast({ title: "Erro", description: "Usuário ou cliente não identificado.", variant: "destructive" });
      return;
    }
    setIsSaving(true);

    const dataToSave = {
      ...formData,
      valor: parseFloat(formData.valor) || 0,
      client_id: clientId,
      user_id: user.id,
    };

    try {
      if (editingOrcamento) {
        await updateOrcamento(editingOrcamento.id, dataToSave);
        toast({ title: "Sucesso!", description: "Orçamento atualizado." });
      } else {
        await addOrcamento(dataToSave);
        toast({ title: "Sucesso!", description: "Orçamento adicionado." });
      }
      onSuccess();
    } catch (error) {
      console.error("Erro ao salvar orçamento:", error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar o orçamento.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px] border-border shadow-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center text-primary">
            {editingOrcamento ? <Edit3 className="mr-2 h-5 w-5" /> : <PlusCircle className="mr-2 h-5 w-5" />}
            {editingOrcamento ? 'Editar Orçamento' : 'Novo Orçamento'}
          </DialogTitle>
          <DialogDescription>
            {editingOrcamento ? 'Atualize os detalhes do orçamento.' : 'Preencha os detalhes para registrar um novo orçamento.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="descricao_servico" className="text-right col-span-1">
              Descrição
            </Label>
            <Textarea
              id="descricao_servico"
              name="descricao_servico"
              value={formData.descricao_servico}
              onChange={handleChange}
              className="col-span-3"
              placeholder="Ex: Pacote Casamento Essencial"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="valor" className="text-right col-span-1">
              Valor (R$)
            </Label>
            <Input
              id="valor"
              name="valor"
              type="number"
              step="0.01"
              value={formData.valor}
              onChange={handleChange}
              className="col-span-3"
              placeholder="Ex: 1500.00"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="data_envio" className="text-right col-span-1">
              Data de Envio
            </Label>
            <Input
              id="data_envio"
              name="data_envio"
              type="date"
              value={formData.data_envio}
              onChange={handleChange}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right col-span-1">
              Status
            </Label>
            <Select
              name="status"
              value={formData.status}
              onValueChange={(value) => handleSelectChange('status', value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Enviado">Enviado</SelectItem>
                <SelectItem value="Visto">Visto</SelectItem>
                <SelectItem value="Aprovado">Aprovado</SelectItem>
                <SelectItem value="Recusado">Recusado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="link_pdf" className="text-right col-span-1">
              Link PDF
            </Label>
            <Input
              id="link_pdf"
              name="link_pdf"
              type="url"
              value={formData.link_pdf}
              onChange={handleChange}
              className="col-span-3"
              placeholder="https://seu-orcamento.com/link.pdf"
            />
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              <XCircle className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving} className="btn-custom-gradient">
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? (editingOrcamento ? 'Salvando Alterações...' : 'Salvando Orçamento...') : (editingOrcamento ? 'Salvar Alterações' : 'Salvar Orçamento')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OrcamentoModal;