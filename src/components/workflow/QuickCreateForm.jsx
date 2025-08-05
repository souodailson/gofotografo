import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Package, Plus, Loader2, Save } from 'lucide-react';
import { useData } from '@/contexts/DataContext';

const FormField = ({ label, children, className }) => (
  <div className={className}>
    <label className="block text-sm font-medium text-muted-foreground mb-1.5">{label}</label>
    {children}
  </div>
);

const QuickCreateForm = ({ initialData, onSave, onCancel, onOpenClientModal, isSaving }) => {
    const { clients, servicePackages } = useData();
    const [formData, setFormData] = useState(initialData || {});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name, value) => {
        let updatedData = { ...formData, [name]: value };
        if (name === 'client_id' || name === 'service_package_id') {
          const client = name === 'client_id' ? clients.find(c => c.id === value) : clients.find(c => c.id === updatedData.client_id);
          const pkg = name === 'service_package_id' ? servicePackages.find(p => p.id === value) : servicePackages.find(p => p.id === updatedData.service_package_id);
          
          let newTitle = '';
          if (client && pkg) newTitle = `${client.name} - ${pkg.name}`;
          else if (client) newTitle = client.name;
          else if (pkg) newTitle = pkg.name;
          
          if (!updatedData.title) {
            updatedData.title = newTitle;
          }

          if (name === 'service_package_id' && pkg) {
              updatedData.value = pkg.price_cash_pix || pkg.price_card || '';
          }
        }
        setFormData(updatedData);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form id="quick-create-form" onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Título do Trabalho*">
                <Input name="title" value={formData.title || ''} onChange={handleChange} placeholder="Ex: Ensaio de Casamento de [Cliente]" required disabled={isSaving} />
            </FormField>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Data">
                    <Input name="date" type="date" value={formData.date || ''} onChange={handleChange} disabled={isSaving} />
                </FormField>
                <FormField label="Valor Total (R$)">
                    <Input name="value" type="number" value={formData.value || ''} onChange={handleChange} placeholder="0,00" step="0.01" min="0" disabled={isSaving} />
                </FormField>
            </div>
            <FormField label="Cliente Vinculado">
                <div className="flex space-x-2">
                    <Select name="client_id" value={formData.client_id || ""} onValueChange={(value) => handleSelectChange('client_id', value)} disabled={isSaving}>
                        <SelectTrigger><SelectValue placeholder="Selecione um cliente..." /></SelectTrigger>
                        <SelectContent>{(clients || []).map(client => (<SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>))}</SelectContent>
                    </Select>
                    <Button type="button" variant="outline" onClick={onOpenClientModal} disabled={isSaving}><Plus className="w-4 h-4" /></Button>
                </div>
            </FormField>
             <FormField label="Pacote de Serviços">
                <Select name="service_package_id" value={formData.service_package_id || ""} onValueChange={(value) => handleSelectChange('service_package_id', value)} disabled={isSaving}>
                    <SelectTrigger><SelectValue placeholder="Selecione um pacote..." /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">Nenhum</SelectItem>
                        {(servicePackages || []).map(pkg => (
                            <SelectItem key={pkg.id} value={pkg.id}>
                                {pkg.name} - R$ {Number(pkg.price_cash_pix || pkg.price_card || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </FormField>
        </form>
    );
};

export default QuickCreateForm;