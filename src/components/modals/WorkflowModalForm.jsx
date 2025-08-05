import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';
import { format, parseISO } from 'date-fns';
import { DollarSign, Wallet } from 'lucide-react';

const WalletSelector = ({ label, selectedWallet, onWalletChange, wallets, required = false }) => {
    const validWallets = wallets?.filter(w => w && w.id && w.name) || [];

    if (validWallets.length === 0) {
        return (
            <div className="space-y-1">
                 <Label htmlFor={`wallet-selector-${label.replace(/\s+/g, '-')}`} className="flex items-center text-sm font-medium text-muted-foreground">
                    <Wallet className="w-4 h-4 mr-2" />
                    {label}
                </Label>
                <div className="space-y-1 p-2 rounded-md border border-dashed bg-slate-50 dark:bg-slate-800/50">
                    <p className="text-sm text-muted-foreground text-center">
                        Nenhuma carteira cadastrada.
                    </p>
                    <p className="text-xs text-muted-foreground text-center">
                        Crie uma em: Financeiro &gt; Minhas Carteiras.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-1">
            <Label htmlFor={`wallet-selector-${label.replace(/\s+/g, '-')}`} className="flex items-center text-sm font-medium text-muted-foreground">
                <Wallet className="w-4 h-4 mr-2" />
                {label} {required && '*'}
            </Label>
            <Select value={selectedWallet || ''} onValueChange={onWalletChange} required={required}>
                <SelectTrigger id={`wallet-selector-${label.replace(/\s+/g, '-')}`}>
                    <SelectValue placeholder="Selecione uma carteira" />
                </SelectTrigger>
                <SelectContent>
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
        </div>
    );
};

const WorkflowModalForm = ({ card, onSave, onCancel, isSaving }) => {
    const { clients, servicePackages, settings, wallets } = useData();
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        title: '', client_id: '', status: 'agendado', value: '', description: '',
        date: '', time: '', service_package_id: '', payment_type: 'SOMENTE_AGENDADO',
        entry_value: '', installments: '', payment_method: '', main_wallet_id: '',
        entry_wallet_id: '',
    });

    useEffect(() => {
        if (card) {
            setFormData({
                title: card.title || '',
                client_id: card.client_id || '',
                status: card.status || 'agendado',
                value: card.value || '',
                description: card.description || '',
                date: card.date ? format(parseISO(card.date), 'yyyy-MM-dd') : '',
                time: card.time || '',
                service_package_id: card.service_package_id || '',
                payment_type: card.payment_type || 'SOMENTE_AGENDADO',
                entry_value: card.entry_value || '',
                installments: card.installments || '',
                payment_method: card.payment_method || '',
                main_wallet_id: card.main_wallet_id || '',
                entry_wallet_id: card.entry_wallet_id || '',
            });
        } else {
            setFormData(prev => ({ ...prev, status: settings?.workflow_columns?.[0]?.id || 'agendado' }));
        }
    }, [card, settings]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.payment_type !== 'SOMENTE_AGENDADO') {
            if (formData.payment_type === 'integral' && !formData.main_wallet_id) {
                toast({ title: "Campo obrigatório", description: "Por favor, selecione a carteira para o pagamento integral.", variant: "destructive" });
                return;
            }
            if (formData.payment_type === 'parcial' && (!formData.entry_wallet_id || !formData.main_wallet_id)) {
                toast({ title: "Campos obrigatórios", description: "Por favor, selecione as carteiras para a entrada e para o restante.", variant: "destructive" });
                return;
            }
            if ((formData.payment_type === 'parcelado_pix' || formData.payment_type === 'parcelado_cartao') && !formData.main_wallet_id) {
                toast({ title: "Campo obrigatório", description: "Por favor, selecione a carteira para o parcelamento.", variant: "destructive" });
                return;
            }
        }
        onSave(formData);
    };

    const workflowColumns = settings?.workflow_columns?.filter(c => c && c.id && c.title) || [];
    const validClients = clients?.filter(c => c && c.id && c.name) || [];
    const validServicePackages = servicePackages?.filter(p => p && p.id && p.name) || [];

    return (
        <form onSubmit={handleSubmit} id="workflow-form" className="space-y-4">
            <div>
                <Label htmlFor="title">Título do Trabalho</Label>
                <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
            </div>
            <div>
                <Label htmlFor="client_id">Cliente</Label>
                <Select name="client_id" value={formData.client_id || ''} onValueChange={(value) => handleSelectChange('client_id', value)}>
                    <SelectTrigger><SelectValue placeholder="Selecione um cliente" /></SelectTrigger>
                    <SelectContent>
                        {validClients.map(client => <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="date">Data</Label>
                    <Input id="date" name="date" type="date" value={formData.date} onChange={handleChange} />
                </div>
                <div>
                    <Label htmlFor="time">Hora</Label>
                    <Input id="time" name="time" type="time" value={formData.time} onChange={handleChange} />
                </div>
            </div>
            <div>
                <Label htmlFor="status">Status</Label>
                <Select name="status" value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
                    <SelectTrigger><SelectValue placeholder="Selecione um status" /></SelectTrigger>
                    <SelectContent>
                        {workflowColumns.map(col => <SelectItem key={col.id} value={col.id}>{col.title}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label htmlFor="service_package_id">Pacote de Serviço (Opcional)</Label>
                <Select name="service_package_id" value={formData.service_package_id || ''} onValueChange={(value) => handleSelectChange('service_package_id', value)}>
                    <SelectTrigger><SelectValue placeholder="Selecione um pacote" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">Nenhum</SelectItem>
                        {validServicePackages.map(pkg => <SelectItem key={pkg.id} value={pkg.id}>{pkg.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea id="description" name="description" value={formData.description} onChange={handleChange} />
            </div>

            <div className="space-y-4 p-4 border rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <h3 className="font-semibold text-lg flex items-center"><DollarSign className="w-5 h-5 mr-2" /> Detalhes Financeiros</h3>
                <div>
                    <Label htmlFor="value">Valor Total do Trabalho</Label>
                    <Input id="value" name="value" type="number" step="0.01" value={formData.value} onChange={handleChange} placeholder="Ex: 1500.00" />
                </div>
                <div>
                    <Label htmlFor="payment_type">Forma de Pagamento</Label>
                    <Select name="payment_type" value={formData.payment_type} onValueChange={(value) => handleSelectChange('payment_type', value)}>
                        <SelectTrigger><SelectValue placeholder="Selecione a forma de pagamento" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="SOMENTE_AGENDADO">Apenas Agendamento</SelectItem>
                            <SelectItem value="integral">Pagamento Integral</SelectItem>
                            <SelectItem value="parcial">Pagamento Parcial (Entrada + Restante)</SelectItem>
                            <SelectItem value="parcelado_pix">Parcelado no PIX</SelectItem>
                            <SelectItem value="parcelado_cartao">Parcelado no Cartão</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {formData.payment_type === 'integral' && (
                    <WalletSelector label="Carteira para Recebimento" selectedWallet={formData.main_wallet_id} onWalletChange={(value) => handleSelectChange('main_wallet_id', value)} wallets={wallets} required />
                )}

                {formData.payment_type === 'parcial' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div>
                            <Label htmlFor="entry_value">Valor da Entrada</Label>
                            <Input id="entry_value" name="entry_value" type="number" step="0.01" value={formData.entry_value} onChange={handleChange} placeholder="Ex: 500.00" />
                        </div>
                        <WalletSelector label="Carteira da Entrada" selectedWallet={formData.entry_wallet_id} onWalletChange={(value) => handleSelectChange('entry_wallet_id', value)} wallets={wallets} required />
                        <div className="md:col-span-2">
                            <WalletSelector label="Carteira do Restante" selectedWallet={formData.main_wallet_id} onWalletChange={(value) => handleSelectChange('main_wallet_id', value)} wallets={wallets} required />
                        </div>
                    </div>
                )}

                {(formData.payment_type === 'parcelado_pix' || formData.payment_type === 'parcelado_cartao') && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div>
                            <Label htmlFor="installments">Número de Parcelas</Label>
                            <Input id="installments" name="installments" type="number" step="1" value={formData.installments} onChange={handleChange} placeholder="Ex: 6" />
                        </div>
                        <div className="md:col-span-2">
                            <WalletSelector label="Carteira para Recebimento" selectedWallet={formData.main_wallet_id} onWalletChange={(value) => handleSelectChange('main_wallet_id', value)} wallets={wallets} required />
                        </div>
                    </div>
                )}
            </div>
        </form>
    );
};

export default WorkflowModalForm;