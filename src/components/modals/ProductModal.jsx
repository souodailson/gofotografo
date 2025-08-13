import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, FileText, DollarSign, Info, Package, Barcode, Boxes, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useData } from '@/contexts/DataContext';

const productCategories = [
  "Fotos Avulsas", "Álbuns de Fotos", "Quadros", "Canvas", "Acrílico", 
  "Metal Print", "Photobook", "Calendários", "Cards/Cartões", "Blocos", 
  "Imãs", "Buttons/Bottons", "Adesivos", "Porta-retratos", "Molduras",
  "Pen Drive", "CD/DVD", "Galeria Online", "Sessão Fotográfica", "Outros"
];

const selectBaseClasses = "w-full px-3 py-2 border border-border rounded-lg bg-background/70 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent";

const ProductModal = ({ isOpen, onClose, product, onSaveSuccess }) => {
  const { toast } = useToast();
  const { addProduct, updateProduct, user } = useData();
  const [isLoading, setIsLoading] = useState(false);
  
  const getInitialFormData = useCallback(() => ({
    name: '',
    description: '',
    code: '',
    category: '',
    price_pix: '',
    price_card: '',
    cost_price: '',
    stock_quantity: '',
    min_stock: '',
    unit: 'un',
    active: true,
    user_id: user?.id || null,
  }), [user]);

  const [formData, setFormData] = useState(getInitialFormData());
  const DRAFT_KEY = product ? `product_form_draft_${product.id}` : 'product_form_draft_new';

  useEffect(() => {
    if (isOpen) {
      const draft = localStorage.getItem(DRAFT_KEY);
      if (draft) {
        const parsedDraft = JSON.parse(draft);
        setFormData({...parsedDraft, user_id: parsedDraft.user_id || user?.id});
      } else if (product) {
        setFormData({
          name: product.name || '',
          description: product.description || '',
          code: product.code || '',
          category: product.category || '',
          price_pix: product.price_pix !== undefined ? String(product.price_pix) : '',
          price_card: product.price_card !== undefined ? String(product.price_card) : '',
          cost_price: product.cost_price !== undefined ? String(product.cost_price) : '',
          stock_quantity: product.stock_quantity !== undefined ? String(product.stock_quantity) : '',
          min_stock: product.min_stock !== undefined ? String(product.min_stock) : '',
          unit: product.unit || 'un',
          active: product.active !== undefined ? product.active : true,
          user_id: product.user_id || user?.id,
        });
      } else {
        setFormData(getInitialFormData());
      }
    }
  }, [product, isOpen, DRAFT_KEY, getInitialFormData, user]);

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

  const generateProductCode = () => {
    const prefix = formData.category ? formData.category.substring(0, 3).toUpperCase() : 'PRD';
    const timestamp = Date.now().toString().slice(-6);
    const randomNum = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    const code = `${prefix}${timestamp}${randomNum}`;
    handleInputChange('code', code);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Erro de Autenticação", description: "Usuário não está autenticado.", variant: "destructive" });
      return;
    }
    if (!formData.name || !formData.price_pix || !formData.category) {
      toast({ title: "Erro de Validação", description: "Nome, Categoria e Preço PIX são obrigatórios.", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    const dataToSave = {
      ...formData,
      price_pix: parseFloat(formData.price_pix) || 0,
      price_card: formData.price_card ? parseFloat(formData.price_card) : null,
      cost_price: formData.cost_price ? parseFloat(formData.cost_price) : null,
      stock_quantity: formData.stock_quantity ? parseInt(formData.stock_quantity) : null,
      min_stock: formData.min_stock ? parseInt(formData.min_stock) : null,
      user_id: user.id, 
    };

    try {
      if (product && product.id) {
        await updateProduct(product.id, dataToSave);
      } else {
        await addProduct(dataToSave);
      }
      toast({ title: "Produto Salvo", description: `O produto "${formData.name}" foi salvo com sucesso!` });
      localStorage.removeItem(DRAFT_KEY);
      if(onSaveSuccess) onSaveSuccess();
      onClose();
    } catch (error) {
      toast({ title: "Erro ao Salvar Produto", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const unitOptions = [
    { value: 'un', label: 'Unidade' },
    { value: 'pç', label: 'Peça' },
    { value: 'kit', label: 'Kit' },
    { value: 'par', label: 'Par' },
    { value: 'cx', label: 'Caixa' },
    { value: 'pct', label: 'Pacote' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={handleCloseModal}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
          className="bg-card/70 backdrop-blur-xl border border-border/50 rounded-xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-thin relative"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">
              {product ? 'Editar Produto' : 'Novo Produto'}
            </h2>
            <Button variant="ghost" size="icon" onClick={handleCloseModal} className="w-8 h-8" disabled={isLoading}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormSection title="Informações Básicas">
              <FormField icon={ShoppingCart} label="Nome do Produto *" htmlFor="product-name">
                <input 
                  id="product-name" 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => handleInputChange('name', e.target.value)} 
                  placeholder="Ex: Foto 10x15, Álbum Premium, Quadro 30x40" 
                  required 
                  disabled={isLoading} 
                />
              </FormField>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField icon={Package} label="Categoria *" htmlFor="product-category">
                  <select 
                    id="product-category" 
                    value={formData.category} 
                    onChange={(e) => handleInputChange('category', e.target.value)} 
                    required 
                    className={selectBaseClasses} 
                    disabled={isLoading}
                  >
                    <option value="">Selecione uma categoria</option>
                    {productCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </FormField>
                
                <FormField icon={Barcode} label="Código do Produto" htmlFor="product-code">
                  <div className="flex space-x-2">
                    <input 
                      id="product-code" 
                      type="text" 
                      value={formData.code} 
                      onChange={(e) => handleInputChange('code', e.target.value)} 
                      placeholder="Ex: FOT001, ALB002" 
                      disabled={isLoading}
                      className="flex-1"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={generateProductCode}
                      disabled={isLoading}
                      className="px-3"
                    >
                      Gerar
                    </Button>
                  </div>
                </FormField>
              </div>

              <FormField icon={FileText} label="Descrição" htmlFor="product-desc">
                <textarea 
                  id="product-desc" 
                  value={formData.description} 
                  onChange={(e) => handleInputChange('description', e.target.value)} 
                  placeholder="Detalhes sobre o produto, acabamento, tamanhos..." 
                  rows="3" 
                  disabled={isLoading} 
                />
              </FormField>
            </FormSection>

            <FormSection title="Precificação">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField icon={DollarSign} label="Preço PIX *" htmlFor="product-price-pix">
                  <input 
                    id="product-price-pix" 
                    type="number" 
                    value={formData.price_pix} 
                    onChange={(e) => handleInputChange('price_pix', e.target.value)} 
                    placeholder="0.00" 
                    step="0.01" 
                    min="0" 
                    required 
                    disabled={isLoading} 
                  />
                </FormField>
                
                <FormField icon={DollarSign} label="Preço Cartão" htmlFor="product-price-card">
                  <input 
                    id="product-price-card" 
                    type="number" 
                    value={formData.price_card} 
                    onChange={(e) => handleInputChange('price_card', e.target.value)} 
                    placeholder="0.00" 
                    step="0.01" 
                    min="0" 
                    disabled={isLoading} 
                  />
                </FormField>
                
                <FormField icon={Info} label="Preço de Custo" htmlFor="product-cost">
                  <input 
                    id="product-cost" 
                    type="number" 
                    value={formData.cost_price} 
                    onChange={(e) => handleInputChange('cost_price', e.target.value)} 
                    placeholder="0.00" 
                    step="0.01" 
                    min="0" 
                    disabled={isLoading} 
                  />
                </FormField>
              </div>
            </FormSection>
            
            <FormSection title="Controle de Estoque">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField icon={Boxes} label="Quantidade em Estoque" htmlFor="product-stock">
                  <input 
                    id="product-stock" 
                    type="number" 
                    value={formData.stock_quantity} 
                    onChange={(e) => handleInputChange('stock_quantity', e.target.value)} 
                    placeholder="0" 
                    min="0" 
                    disabled={isLoading} 
                  />
                </FormField>
                
                <FormField icon={Boxes} label="Estoque Mínimo" htmlFor="product-min-stock">
                  <input 
                    id="product-min-stock" 
                    type="number" 
                    value={formData.min_stock} 
                    onChange={(e) => handleInputChange('min_stock', e.target.value)} 
                    placeholder="0" 
                    min="0" 
                    disabled={isLoading} 
                  />
                </FormField>
                
                <FormField icon={Package} label="Unidade" htmlFor="product-unit">
                  <select 
                    id="product-unit" 
                    value={formData.unit} 
                    onChange={(e) => handleInputChange('unit', e.target.value)} 
                    className={selectBaseClasses} 
                    disabled={isLoading}
                  >
                    {unitOptions.map(unit => (
                      <option key={unit.value} value={unit.value}>{unit.label}</option>
                    ))}
                  </select>
                </FormField>
              </div>
            </FormSection>

            <FormSection title="Status">
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="product-active"
                  checked={formData.active} 
                  onChange={(e) => handleInputChange('active', e.target.checked)} 
                  className="form-checkbox h-4 w-4 text-customPurple border-border rounded focus:ring-customPurple" 
                  disabled={isLoading} 
                />
                <label htmlFor="product-active" className="text-sm text-muted-foreground">
                  Produto ativo (disponível para vendas)
                </label>
              </div>
            </FormSection>

            <div className="flex space-x-3 pt-4 border-t border-border mt-6">
              <Button type="button" variant="outline" onClick={handleCloseModal} className="flex-1" disabled={isLoading}>
                Cancelar
              </Button>
              <Button type="submit" className="flex-1 btn-custom-gradient text-white" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (product ? 'Salvar Alterações' : 'Criar Produto')}
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
       if (child.type === 'select' || child.props?.className?.includes?.('grid')) {
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

export default ProductModal;