import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { User, Package, FileText, Calendar, DollarSign, Plus, Clock, Link as LinkIcon, Briefcase } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { useData } from '@/contexts/DataContext';
import { sanitizeFilename } from '@/lib/utils';
import { format, isValid, parseISO } from 'date-fns';

const paymentTypeOptions = [
  { value: 'INTEGRAL', label: 'Pagamento Integral' },
  { value: 'ENTRADA_PARCELAS', label: 'Parcial (Entrada + Restante)' },
  { value: 'PIX_PARCELADO', label: 'Parcelado no PIX' },
  { value: 'CARTAO_PARCELADO', label: 'Parcelado no Cartão' },
  { value: 'SOMENTE_AGENDADO', label: 'Apenas Agendamento' },
];

const paymentMethodOptions = [
  { value: 'PIX', label: 'Pix' }, { value: 'CARTAO_CREDITO', label: 'Cartão de Crédito' },
  { value: 'CARTAO_DEBITO', label: 'Cartão de Débito' }, { value: 'TRANSFERENCIA', label: 'Transferência' },
  { value: 'BOLETO', label: 'Boleto' }, { value: 'DINHEIRO', label: 'Dinheiro' },
  { value: 'OUTRO', label: 'Outro' },
];

const contractStatusOptions = [
  { value: "pending", label: "Pendente" }, { value: "sent", label: "Enviado" },
  { value: "signed", label: "Assinado" }, { value: "cancelled", label: "Cancelado" },
];

const Section = ({ title, icon: Icon, children }) => (
  <div className="space-y-4 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-border">
    <h3 className="text-lg font-semibold text-foreground flex items-center">
      <Icon className="w-5 h-5 mr-3 text-customPurple" />
      {title}
    </h3>
    <div className="space-y-4">{children}</div>
  </div>
);

const FormField = ({ label, children, className }) => (
  <div className={className}>
    <label className="block text-sm font-medium text-muted-foreground mb-1.5">{label}</label>
    {children}
  </div>
);

const WorkflowModalForm = ({
  formData,
  clients,
  servicePackages,
  onInputChange,
  onClientChange,
  onPackageChange,
  onOpenClientModal,
  isSubmitting
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  const [uploadingContract, setUploadingContract] = useState(false);
  const { user, updateWorkflowCard } = useData();

  const handleContractUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !user) return;

    setUploadingContract(true);
    const sanitizedFilename = sanitizeFilename(file.name);
    const filePath = `${user.id}/${Date.now()}_${sanitizedFilename}`;

    try {
      const { data: uploadData, error: uploadError } = await supabase.storage.from('contracts').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('contracts').getPublicUrl(uploadData.path);
      if (!urlData.publicUrl) throw new Error("Não foi possível obter a URL pública do contrato.");

      onInputChange('contract_url', urlData.publicUrl);
      onInputChange('contract_name', file.name);

      if (formData.id) {
        await updateWorkflowCard(formData.id, { contract_url: urlData.publicUrl, contract_name: file.name });
        toast({ title: "Sucesso!", description: "Contrato anexado e salvo." });
      } else {
        toast({ title: "Contrato Anexado", description: "O link será salvo com o card." });
      }
    } catch (error) {
      toast({ title: "Erro no Upload", description: `Falha ao anexar contrato: ${error.message}`, variant: "destructive" });
    } finally {
      setUploadingContract(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };
  
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
        const date = parseISO(dateString);
        return isValid(date) ? format(date, 'yyyy-MM-dd') : '';
    } catch(e) {
        return '';
    }
  };

  return (
    <div className="space-y-6">
      <Section title="Informações Principais" icon={Briefcase}>
        <FormField label="Título do Trabalho">
          <Input type="text" value={formData.title} onChange={(e) => onInputChange('title', e.target.value)} placeholder="Ex: Ensaio de Casamento de [Cliente]" disabled={isSubmitting} />
        </FormField>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Data do Trabalho">
            <Input type="date" value={formatDateForInput(formData.date)} onChange={(e) => onInputChange('date', e.target.value)} disabled={isSubmitting} />
          </FormField>
          <FormField label="Horário">
            <Input type="time" value={formData.time} onChange={(e) => onInputChange('time', e.target.value)} disabled={isSubmitting} />
          </FormField>
        </div>
      </Section>
      
      <Section title="Cliente e Serviço" icon={User}>
        <FormField label="Cliente Vinculado">
          <div className="flex space-x-2">
            <Select value={formData.client_id || ""} onValueChange={onClientChange} disabled={isSubmitting}>
              <SelectTrigger><SelectValue placeholder="Selecione um cliente..." /></SelectTrigger>
              <SelectContent>{(clients || []).map(client => (<SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>))}</SelectContent>
            </Select>
            <Button type="button" variant="outline" onClick={onOpenClientModal} disabled={isSubmitting}><Plus className="w-4 h-4" /></Button>
          </div>
        </FormField>
        <FormField label="Pacote de Serviços">
          <Select value={formData.service_package_id || ""} onValueChange={onPackageChange} disabled={isSubmitting}>
            <SelectTrigger><SelectValue placeholder="Selecione um pacote..." /></SelectTrigger>
            <SelectContent>
              {(servicePackages || []).map(pkg => (
                <SelectItem key={pkg.id} value={pkg.id}>
                  {pkg.name} - R$ {Number(pkg.price_cash_pix || pkg.price_card || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </Section>

      <Section title="Detalhes Financeiros" icon={DollarSign}>
        <FormField label="Valor Total (R$)">
          <Input type="number" value={formData.value} onChange={(e) => onInputChange('value', e.target.value)} placeholder="0,00" step="0.01" min="0" disabled={isSubmitting} />
        </FormField>
        <FormField label="Forma de Pagamento">
          <Select value={formData.payment_type || 'SOMENTE_AGENDADO'} onValueChange={(v) => onInputChange('payment_type', v)} disabled={isSubmitting}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{paymentTypeOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
          </Select>
        </FormField>

        {formData.payment_type !== 'SOMENTE_AGENDADO' && (
          <>
            <FormField label="Método de Pagamento">
              <Select value={formData.payment_method || ''} onValueChange={(v) => onInputChange('payment_method', v)} disabled={isSubmitting}>
                <SelectTrigger><SelectValue placeholder="Selecione o método..." /></SelectTrigger>
                <SelectContent>{paymentMethodOptions.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
              </Select>
            </FormField>

            {formData.payment_type === 'ENTRADA_PARCELAS' && (
              <>
                <FormField label="Valor da Entrada (R$)">
                  <Input type="number" value={formData.entry_value} onChange={(e) => onInputChange('entry_value', e.target.value)} placeholder="0,00" step="0.01" min="0" disabled={isSubmitting} />
                </FormField>
                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox id="entry_paid" checked={formData.entry_paid} onCheckedChange={(c) => onInputChange('entry_paid', c)} disabled={isSubmitting} />
                  <label htmlFor="entry_paid" className="text-sm font-medium">Entrada já foi paga?</label>
                </div>
              </>
            )}

            {(formData.payment_type === 'ENTRADA_PARCELAS' || formData.payment_type === 'PIX_PARCELADO' || formData.payment_type === 'CARTAO_PARCELADO') && (
              <FormField label="Número de Parcelas">
                <Input type="number" value={formData.installments || ''} onChange={(e) => onInputChange('installments', e.target.value)} placeholder="Ex: 3" step="1" min="1" disabled={isSubmitting} />
              </FormField>
            )}

            <FormField label="Data de Vencimento / 1ª Parcela">
              <Input type="date" value={formatDateForInput(formData.first_installment_date)} onChange={(e) => onInputChange('first_installment_date', e.target.value)} disabled={isSubmitting} />
            </FormField>

            {(formData.payment_type === 'CARTAO_CREDITO' || formData.payment_type === 'CARTAO_PARCELADO') && (
              <FormField label="Prazo de recebimento (dias)">
                <Input type="number" value={formData.card_processing_days} onChange={(e) => onInputChange('card_processing_days', e.target.value)} placeholder="Ex: 15" step="1" min="0" disabled={isSubmitting} />
              </FormField>
            )}

            {formData.payment_type === 'INTEGRAL' && (
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox id="integral_paid" checked={formData.entry_paid} onCheckedChange={(c) => onInputChange('entry_paid', c)} disabled={isSubmitting} />
                <label htmlFor="integral_paid" className="text-sm font-medium">Pagamento integral já recebido?</label>
              </div>
            )}
          </>
        )}
      </Section>

      <Section title="Contrato e Observações" icon={FileText}>
        <FormField label="Contrato">
          <div className="flex items-center space-x-2">
            <Button asChild variant="outline" className="flex-1" disabled={uploadingContract || isSubmitting}>
              <label htmlFor="contract-upload" className="cursor-pointer">
                {uploadingContract ? 'Enviando...' : (formData.contract_name || 'Anexar PDF ou DOC')}
              </label>
            </Button>
            <Input id="contract-upload" type="file" ref={fileInputRef} onChange={handleContractUpload} accept=".pdf,.doc,.docx" className="hidden" />
            <Select value={formData.contract_status || "pending"} onValueChange={(v) => onInputChange('contract_status', v)} disabled={isSubmitting}>
              <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
              <SelectContent>{contractStatusOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          {formData.contract_url && formData.contract_name && (
            <a href={formData.contract_url} target="_blank" rel="noopener noreferrer" className="text-sm text-customPurple hover:underline flex items-center mt-2">
              <LinkIcon size={14} className="mr-1.5" /> Ver Contrato: {formData.contract_name}
            </a>
          )}
        </FormField>
        <FormField label="Observações">
          <Textarea value={formData.description} onChange={(e) => onInputChange('description', e.target.value)} placeholder="Detalhes adicionais, notas, etc." rows="4" disabled={isSubmitting} />
        </FormField>
      </Section>
    </div>
  );
};

export default WorkflowModalForm;