import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';
import { useModalState } from '@/contexts/ModalStateContext';
import { format } from 'date-fns';
import { 
  ArrowLeft, ArrowRight, Package, ShoppingCart, Plus, Minus, 
  Wallet, Search, CheckCircle, DollarSign, Calendar, User
} from 'lucide-react';
import ReceiptButton from '@/components/receipts/ReceiptButton';
import { FINANCIAL_CATEGORIES, PAYMENT_METHODS } from '@/lib/financialConstants';

const TRANSACTION_TYPES = {
  SIMPLE: 'simple',
  PRODUCTS: 'products',
  SERVICES: 'services',
  MIXED: 'mixed'
};

const WIZARD_STEPS = {
  TYPE_SELECTION: 'type',
  ITEMS_SELECTION: 'items',
  TRANSACTION_DETAILS: 'details',
  CONFIRMATION: 'confirmation'
};

const FinancialWizardModal = ({ isOpen, onClose, type, transactionData, onSaveSuccess }) => {
  const { 
    clients, suppliers = [], products = [], servicePackages = [], 
    addTransaction, updateTransaction, wallets 
  } = useData();
  const { toast } = useToast();
  const { openModal } = useModalState();

  // Wizard state
  const [currentStep, setCurrentStep] = useState(WIZARD_STEPS.TYPE_SELECTION);
  const [transactionType, setTransactionType] = useState(TRANSACTION_TYPES.SIMPLE);
  
  // Items state
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  
  // Transaction details state
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [data, setData] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [status, setStatus] = useState('PENDENTE');
  const [clienteId, setClienteId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [categoria, setCategoria] = useState('');
  const [metodoPagamento, setMetodoPagamento] = useState('');
  const [walletId, setWalletId] = useState('');
  const [desconto, setDesconto] = useState('');
  
  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [savedTransaction, setSavedTransaction] = useState(null);

  const resetState = useCallback(() => {
    setCurrentStep(WIZARD_STEPS.TYPE_SELECTION);
    setTransactionType(TRANSACTION_TYPES.SIMPLE);
    setSelectedProducts([]);
    setSelectedServices([]);
    setDescricao('');
    setValor('');
    setData(format(new Date(), 'yyyy-MM-dd'));
    setStatus('PENDENTE');
    setClienteId('');
    setSupplierId('');
    setCategoria('');
    setMetodoPagamento('');
    setWalletId('');
    setDesconto('');
  }, []);

  useEffect(() => {
    if (isOpen && !transactionData) {
      resetState();
    }
  }, [isOpen, transactionData, resetState]);

  // Calculate total value from selected items
  const calculateTotal = () => {
    let total = 0;
    
    selectedProducts.forEach(item => {
      const priceField = metodoPagamento === 'PIX' || metodoPagamento === 'Dinheiro' ? 'price_pix' : 'price_card';
      const price = item.product[priceField] || item.product.price_pix || 0;
      total += price * item.quantity;
    });
    
    selectedServices.forEach(item => {
      const priceField = metodoPagamento === 'PIX' || metodoPagamento === 'Dinheiro' ? 'price_cash_pix' : 'price_card';
      const price = item.service[priceField] || item.service.price_cash_pix || 0;
      total += price * item.quantity;
    });
    
    const discount = parseFloat(desconto) || 0;
    return Math.max(0, total - discount);
  };

  useEffect(() => {
    if (transactionType !== TRANSACTION_TYPES.SIMPLE) {
      const total = calculateTotal();
      setValor(total.toString());
    }
  }, [selectedProducts, selectedServices, metodoPagamento, desconto, transactionType]);

  // Product/Service management functions
  const addProduct = (product) => {
    const existingIndex = selectedProducts.findIndex(item => item.product.id === product.id);
    if (existingIndex >= 0) {
      const updated = [...selectedProducts];
      updated[existingIndex].quantity += 1;
      setSelectedProducts(updated);
    } else {
      setSelectedProducts([...selectedProducts, { product, quantity: 1 }]);
    }
  };

  const removeProduct = (productId) => {
    setSelectedProducts(selectedProducts.filter(item => item.product.id !== productId));
  };

  const updateProductQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeProduct(productId);
      return;
    }
    
    const updated = selectedProducts.map(item => 
      item.product.id === productId ? { ...item, quantity: newQuantity } : item
    );
    setSelectedProducts(updated);
  };

  const addService = (service) => {
    const existingIndex = selectedServices.findIndex(item => item.service.id === service.id);
    if (existingIndex >= 0) {
      const updated = [...selectedServices];
      updated[existingIndex].quantity += 1;
      setSelectedServices(updated);
    } else {
      setSelectedServices([...selectedServices, { service, quantity: 1 }]);
    }
  };

  const removeService = (serviceId) => {
    setSelectedServices(selectedServices.filter(item => item.service.id !== serviceId));
  };

  const updateServiceQuantity = (serviceId, newQuantity) => {
    if (newQuantity <= 0) {
      removeService(serviceId);
      return;
    }
    
    const updated = selectedServices.map(item => 
      item.service.id === serviceId ? { ...item, quantity: newQuantity } : item
    );
    setSelectedServices(updated);
  };

  // Navigation functions
  const goToNextStep = () => {
    switch (currentStep) {
      case WIZARD_STEPS.TYPE_SELECTION:
        if (transactionType === TRANSACTION_TYPES.SIMPLE) {
          setCurrentStep(WIZARD_STEPS.TRANSACTION_DETAILS);
        } else {
          setCurrentStep(WIZARD_STEPS.ITEMS_SELECTION);
        }
        break;
      case WIZARD_STEPS.ITEMS_SELECTION:
        setCurrentStep(WIZARD_STEPS.TRANSACTION_DETAILS);
        break;
      case WIZARD_STEPS.TRANSACTION_DETAILS:
        setCurrentStep(WIZARD_STEPS.CONFIRMATION);
        break;
    }
  };

  const goToPreviousStep = () => {
    switch (currentStep) {
      case WIZARD_STEPS.ITEMS_SELECTION:
        setCurrentStep(WIZARD_STEPS.TYPE_SELECTION);
        break;
      case WIZARD_STEPS.TRANSACTION_DETAILS:
        if (transactionType === TRANSACTION_TYPES.SIMPLE) {
          setCurrentStep(WIZARD_STEPS.TYPE_SELECTION);
        } else {
          setCurrentStep(WIZARD_STEPS.ITEMS_SELECTION);
        }
        break;
      case WIZARD_STEPS.CONFIRMATION:
        setCurrentStep(WIZARD_STEPS.TRANSACTION_DETAILS);
        break;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case WIZARD_STEPS.TYPE_SELECTION:
        return transactionType !== null;
      case WIZARD_STEPS.ITEMS_SELECTION:
        return selectedProducts.length > 0 || selectedServices.length > 0;
      case WIZARD_STEPS.TRANSACTION_DETAILS:
        return descricao && valor && data;
      default:
        return true;
    }
  };

  // Submit function
  const handleSubmit = async () => {
    if (type === 'ENTRADA' && status === 'PAGO' && !walletId) {
      toast({ title: 'Erro de Validação', description: 'Por favor, selecione a carteira que recebeu o pagamento.', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    
    // Build items detail for description
    let itemsDetail = '';
    if (selectedProducts.length > 0) {
      itemsDetail += 'Produtos: ' + selectedProducts.map(item => `${item.product.name} (${item.quantity}x)`).join(', ');
    }
    if (selectedServices.length > 0) {
      if (itemsDetail) itemsDetail += ' | ';
      itemsDetail += 'Serviços: ' + selectedServices.map(item => `${item.service.name} (${item.quantity}x)`).join(', ');
    }

    const finalDescription = itemsDetail ? `${descricao} - ${itemsDetail}` : descricao;

    const transaction = {
      descricao: finalDescription,
      valor: parseFloat(valor),
      data,
      tipo: type.toUpperCase(),
      status,
      cliente_id: type.toUpperCase() === 'ENTRADA' ? (clienteId || null) : null,
      fornecedor_id: type.toUpperCase() === 'SAIDA' ? (supplierId || null) : null,
      category: categoria,
      metodo_pagamento: metodoPagamento,
      wallet_id: walletId || null,
      transaction_type: transactionType,
      items: {
        products: selectedProducts,
        services: selectedServices,
        discount: parseFloat(desconto) || 0
      }
    };

    try {
      let result;
      if (transactionData?.id) {
        result = await updateTransaction(transactionData.id, transaction);
        toast({ title: 'Sucesso!', description: 'Lançamento atualizado.' });
      } else {
        result = await addTransaction(transaction);
        toast({ title: 'Sucesso!', description: `Nova ${type.toLowerCase()} adicionada.` });
      }
      
      setSavedTransaction({ ...transaction, id: result?.id || Date.now() });
      if(onSaveSuccess) onSaveSuccess();
      onClose();
    } catch (error) {
      toast({ title: 'Erro', description: `Não foi possível salvar: ${error.message}`, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const validWallets = wallets?.filter(w => w && w.id && w.name) || [];
  const validClients = clients?.filter(c => c && c.id && c.name) || [];
  const validSuppliers = suppliers?.filter(s => s && s.id && s.name) || [];
  const validProducts = products?.filter(p => p && p.id && p.name && p.active) || [];
  const validServices = servicePackages?.filter(s => s && s.id && s.name) || [];

  const renderStepContent = () => {
    switch (currentStep) {
      case WIZARD_STEPS.TYPE_SELECTION:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Tipo de Lançamento</h3>
              <p className="text-sm text-muted-foreground">Escolha o tipo de lançamento que você deseja fazer</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setTransactionType(TRANSACTION_TYPES.SIMPLE)}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  transactionType === TRANSACTION_TYPES.SIMPLE 
                    ? 'border-blue-500 bg-blue-500/10' 
                    : 'border-border hover:border-blue-500/50'
                }`}
              >
                <DollarSign className="w-6 h-6 mb-2 text-primary" />
                <h4 className="font-semibold">Lançamento Simples</h4>
                <p className="text-sm text-muted-foreground">Entrada ou saída manual sem produtos específicos</p>
              </button>

              <button
                onClick={() => setTransactionType(TRANSACTION_TYPES.PRODUCTS)}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  transactionType === TRANSACTION_TYPES.PRODUCTS 
                    ? 'border-blue-500 bg-blue-500/10' 
                    : 'border-border hover:border-blue-500/50'
                }`}
              >
                <ShoppingCart className="w-6 h-6 mb-2 text-blue-500" />
                <h4 className="font-semibold">Venda de Produtos</h4>
                <p className="text-sm text-muted-foreground">Venda de fotos, álbuns, quadros e outros produtos</p>
              </button>

              <button
                onClick={() => setTransactionType(TRANSACTION_TYPES.SERVICES)}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  transactionType === TRANSACTION_TYPES.SERVICES 
                    ? 'border-blue-500 bg-blue-500/10' 
                    : 'border-border hover:border-blue-500/50'
                }`}
              >
                <Package className="w-6 h-6 mb-2 text-green-500" />
                <h4 className="font-semibold">Pacotes de Serviços</h4>
                <p className="text-sm text-muted-foreground">Venda de pacotes fotográficos cadastrados</p>
              </button>

              <button
                onClick={() => setTransactionType(TRANSACTION_TYPES.MIXED)}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  transactionType === TRANSACTION_TYPES.MIXED 
                    ? 'border-blue-500 bg-blue-500/10' 
                    : 'border-border hover:border-blue-500/50'
                }`}
              >
                <div className="flex items-center mb-2">
                  <Package className="w-5 h-5 mr-1 text-green-500" />
                  <ShoppingCart className="w-5 h-5 text-blue-500" />
                </div>
                <h4 className="font-semibold">Produtos + Serviços</h4>
                <p className="text-sm text-muted-foreground">Combinação de produtos e serviços</p>
              </button>
            </div>
          </div>
        );

      case WIZARD_STEPS.ITEMS_SELECTION:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Selecionar Itens</h3>
              <p className="text-sm text-muted-foreground">Escolha os produtos e/ou serviços para este lançamento</p>
            </div>

            {(transactionType === TRANSACTION_TYPES.PRODUCTS || transactionType === TRANSACTION_TYPES.MIXED) && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Produtos Disponíveis
                </h4>
                
                {selectedProducts.length > 0 && (
                  <div className="mb-4 p-3 bg-accent/50 rounded-lg">
                    <h5 className="font-medium mb-2">Produtos Selecionados:</h5>
                    {selectedProducts.map((item) => (
                      <div key={item.product.id} className="flex items-center justify-between py-1">
                        <span className="text-sm">{item.product.name}</span>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => updateProductQuantity(item.product.id, item.quantity - 1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="text-sm w-8 text-center">{item.quantity}</span>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => updateProductQuantity(item.product.id, item.quantity + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => removeProduct(item.product.id)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-40 overflow-y-auto">
                  {validProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => addProduct(product)}
                      className="p-3 border rounded-lg text-left hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium">{product.name}</h5>
                          <p className="text-xs text-muted-foreground">{product.category}</p>
                          <p className="text-sm font-semibold text-green-600">
                            R$ {Number(product.price_pix || 0).toFixed(2)}
                          </p>
                        </div>
                        <Plus className="w-4 h-4 text-primary" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {(transactionType === TRANSACTION_TYPES.SERVICES || transactionType === TRANSACTION_TYPES.MIXED) && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center">
                  <Package className="w-4 h-4 mr-2" />
                  Pacotes de Serviços
                </h4>
                
                {selectedServices.length > 0 && (
                  <div className="mb-4 p-3 bg-accent/50 rounded-lg">
                    <h5 className="font-medium mb-2">Serviços Selecionados:</h5>
                    {selectedServices.map((item) => (
                      <div key={item.service.id} className="flex items-center justify-between py-1">
                        <span className="text-sm">{item.service.name}</span>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => updateServiceQuantity(item.service.id, item.quantity - 1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="text-sm w-8 text-center">{item.quantity}</span>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => updateServiceQuantity(item.service.id, item.quantity + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => removeService(item.service.id)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-40 overflow-y-auto">
                  {validServices.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => addService(service)}
                      className="p-3 border rounded-lg text-left hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium">{service.name}</h5>
                          <p className="text-xs text-muted-foreground">{service.niche}</p>
                          <p className="text-sm font-semibold text-green-600">
                            R$ {Number(service.price_cash_pix || 0).toFixed(2)}
                          </p>
                        </div>
                        <Plus className="w-4 h-4 text-primary" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case WIZARD_STEPS.TRANSACTION_DETAILS:
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold mb-2">Detalhes da Transação</h3>
              <p className="text-sm text-muted-foreground">Complete as informações do lançamento</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="descricao">Descrição *</Label>
                <Input 
                  id="descricao" 
                  value={descricao} 
                  onChange={(e) => setDescricao(e.target.value)} 
                  placeholder="Descrição do lançamento"
                  required 
                />
              </div>

              <div>
                <Label htmlFor="data">Data *</Label>
                <Input 
                  id="data" 
                  type="date" 
                  value={data} 
                  onChange={(e) => setData(e.target.value)} 
                  required 
                />
              </div>

              {transactionType === TRANSACTION_TYPES.SIMPLE && (
                <div>
                  <Label htmlFor="valor">Valor (R$) *</Label>
                  <Input 
                    id="valor" 
                    type="number" 
                    value={valor} 
                    onChange={(e) => setValor(e.target.value)} 
                    step="0.01" 
                    required 
                  />
                </div>
              )}

              {transactionType !== TRANSACTION_TYPES.SIMPLE && (
                <div>
                  <Label htmlFor="desconto">Desconto (R$)</Label>
                  <Input 
                    id="desconto" 
                    type="number" 
                    value={desconto} 
                    onChange={(e) => setDesconto(e.target.value)} 
                    step="0.01" 
                    placeholder="0.00"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDENTE">Pendente</SelectItem>
                    <SelectItem value="PAGO">Pago</SelectItem>
                    <SelectItem value="ATRASADO">Atrasado</SelectItem>
                    <SelectItem value="CANCELADO">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="metodoPagamento">Método de Pagamento</Label>
                <Select value={metodoPagamento} onValueChange={setMetodoPagamento}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um método" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Não especificado</SelectItem>
                    {PAYMENT_METHODS.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {type === 'entrada' && (
                <div>
                  <Label htmlFor="cliente">Cliente</Label>
                  <Select value={clienteId} onValueChange={setClienteId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Nenhum</SelectItem>
                      {validClients.map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {validWallets.length > 0 && (
                <div>
                  <Label htmlFor="wallet">Carteira {type === 'ENTRADA' && status === 'PAGO' ? '*' : '(Opcional)'}</Label>
                  <Select value={walletId} onValueChange={setWalletId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma carteira" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Nenhuma</SelectItem>
                      {validWallets.map(wallet => (
                        <SelectItem key={wallet.id} value={wallet.id}>
                          {wallet.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {transactionType !== TRANSACTION_TYPES.SIMPLE && (
              <div className="mt-4 p-4 bg-accent/50 rounded-lg">
                <h4 className="font-semibold mb-2">Resumo do Pedido</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>R$ {(calculateTotal() + (parseFloat(desconto) || 0)).toFixed(2)}</span>
                  </div>
                  {desconto && (
                    <div className="flex justify-between text-orange-600">
                      <span>Desconto:</span>
                      <span>- R$ {parseFloat(desconto).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="my-2 h-px bg-border" />
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>R$ {calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case WIZARD_STEPS.CONFIRMATION:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Confirmar Lançamento</h3>
              <p className="text-sm text-muted-foreground">Revise as informações antes de salvar</p>
            </div>

            <div className="bg-accent/50 rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Tipo:</span>
                  <p>{type === 'entrada' ? 'Entrada' : 'Saída'}</p>
                </div>
                <div>
                  <span className="font-medium">Valor:</span>
                  <p className="text-lg font-semibold text-green-600">R$ {parseFloat(valor).toFixed(2)}</p>
                </div>
                <div>
                  <span className="font-medium">Descrição:</span>
                  <p>{descricao}</p>
                </div>
                <div>
                  <span className="font-medium">Data:</span>
                  <p>{format(new Date(data), 'dd/MM/yyyy')}</p>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <Badge variant={status === 'PAGO' ? 'default' : 'secondary'}>{status}</Badge>
                </div>
                <div>
                  <span className="font-medium">Método:</span>
                  <p>{metodoPagamento || 'Não especificado'}</p>
                </div>
              </div>

              {(selectedProducts.length > 0 || selectedServices.length > 0) && (
                <div className="mt-4">
                  <span className="font-medium">Itens:</span>
                  <div className="mt-2 space-y-1">
                    {selectedProducts.map((item) => (
                      <div key={item.product.id} className="flex justify-between text-sm">
                        <span>{item.product.name} x{item.quantity}</span>
                        <span>R$ {(item.product.price_pix * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    {selectedServices.map((item) => (
                      <div key={item.service.id} className="flex justify-between text-sm">
                        <span>{item.service.name} x{item.quantity}</span>
                        <span>R$ {(item.service.price_cash_pix * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>
                {transactionData?.id ? 'Editar' : 'Novo'} Lançamento: {type === 'entrada' ? 'Entrada' : 'Saída'}
              </DialogTitle>
              <DialogDescription>
                {currentStep === WIZARD_STEPS.TYPE_SELECTION && 'Escolha o tipo de lançamento'}
                {currentStep === WIZARD_STEPS.ITEMS_SELECTION && 'Selecione os produtos e/ou serviços'}
                {currentStep === WIZARD_STEPS.TRANSACTION_DETAILS && 'Complete os detalhes da transação'}
                {currentStep === WIZARD_STEPS.CONFIRMATION && 'Revise e confirme as informações'}
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderStepContent()}
              </motion.div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex space-x-2">
                {currentStep !== WIZARD_STEPS.TYPE_SELECTION && (
                  <Button variant="outline" onClick={goToPreviousStep} disabled={isSaving}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                  </Button>
                )}
              </div>

              <div className="flex space-x-2">
                <Button variant="ghost" onClick={onClose} disabled={isSaving}>
                  Cancelar
                </Button>
                
                {currentStep !== WIZARD_STEPS.CONFIRMATION ? (
                  <Button onClick={goToNextStep} disabled={!canProceed() || isSaving}>
                    Próximo
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} disabled={isSaving} className="btn-custom-gradient">
                    {isSaving ? 'Salvando...' : 'Finalizar Lançamento'}
                  </Button>
                )}
              </div>
            </div>

            {savedTransaction && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-green-800 text-sm">Lançamento salvo com sucesso!</span>
                  <ReceiptButton 
                    transaction={{
                      ...savedTransaction,
                      type: savedTransaction.tipo === 'ENTRADA' ? 'entrada' : 'saida'
                    }}
                    size="sm"
                    variant="outline"
                  />
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default FinancialWizardModal;