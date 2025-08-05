import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';
import { walletIcons, gatewayFeeSuggestions } from '@/lib/walletConstants';
import { Checkbox } from '@/components/ui/checkbox';
import { Info } from 'lucide-react';

const WalletModal = ({ isOpen, onClose, walletData }) => {
    const { addWallet, updateWallet } = useData();
    const { toast } = useToast();
    const [name, setName] = useState('');
    const [type, setType] = useState('bank');
    const [iconUrl, setIconUrl] = useState('');
    const [initialBalance, setInitialBalance] = useState('');
    const [isGateway, setIsGateway] = useState(false);
    const [gatewayConfig, setGatewayConfig] = useState({ fee: '', release_days: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [selectedSuggestion, setSelectedSuggestion] = useState('custom');

    useEffect(() => {
        if (walletData) {
            setName(walletData.name);
            setType(walletData.type);
            setIconUrl(walletData.icon_url);
            setInitialBalance(walletData.initial_balance || '');
            setIsGateway(walletData.is_gateway || false);
            setGatewayConfig(walletData.gateway_config || { fee: '', release_days: '' });
        } else {
            setName('');
            setType('bank');
            setIconUrl(walletIcons.bank[0]?.url || '');
            setInitialBalance('');
            setIsGateway(false);
            setGatewayConfig({ fee: '', release_days: '' });
        }
        setSelectedSuggestion('custom');
    }, [walletData, isOpen]);

    useEffect(() => {
        if (isOpen && !walletData) {
            const defaultIcon = walletIcons[type]?.[0]?.url || '';
            setIconUrl(defaultIcon);
        }
    }, [type, isOpen, walletData]);
    
    useEffect(() => {
        if (selectedSuggestion && selectedSuggestion !== 'custom') {
            const [gatewayName, index] = selectedSuggestion.split('_');
            const suggestion = gatewayFeeSuggestions[gatewayName]?.[index];
            if (suggestion) {
                setGatewayConfig({ fee: suggestion.fee, release_days: suggestion.release_days });
            }
        }
    }, [selectedSuggestion]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const walletPayload = {
            name,
            type,
            icon_url: iconUrl,
            initial_balance: parseFloat(initialBalance) || 0,
            is_gateway: isGateway,
            gateway_config: isGateway ? {
                fee: parseFloat(gatewayConfig.fee) || 0,
                release_days: parseInt(gatewayConfig.release_days, 10) || 0,
            } : null,
        };

        try {
            if (walletData) {
                await updateWallet(walletData.id, walletPayload);
                toast({ title: 'Carteira atualizada!', description: 'As informações da carteira foram salvas.' });
            } else {
                await addWallet(walletPayload);
                toast({ title: 'Carteira criada!', description: 'Sua nova carteira está pronta para uso.' });
            }
            onClose();
        } catch (error) {
            toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };
    
    const availableSuggestions = gatewayFeeSuggestions[Object.keys(gatewayFeeSuggestions).find(k => name.toLowerCase().includes(k.toLowerCase()))] || [];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{walletData ? 'Editar Carteira' : 'Nova Carteira'}</DialogTitle>
                    <DialogDescription>
                        {walletData ? 'Atualize as informações da sua carteira.' : 'Crie uma nova carteira para organizar suas finanças.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="wallet-name">Nome da Carteira</Label>
                        <Input
                            id="wallet-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ex: Conta Principal"
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="wallet-type">Tipo</Label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="bank">Banco</SelectItem>
                                <SelectItem value="gateway">Gateway de Pagamento</SelectItem>
                                <SelectItem value="cash">Dinheiro (Caixa Físico)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div>
                        <Label htmlFor="wallet-icon">Ícone</Label>
                        <Select value={iconUrl} onValueChange={setIconUrl}>
                            <SelectTrigger>
                                 <SelectValue>
                                    {iconUrl ? (
                                        <div className="flex items-center">
                                            <img src={iconUrl} alt="ícone selecionado" className="w-5 h-5 mr-2 object-contain" />
                                            <span>{walletIcons[type]?.find(icon => icon.url === iconUrl)?.name || 'Ícone'}</span>
                                        </div>
                                    ) : 'Selecione um ícone'}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {walletIcons[type]?.map(icon => (
                                    <SelectItem key={icon.name} value={icon.url}>
                                        <div className="flex items-center">
                                            <img src={icon.url} alt={icon.name} className="w-5 h-5 mr-2 object-contain" />
                                            <span>{icon.name}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                     <div>
                        <Label htmlFor="initial-balance">Saldo Inicial (Opcional)</Label>
                        <Input
                            id="initial-balance"
                            type="number"
                            step="0.01"
                            value={initialBalance}
                            onChange={(e) => setInitialBalance(e.target.value)}
                            placeholder="0.00"
                        />
                    </div>
                    
                    <div className="flex items-center space-x-2 pt-2">
                        <Checkbox id="is-gateway" checked={isGateway} onCheckedChange={setIsGateway} />
                        <Label htmlFor="is-gateway" className="font-medium">É um Gateway de Pagamento?</Label>
                    </div>

                    {isGateway && (
                        <div className="p-4 border rounded-lg space-y-4 bg-accent/50">
                            <h4 className="font-semibold text-foreground">Configuração do Gateway</h4>
                            {availableSuggestions.length > 0 && (
                                <div>
                                    <Label htmlFor="gateway-suggestion">Sugestões para {Object.keys(gatewayFeeSuggestions).find(k => name.toLowerCase().includes(k.toLowerCase()))}</Label>
                                    <Select value={selectedSuggestion} onValueChange={setSelectedSuggestion}>
                                        <SelectTrigger><SelectValue placeholder="Usar sugestão..." /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="custom">Personalizado</SelectItem>
                                            {availableSuggestions.map((sug, index) => (
                                                <SelectItem key={`${name}_${index}`} value={`${name}_${index}`}>{sug.name} ({sug.fee}% em {sug.release_days}d)</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            <div>
                                <Label htmlFor="gateway-fee">Taxa (%)</Label>
                                <Input id="gateway-fee" type="number" step="0.01" value={gatewayConfig.fee} onChange={(e) => setGatewayConfig(prev => ({ ...prev, fee: e.target.value }))} placeholder="Ex: 4.99" required />
                            </div>
                            <div>
                                <Label htmlFor="gateway-release">Prazo de Liberação (dias)</Label>
                                <Input id="gateway-release" type="number" step="1" value={gatewayConfig.release_days} onChange={(e) => setGatewayConfig(prev => ({ ...prev, release_days: e.target.value }))} placeholder="Ex: 14" required />
                            </div>
                            <div className="text-xs text-muted-foreground flex items-start">
                                <Info className="w-4 h-4 mr-2 mt-0.5 shrink-0" />
                                <span>Ao usar esta carteira em um lançamento, a taxa será descontada e o valor líquido agendado para a data de liberação.</span>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end space-x-2 pt-2">
                        <Button type="button" variant="ghost" onClick={onClose} disabled={isSaving}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? 'Salvando...' : 'Salvar'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default WalletModal;