import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, FileText, DollarSign, Info, Trash2, Plus, Tag as TagIcon, Edit2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useData } from '@/contexts/DataContext';

const photographyNiches = [
  "Casamento", "Gestante", "Newborn", "Família", "Infantil", "Debutante (15 anos)", 
  "Formatura", "Empresarial/Corporativo", "Produtos", "Gastronomia", "Moda", 
  "Esportivo", "Eventos Sociais", "Imobiliário", "Pets", "Sensual/Boudoir", "Outro"
];

const selectBaseClasses = "w-full px-3 py-2 border border-border rounded-lg bg-background/70 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent";

const ServicePackageModal = ({ isOpen, onClose, servicePackage, onSaveSuccess }) => {
  const { toast } = useToast();
  const { addServicePackage, updateServicePackage, user } = useData();
  const [isLoading, setIsLoading] = useState(false);
  
  const getInitialFormData = useCallback(() => ({
    name: '',
    description: '',
    niche: '',
    price_cash_pix: '',
    price_card: '',
    cost: '',
    items_included: [{ name: '', quantity: 1 }],
    payment_options: [],
    details: '',
    user_id: user?.id || null,
  }), [user]);

  const [formData, setFormData] = useState(getInitialFormData());
  const DRAFT_KEY = servicePackage ? `service_package_form_draft_${servicePackage.id}` : 'service_package_form_draft_new';

  useEffect(() => {
    if (isOpen) {
      const draft = localStorage.getItem(DRAFT_KEY);
      if (draft) {
        const parsedDraft = JSON.parse(draft);
        setFormData({...parsedDraft, user_id: parsedDraft.user_id || user?.id});
      } else if (servicePackage) {
        setFormData({
          name: servicePackage.name || '',
          description: servicePackage.description || '',
          niche: servicePackage.niche || '',
          price_cash_pix: servicePackage.price_cash_pix !== undefined ? String(servicePackage.price_cash_pix) : '',
          price_card: servicePackage.price_card !== undefined ? String(servicePackage.price_card) : '',
          cost: servicePackage.cost !== undefined ? String(servicePackage.cost) : '',
          items_included: servicePackage.items_included && servicePackage.items_included.length > 0 ? servicePackage.items_included : [{ name: '', quantity: 1 }],
          payment_options: servicePackage.payment_options || [],
          details: servicePackage.details || '',
          user_id: servicePackage.user_id || user?.id,
        });
      } else {
        setFormData(getInitialFormData());
      }
    }
  }, [servicePackage, isOpen, DRAFT_KEY, getInitialFormData, user]);

  useEffect(() => {
    if (isOpen) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
    }
  }, [formData, isOpen, DRAFT_KEY]);

  const handleCloseModal = () => {
    localStorage.removeItem(DRAFT_KEY);
    onClose();
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items_included];
    newItems[index][field] = field === 'quantity' ? parseInt(value, 10) || 1 : value;
    setFormData(prev => ({ ...prev, items_included: newItems }));
  };

  const addItem = () => {
    setFormData(prev => ({ ...prev, items_included: [...prev.items_included, { name: '', quantity: 1 }] }));
  };

  const removeItem = (index) => {
    const newItems = formData.items_included.filter((_, i) => i !== index);
    if (newItems.length === 0) {
      setFormData(prev => ({ ...prev, items_included: [{ name: '', quantity: 1 }] }));
    } else {
      setFormData(prev => ({ ...prev, items_included: newItems }));
    }
  };

  const handlePaymentOptionChange = (option) => {
    setFormData(prev => {
      const currentOptions = prev.payment_options || [];
      if (currentOptions.includes(option)) {
        return { ...prev, payment_options: currentOptions.filter(item => item !== option) };
      } else {
        return { ...prev, payment_options: [...currentOptions, option] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Erro de Autenticação", description: "Usuário não está autenticado.", variant: "destructive" });
      return;
    }
    if (!formData.name || !formData.price_cash_pix || !formData.niche) {
      toast({ title: "Erro de Validação", description: "Nome do pacote, Nicho e Preço (à vista/Pix) são obrigatórios.", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    const dataToSave = {
      ...formData,
      price_cash_pix: parseFloat(formData.price_cash_pix) || 0,
      price_card: formData.price_card ? parseFloat(formData.price_card) : null,
      cost: formData.cost ? parseFloat(formData.cost) : null,
      items_included: formData.items_included.filter(item => item.name.trim() !== ''),
      user_id: user.id, 
    };

    try {
      if (servicePackage && servicePackage.id) {
        await updateServicePackage(servicePackage.id, dataToSave);
      } else {
        await addServicePackage(dataToSave);
      }
      toast({ title: "Pacote Salvo", description: `O pacote "${formData.name}" foi salvo com sucesso!` });
      localStorage.removeItem(DRAFT_KEY);
      if(onSaveSuccess) onSaveSuccess();
      onClose();
    } catch (error) {
      toast({ title: "Erro ao Salvar Pacote", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
  const paymentOptionsList = [
    "Entrada + Parcelamento", "Parcelamento Integral Cartão", "À vista com Desconto"
  ];

  return (
    <AnimatePresence>
      {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        id="novo-pacote-backdrop-id"
        onClick={handleCloseModal}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
          className="bg-card/70 backdrop-blur-xl border border-border/50 rounded-xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-thin relative"
          id="novo-pacote-modal-id"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">
              {servicePackage ? 'Editar Pacote de Serviço' : 'Novo Pacote de Serviço'}
            </h2>
            <Button variant="ghost" size="icon" onClick={handleCloseModal} className="w-8 h-8" disabled={isLoading}><X className="w-4 h-4" /></Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormSection title="Informações Básicas">
              <FormField icon={Package} label="Nome do Pacote *" htmlFor="pkg-name">
                <input id="pkg-name" type="text" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} placeholder="Ex: Ensaio Casal Completo" required disabled={isLoading} />
              </FormField>
              <FormField icon={TagIcon} label="Nicho do Serviço *" htmlFor="pkg-niche">
                <select id="pkg-niche" value={formData.niche} onChange={(e) => handleInputChange('niche', e.target.value)} required className={selectBaseClasses} disabled={isLoading}>
                  <option value="">Selecione um nicho</option>
                  {photographyNiches.map(niche => (
                    <option key={niche} value={niche}>{niche}</option>
                  ))}
                </select>
              </FormField>
              <FormField icon={FileText} label="Descrição" htmlFor="pkg-desc">
                <textarea id="pkg-desc" value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} placeholder="Detalhes sobre o pacote..." rows="3" disabled={isLoading} />
              </FormField>
            </FormSection>

            <FormSection title="Precificação">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField icon={DollarSign} label="Preço (À vista/Pix) *" htmlFor="pkg-price-cash">
                  <input id="pkg-price-cash" type="number" value={formData.price_cash_pix} onChange={(e) => handleInputChange('price_cash_pix', e.target.value)} placeholder="0.00" step="0.01" min="0" required disabled={isLoading} />
                </FormField>
                <FormField icon={DollarSign} label="Preço (Cartão)" htmlFor="pkg-price-card">
                  <input id="pkg-price-card" type="number" value={formData.price_card} onChange={(e) => handleInputChange('price_card', e.target.value)} placeholder="0.00" step="0.01" min="0" disabled={isLoading} />
                </FormField>
              </div>
              <FormField icon={Info} label="Custo Estimado do Pacote" htmlFor="pkg-cost">
                <input id="pkg-cost" type="number" value={formData.cost} onChange={(e) => handleInputChange('cost', e.target.value)} placeholder="0.00" step="0.01" min="0" disabled={isLoading} />
              </FormField>
            </FormSection>
            
            <FormSection title="Itens Inclusos">
              {formData.items_included.map((item, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input type="text" value={item.name} onChange={(e) => handleItemChange(index, 'name', e.target.value)} placeholder="Nome do item" className="flex-grow px-3 py-2 border border-border rounded-lg bg-background/70" disabled={isLoading} />
                  <input type="number" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} placeholder="Qtd" min="1" className="w-20 px-3 py-2 border border-border rounded-lg bg-background/70" disabled={isLoading} />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)} className="text-red-500" disabled={isLoading}><Trash2 className="w-4 h-4" /></Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addItem} className="mt-2" disabled={isLoading}><Plus className="w-4 h-4 mr-2" />Adicionar Item</Button>
            </FormSection>

            <FormSection title="Opções de Pagamento">
              <div className="space-y-2">
                {paymentOptionsList.map(option => (
                  <label key={option} className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={(formData.payment_options || []).includes(option)} onChange={() => handlePaymentOptionChange(option)} className="form-checkbox h-4 w-4 text-customPurple border-border rounded focus:ring-customPurple" disabled={isLoading} />
                    <span className="text-muted-foreground">{option}</span>
                  </label>
                ))}
              </div>
            </FormSection>

            <FormSection title="Detalhes Adicionais">
               <FormField icon={Edit2} label="Observações/Termos" htmlFor="pkg-details">
                <textarea id="pkg-details" value={formData.details} onChange={(e) => handleInputChange('details', e.target.value)} placeholder="Informações extras, termos e condições..." rows="4" disabled={isLoading} />
              </FormField>
            </FormSection>

            <div className="flex space-x-3 pt-4 border-t border-border mt-6">
              <Button type="button" variant="outline" onClick={handleCloseModal} className="flex-1" disabled={isLoading}>Cancelar</Button>
              <Button type="submit" className="flex-1 btn-custom-gradient text-white" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (servicePackage ? 'Salvar Alterações' : 'Criar Pacote')}
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
  );
};

const FormSection = ({ title, children }) => (
  <div className="py-3">
    <h3 className="text-md font-semibold text-foreground mb-3 border-b border-border pb-2">{title}</h3>
    <div className="space-y-3">{children}</div>
  </div>
);

const FormField = ({ icon: Icon, label, htmlFor, children }) => (
  <div>
    <label htmlFor={htmlFor} className="block text-sm font-medium text-muted-foreground mb-1">
      {Icon && <Icon className="w-4 h-4 inline mr-2" />}
      {label}
    </label>
    {React.Children.map(children, child => {
       if (child.type === 'select') {
          return React.cloneElement(child, {
            className: `${child.props.className || ''} ${selectBaseClasses}`,
          });
        }
      return React.cloneElement(child, { 
        className: `${child.props.className || ''} w-full px-3 py-2 border border-border rounded-lg bg-background/70 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent` 
      })
    })}
  </div>
);


export default ServicePackageModal;