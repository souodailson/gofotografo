import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building, Mail, Phone, FileText, Loader2, Trash2, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';
import { useModalState } from '@/contexts/ModalStateContext';
import { SUPPLIER_CATEGORIES, SUPPLIER_TYPES, SUPPLIER_STATUS } from '@/lib/suppliersConstants';

const SupplierModal = () => {
  const { addSupplier, updateSupplier, getSupplierById } = useData();
  const { toast } = useToast();
  const { openModals, closeModal } = useModalState();
  const { isOpen, supplierId } = openModals['supplier'] || {};
  const supplier = supplierId ? getSupplierById(supplierId) : null;

  const [isLoading, setIsLoading] = useState(false);

  const getInitialFormData = useCallback(() => ({
    name: '',
    email: '',
    phone: '',
    supplier_type: 'pessoa_juridica',
    category: '',
    status: 'ativo',
    cpf: '',
    cnpj: '',
    notes: '',
  }), []);
  
  const [formData, setFormData] = useState(getInitialFormData());

  const DRAFT_KEY = supplier ? `supplier_form_draft_${supplier.id}` : 'supplier_form_draft_new';

  useEffect(() => {
    if (isOpen) {
      const draft = localStorage.getItem(DRAFT_KEY);
      if (draft) {
        setFormData(JSON.parse(draft));
      } else if (supplier) {
        const supplierData = {
          name: supplier.name || '',
          email: supplier.email || '',
          phone: supplier.phone || '',
          supplier_type: supplier.supplier_type || 'pessoa_juridica',
          category: supplier.category || '',
          status: supplier.status || 'ativo',
          cpf: supplier.cpf || '',
          cnpj: supplier.cnpj || '',
          notes: supplier.notes || '',
        };
        setFormData(supplierData);
      } else {
        setFormData(getInitialFormData());
      }
    }
  }, [supplier, isOpen, DRAFT_KEY, getInitialFormData]);

  useEffect(() => {
    if (isOpen) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
    }
  }, [formData, isOpen, DRAFT_KEY]);

  const handleCloseModal = () => {
    localStorage.removeItem(DRAFT_KEY);
    closeModal('supplier');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Erro de Validação",
        description: "O nome do fornecedor é obrigatório.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    const dataToSave = { ...formData };
    if (dataToSave.supplier_type === 'pessoa_fisica' || dataToSave.supplier_type === 'mei') {
      dataToSave.cnpj = ''; 
    } else {
      dataToSave.cpf = '';
    }

    try {
      if (supplier) {
        await updateSupplier(supplier.id, dataToSave);
        toast({
          title: "Fornecedor atualizado",
          description: "Fornecedor foi atualizado com sucesso!"
        });
      } else {
        await addSupplier(dataToSave);
        toast({
          title: "Fornecedor adicionado",
          description: "Novo fornecedor foi adicionado com sucesso!"
        });
      }
      localStorage.removeItem(DRAFT_KEY);
      handleCloseModal();
    } catch(error) {
      toast({
        title: "Erro ao salvar",
        description: `Falha ao salvar fornecedor: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const newState = { ...prev, [field]: value };
      if (field === 'supplier_type') {
        newState.cpf = '';
        newState.cnpj = '';
      }
      return newState;
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[5000]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="bg-card/80 backdrop-blur-lg border border-border/50 rounded-xl p-0 w-full max-w-md shadow-2xl max-h-[90vh] flex flex-col z-[5001]"
        >
          <div className="flex items-center justify-between p-6 border-b border-border/50">
            <h2 className="text-xl font-semibold text-foreground">
              {supplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCloseModal}
              className="w-8 h-8 text-muted-foreground hover:bg-accent"
              disabled={isLoading}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 p-6 overflow-y-auto scrollbar-thin">
            <div className="flex flex-col items-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Briefcase className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                <Building className="w-4 h-4 inline mr-2" />
                Nome do Fornecedor *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background/70 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Nome do fornecedor"
                required
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                <Building className="w-4 h-4 inline mr-2" />
                Tipo de Fornecedor
              </label>
              <select
                value={formData.supplier_type}
                onChange={(e) => handleInputChange('supplier_type', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background/70 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={isLoading}
              >
                {SUPPLIER_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                <Briefcase className="w-4 h-4 inline mr-2" />
                Categoria
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background/70 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={isLoading}
              >
                <option value="">Selecione uma categoria</option>
                {SUPPLIER_CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {(formData.supplier_type === 'pessoa_fisica' || formData.supplier_type === 'mei') && (
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  <FileText className="w-4 h-4 inline mr-2" />
                  CPF (Opcional)
                </label>
                <input
                  type="text"
                  value={formData.cpf}
                  onChange={(e) => handleInputChange('cpf', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background/70 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="000.000.000-00"
                  disabled={isLoading}
                />
              </div>
            )}

            {formData.supplier_type === 'pessoa_juridica' && (
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  <Building className="w-4 h-4 inline mr-2" />
                  CNPJ (Opcional)
                </label>
                <input
                  type="text"
                  value={formData.cnpj}
                  onChange={(e) => handleInputChange('cnpj', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background/70 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="00.000.000/0000-00"
                  disabled={isLoading}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                <Mail className="w-4 h-4 inline mr-2" />
                Email (Opcional)
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background/70 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="email@exemplo.com"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                <Phone className="w-4 h-4 inline mr-2" />
                Telefone (Opcional)
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background/70 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="+55 11 99999-9999"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                <FileText className="w-4 h-4 inline mr-2" />
                Observações (Opcional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background/70 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent h-20 resize-none"
                placeholder="Observações sobre o fornecedor..."
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background/70 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={isLoading}
              >
                {SUPPLIER_STATUS.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseModal}
                className="flex-1"
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 btn-custom-gradient text-white"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (supplier ? 'Atualizar' : 'Adicionar')}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
};

export default SupplierModal;