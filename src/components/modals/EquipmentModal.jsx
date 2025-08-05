import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { DollarSign, Tag, Type, Hash, CalendarDays, Shield, FileText, Package, Loader2 } from 'lucide-react';

const EquipmentModal = ({ isOpen, onClose, onSave, equipmentData, isLoading }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    nome_equipamento: '',
    marca: '',
    modelo: '',
    numero_serie: '',
    data_compra: '',
    valor_compra: '',
    vida_util_anos: '',
    seguradora: '',
    numero_apolice: '',
    link_nota_fiscal: '',
  });

  useEffect(() => {
    if (equipmentData) {
      setFormData({
        nome_equipamento: equipmentData.nome_equipamento || '',
        marca: equipmentData.marca || '',
        modelo: equipmentData.modelo || '',
        numero_serie: equipmentData.numero_serie || '',
        data_compra: equipmentData.data_compra ? equipmentData.data_compra.split('T')[0] : '',
        valor_compra: equipmentData.valor_compra || '',
        vida_util_anos: equipmentData.vida_util_anos || '',
        seguradora: equipmentData.seguradora || '',
        numero_apolice: equipmentData.numero_apolice || '',
        link_nota_fiscal: equipmentData.link_nota_fiscal || '',
      });
    } else {
      setFormData({
        nome_equipamento: '',
        marca: '',
        modelo: '',
        numero_serie: '',
        data_compra: '',
        valor_compra: '',
        vida_util_anos: '',
        seguradora: '',
        numero_apolice: '',
        link_nota_fiscal: '',
      });
    }
  }, [equipmentData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nome_equipamento || !formData.valor_compra || !formData.data_compra || !formData.vida_util_anos) {
      toast({
        title: "Campos Obrigatórios",
        description: "Nome, Valor da Compra, Data da Compra e Vida Útil são obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    onSave(formData);
  };
  
  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] shadow-2xl border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground flex items-center">
            <Package className="w-7 h-7 mr-3 text-customPurple" />
            {equipmentData ? 'Editar Equipamento' : 'Adicionar Novo Equipamento'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {equipmentData ? 'Atualize os detalhes do seu equipamento.' : 'Preencha os detalhes do seu novo equipamento.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-muted-foreground/50 scrollbar-track-transparent">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="nome_equipamento" className="flex items-center mb-1.5 text-muted-foreground">
                <Tag className="w-4 h-4 mr-2 text-customPurple" /> Nome do Equipamento*
              </Label>
              <Input id="nome_equipamento" name="nome_equipamento" value={formData.nome_equipamento} onChange={handleChange} placeholder="Ex: Câmera Sony A7IV" required className="bg-input border-border focus:border-customPurple" />
            </div>
            <div>
              <Label htmlFor="marca" className="flex items-center mb-1.5 text-muted-foreground">
                <Type className="w-4 h-4 mr-2 text-customPurple" /> Marca
              </Label>
              <Input id="marca" name="marca" value={formData.marca} onChange={handleChange} placeholder="Ex: Sony" className="bg-input border-border focus:border-customPurple" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="modelo" className="flex items-center mb-1.5 text-muted-foreground">
                <Package className="w-4 h-4 mr-2 text-customPurple" /> Modelo
              </Label>
              <Input id="modelo" name="modelo" value={formData.modelo} onChange={handleChange} placeholder="Ex: ILCE-7M4" className="bg-input border-border focus:border-customPurple" />
            </div>
            <div>
              <Label htmlFor="numero_serie" className="flex items-center mb-1.5 text-muted-foreground">
                <Hash className="w-4 h-4 mr-2 text-customPurple" /> Número de Série
              </Label>
              <Input id="numero_serie" name="numero_serie" value={formData.numero_serie} onChange={handleChange} placeholder="Ex: SN123456789" className="bg-input border-border focus:border-customPurple" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="data_compra" className="flex items-center mb-1.5 text-muted-foreground">
                <CalendarDays className="w-4 h-4 mr-2 text-customPurple" /> Data da Compra*
              </Label>
              <Input id="data_compra" name="data_compra" type="date" value={formData.data_compra} onChange={handleChange} required className="bg-input border-border focus:border-customPurple" max={today} />
            </div>
            <div>
              <Label htmlFor="valor_compra" className="flex items-center mb-1.5 text-muted-foreground">
                <DollarSign className="w-4 h-4 mr-2 text-customPurple" /> Valor da Compra (R$)*
              </Label>
              <Input id="valor_compra" name="valor_compra" type="number" step="0.01" value={formData.valor_compra} onChange={handleChange} placeholder="Ex: 15000.00" required className="bg-input border-border focus:border-customPurple" />
            </div>
            <div>
              <Label htmlFor="vida_util_anos" className="flex items-center mb-1.5 text-muted-foreground">
                <CalendarDays className="w-4 h-4 mr-2 text-customPurple" /> Vida Útil (Anos)*
              </Label>
              <Input id="vida_util_anos" name="vida_util_anos" type="number" value={formData.vida_util_anos} onChange={handleChange} placeholder="Ex: 5" required className="bg-input border-border focus:border-customPurple" />
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center"><Shield className="w-5 h-5 mr-2 text-customGreen" />Informações do Seguro (Opcional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="seguradora" className="flex items-center mb-1.5 text-muted-foreground">
                  <FileText className="w-4 h-4 mr-2 text-customGreen" /> Seguradora
                </Label>
                <Input id="seguradora" name="seguradora" value={formData.seguradora} onChange={handleChange} placeholder="Ex: Porto Seguro" className="bg-input border-border focus:border-customGreen" />
              </div>
              <div>
                <Label htmlFor="numero_apolice" className="flex items-center mb-1.5 text-muted-foreground">
                  <Hash className="w-4 h-4 mr-2 text-customGreen" /> Número da Apólice
                </Label>
                <Input id="numero_apolice" name="numero_apolice" value={formData.numero_apolice} onChange={handleChange} placeholder="Ex: AP123456789" className="bg-input border-border focus:border-customGreen" />
              </div>
            </div>
          </div>
          
          <div>
            <Label htmlFor="link_nota_fiscal" className="flex items-center mb-1.5 text-muted-foreground">
              <FileText className="w-4 h-4 mr-2 text-customPurple" /> Link da Nota Fiscal (Opcional)
            </Label>
            <Input id="link_nota_fiscal" name="link_nota_fiscal" type="url" value={formData.link_nota_fiscal} onChange={handleChange} placeholder="https://..." className="bg-input border-border focus:border-customPurple" />
          </div>

        </form>
        <DialogFooter className="pt-6 border-t border-border">
          <Button variant="outline" onClick={onClose} disabled={isLoading} className="hover:border-destructive hover:text-destructive">
            Cancelar
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={isLoading} className="btn-custom-gradient">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar Equipamento'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EquipmentModal;