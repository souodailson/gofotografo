import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';
import { useModalState } from '@/contexts/ModalStateContext';
import { format } from 'date-fns';
import { Wallet, Search, Plus } from 'lucide-react';
import { FINANCIAL_CATEGORIES, PAYMENT_METHODS } from '@/lib/financialConstants';

const FinancialModal = ({ isOpen, onClose, type, transactionData, onSaveSuccess }) => {
    const { clients, suppliers = [], addTransaction, updateTransaction, wallets } = useData();
    const { toast } = useToast();
    const { openModal } = useModalState();

    const [descricao, setDescricao] = useState('');
    const [valor, setValor] = useState('');
    const [data, setData] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [status, setStatus] = useState('PENDENTE');
    const [clienteId, setClienteId] = useState('');
    const [supplierId, setSupplierId] = useState('');
    const [categoria, setCategoria] = useState('');
    const [metodoPagamento, setMetodoPagamento] = useState('');
    const [walletId, setWalletId] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const resetState = useCallback(() => {
        setDescricao('');
        setValor('');
        setData(format(new Date(), 'yyyy-MM-dd'));
        setStatus('PENDENTE');
        setClienteId('');
        setSupplierId('');
        setCategoria('');
        setMetodoPagamento('');
        setWalletId('');
    }, []);

    useEffect(() => {
        if (isOpen) {
            if (transactionData) {
                setDescricao(transactionData.descricao || '');
                setValor(transactionData.valor || '');
                setData(transactionData.data ? format(new Date(transactionData.data), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'));
                setStatus(transactionData.status || 'PENDENTE');
                setClienteId(transactionData.cliente_id || '');
                setSupplierId(transactionData.supplier_id || '');
                setCategoria(transactionData.category || '');
                setMetodoPagamento(transactionData.metodo_pagamento || '');
                setWalletId(transactionData.wallet_id || '');
            } else {
                resetState();
            }
        }
    }, [transactionData, isOpen, resetState]);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (type === 'ENTRADA' && status === 'PAGO' && !walletId) {
            toast({ title: 'Erro de Validação', description: 'Por favor, selecione a carteira que recebeu o pagamento.', variant: 'destructive' });
            return;
        }

        setIsSaving(true);
        const transaction = {
            descricao,
            valor: parseFloat(valor),
            data,
            tipo: type.toUpperCase(),
            status,
            cliente_id: type.toUpperCase() === 'ENTRADA' ? (clienteId || null) : null,
            supplier_id: type.toUpperCase() === 'SAIDA' ? (supplierId || null) : null,
            category: categoria,
            metodo_pagamento: metodoPagamento,
            wallet_id: walletId || null,
        };

        try {
            if (transactionData?.id) {
                await updateTransaction(transactionData.id, transaction);
                toast({ title: 'Sucesso!', description: 'Lançamento atualizado.' });
            } else {
                await addTransaction(transaction);
                toast({ title: 'Sucesso!', description: `Nova ${type.toLowerCase()} adicionada.` });
            }
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

    const handleNewClient = () => {
        openModal('client', {});
    };

    const handleNewSupplier = () => {
        openModal('supplier', {});
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <Dialog open={isOpen} onOpenChange={onClose}>
                    <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }} 
                            animate={{ opacity: 1, scale: 1 }} 
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex flex-col h-full"
                        >
                            <DialogHeader className="flex-shrink-0">
                                <DialogTitle>{transactionData?.id ? 'Editar' : 'Novo'} Lançamento: {type === 'entrada' ? 'Entrada' : 'Saída'}</DialogTitle>
                                <DialogDescription>Preencha os detalhes abaixo.</DialogDescription>
                            </DialogHeader>
                            <div className="flex-1 overflow-y-auto pr-2">
                                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                                <div>
                                    <Label htmlFor="descricao">Descrição</Label>
                                    <Input id="descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} required />
                                </div>
                                <div>
                                    <Label htmlFor="valor">Valor (R$)</Label>
                                    <Input id="valor" type="number" value={valor} onChange={(e) => setValor(e.target.value)} required step="0.01" />
                                </div>
                                <div>
                                    <Label htmlFor="data">Data</Label>
                                    <Input id="data" type="date" value={data} onChange={(e) => setData(e.target.value)} required />
                                </div>
                                <div>
                                    <Label htmlFor="status">Status</Label>
                                    <Select value={status} onValueChange={setStatus}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PENDENTE">Pendente</SelectItem>
                                            <SelectItem value="PAGO">Pago</SelectItem>
                                            <SelectItem value="ATRASADO">Atrasado</SelectItem>
                                            <SelectItem value="CANCELADO">Cancelado</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {type === 'entrada' ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="cliente">Cliente (Opcional)</Label>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={handleNewClient}
                                                className="h-8 px-3 text-xs"
                                            >
                                                <Plus className="w-3 h-3 mr-1" />
                                                Novo Cliente
                                            </Button>
                                        </div>
                                        <Select value={clienteId || ''} onValueChange={setClienteId}>
                                            <SelectTrigger><SelectValue placeholder="Selecione um cliente" /></SelectTrigger>
                                            <SelectContent className="max-h-60">
                                                <SelectItem value="">Nenhum</SelectItem>
                                                {validClients.map(client => (
                                                    <SelectItem key={client.id} value={client.id}>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{client.name}</span>
                                                            {client.email && (
                                                                <span className="text-xs text-muted-foreground">{client.email}</span>
                                                            )}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="fornecedor">Fornecedor (Opcional)</Label>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={handleNewSupplier}
                                                className="h-8 px-3 text-xs"
                                            >
                                                <Plus className="w-3 h-3 mr-1" />
                                                Novo Fornecedor
                                            </Button>
                                        </div>
                                        <Select value={supplierId || ''} onValueChange={setSupplierId}>
                                            <SelectTrigger><SelectValue placeholder="Selecione um fornecedor" /></SelectTrigger>
                                            <SelectContent className="max-h-60">
                                                <SelectItem value="">Nenhum</SelectItem>
                                                {validSuppliers.map(supplier => (
                                                    <SelectItem key={supplier.id} value={supplier.id}>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{supplier.name}</span>
                                                            {supplier.email && (
                                                                <span className="text-xs text-muted-foreground">{supplier.email}</span>
                                                            )}
                                                            {supplier.category && (
                                                                <span className="text-xs text-muted-foreground capitalize">{supplier.category.replace('_', ' ')}</span>
                                                            )}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                                <div>
                                    <Label htmlFor="categoria">Categoria (Opcional)</Label>
                                    <Select value={categoria} onValueChange={setCategoria}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione uma categoria" />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-60">
                                            <SelectItem value="">Sem categoria</SelectItem>
                                            {(FINANCIAL_CATEGORIES[type.toUpperCase()] || []).map((cat) => (
                                                <SelectItem key={cat.value} value={cat.value}>
                                                    <div className="flex items-center">
                                                        <span className="mr-2">{cat.icon}</span>
                                                        {cat.label}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="metodoPagamento">Método de Pagamento (Opcional)</Label>
                                    <Select value={metodoPagamento} onValueChange={setMetodoPagamento}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione um método" />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-60">
                                            <SelectItem value="">Não especificado</SelectItem>
                                            {PAYMENT_METHODS.map((method) => (
                                                <SelectItem key={method.value} value={method.value}>
                                                    <div className="flex items-center">
                                                        <span className="mr-2">{method.icon}</span>
                                                        {method.label}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="wallet" className="flex items-center">
                                        <Wallet className="w-4 h-4 mr-2" />
                                        Carteira {type === 'ENTRADA' && status === 'PAGO' ? '*' : '(Opcional)'}
                                    </Label>
                                    {validWallets.length > 0 ? (
                                        <Select value={walletId || ''} onValueChange={setWalletId} required={type === 'ENTRADA' && status === 'PAGO'}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione uma carteira" />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-60">
                                                <SelectItem value="">Nenhuma</SelectItem>
                                                {validWallets.map(wallet => (
                                                    <SelectItem key={wallet.id} value={wallet.id}>
                                                        <div className="flex items-center">
                                                            {wallet.icon_url && <img src={wallet.icon_url} alt={wallet.name} className="w-4 h-4 mr-2 object-contain" />}
                                                            {wallet.name}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <div className="space-y-1 p-2 rounded-md border border-dashed bg-slate-50 dark:bg-slate-800/50">
                                            <p className="text-sm text-muted-foreground text-center">
                                                Nenhuma carteira cadastrada.
                                            </p>
                                            <p className="text-xs text-muted-foreground text-center">
                                                Crie uma em: Financeiro &gt; Minhas Carteiras.
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-end space-x-2 pt-4 flex-shrink-0">
                                    <Button type="button" variant="ghost" onClick={onClose} disabled={isSaving}>Cancelar</Button>
                                    <Button type="submit" disabled={isSaving}>{isSaving ? 'Salvando...' : 'Salvar'}</Button>
                                </div>
                                </form>
                            </div>
                        </motion.div>
                    </DialogContent>
                </Dialog>
            )}
        </AnimatePresence>
    );
};

export default FinancialModal;