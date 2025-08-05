import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { User, Building, Phone, Mail, MapPin, PlusCircle, Trash2, CalendarDays } from 'lucide-react';

const SectionTitle = ({ icon: Icon, title }) => (
  <div className="flex items-center text-lg font-semibold text-primary mb-4 mt-6 border-b border-border pb-2">
    <Icon className="w-5 h-5 mr-2" />
    {title}
  </div>
);

const FormField = ({ label, id, children, icon: Icon, className }) => (
  <div className={`mb-4 ${className}`}>
    <Label htmlFor={id} className="text-sm font-medium text-muted-foreground flex items-center mb-1">
      {Icon && <Icon className="w-4 h-4 mr-2 text-primary" />}
      {label}
    </Label>
    {children}
  </div>
);

const ClientRegistrationData = ({
  formData,
  handleChange,
  handleJsonFieldChange,
  handleAdditionalPhoneChange,
  addAdditionalPhone,
  removeAdditionalPhone,
}) => {
  if (!formData) {
    return null; // Ou um loader, ou uma mensagem de erro
  }

  return (
    <>
      <SectionTitle icon={User} title="Informações Básicas" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField label="Nome Completo / Razão Social" id="name">
          <Input id="name" name="name" value={formData.name || ''} onChange={handleChange} />
        </FormField>
        <FormField label="Tipo de Cliente" id="client_type">
          <Select name="client_type" value={formData.client_type || 'Pessoa Física'} onValueChange={(value) => handleChange({ target: { name: 'client_type', value } })}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pessoa Física"><User className="w-4 h-4 mr-2 inline-block" />Pessoa Física</SelectItem>
              <SelectItem value="Pessoa Jurídica"><Building className="w-4 h-4 mr-2 inline-block" />Pessoa Jurídica</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
      </div>

      {formData.client_type === 'Pessoa Física' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <FormField label="CPF" id="cpf">
            <Input id="cpf" name="cpf" value={formData.cpf || ''} onChange={handleChange} />
          </FormField>
          <FormField label="Data de Nascimento" id="birth_date_registration">
            <Input type="date" id="birth_date_registration" name="birth_date" value={formData.birth_date || ''} onChange={handleChange} />
          </FormField>
        </div>
      )}

      {formData.client_type === 'Pessoa Jurídica' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <FormField label="CNPJ" id="cnpj">
            <Input id="cnpj" name="cnpj" value={formData.cnpj || ''} onChange={handleChange} />
          </FormField>
          <FormField label="Nome do Contato Principal" id="contact_person_name">
            <Input id="contact_person_name" name="contact_person_name" value={formData.contact_person_name || ''} onChange={handleChange} />
          </FormField>
          <FormField label="Cargo do Contato Principal" id="contact_person_role">
            <Input id="contact_person_role" name="contact_person_role" value={formData.contact_person_role || ''} onChange={handleChange} />
          </FormField>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <FormField label="Status do Cliente" id="status">
            <Select name="status" value={formData.status || 'Ativo'} onValueChange={(value) => handleChange({ target: { name: 'status', value } })}>
                <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Ativo">Ativo</SelectItem>
                    <SelectItem value="Inativo">Inativo</SelectItem>
                    <SelectItem value="Lead">Lead</SelectItem>
                    <SelectItem value="Prospect">Prospect</SelectItem>
                    <SelectItem value="Bloqueado">Bloqueado</SelectItem>
                </SelectContent>
            </Select>
        </FormField>
      </div>


      <SectionTitle icon={Phone} title="Informações de Contato" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField label="Telefone Principal" id="phone">
          <Input id="phone" name="phone" value={formData.phone || ''} onChange={handleChange} />
        </FormField>
        <FormField label="Email Principal" id="email">
          <Input type="email" id="email" name="email" value={formData.email || ''} onChange={handleChange} />
        </FormField>
      </div>

      <div className="mt-4">
        <Label className="text-sm font-medium text-muted-foreground mb-1">Telefones Adicionais</Label>
        {(formData.additional_phones || []).map((phone, index) => (
          <div key={index} className="flex items-center gap-2 mb-2">
            <Input 
              value={phone || ''} 
              onChange={(e) => handleAdditionalPhoneChange(index, e.target.value)}
              placeholder="Ex: (XX) XXXXX-XXXX"
            />
            <Button variant="ghost" size="icon" onClick={() => removeAdditionalPhone(index)} className="text-destructive/70 hover:text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={addAdditionalPhone} className="mt-2">
          <PlusCircle className="w-4 h-4 mr-2" /> Adicionar Telefone
        </Button>
      </div>

      <SectionTitle icon={MapPin} title="Endereço" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField label="CEP" id="zip_code">
          <Input id="zip_code" value={formData.address?.zip_code || ''} onChange={(e) => handleJsonFieldChange('address', 'zip_code', e.target.value)} />
        </FormField>
        <FormField label="Logradouro" id="street">
          <Input id="street" value={formData.address?.street || ''} onChange={(e) => handleJsonFieldChange('address', 'street', e.target.value)} />
        </FormField>
        <FormField label="Número" id="number">
          <Input id="number" value={formData.address?.number || ''} onChange={(e) => handleJsonFieldChange('address', 'number', e.target.value)} />
        </FormField>
        <FormField label="Complemento" id="complement">
          <Input id="complement" value={formData.address?.complement || ''} onChange={(e) => handleJsonFieldChange('address', 'complement', e.target.value)} />
        </FormField>
        <FormField label="Bairro" id="neighborhood">
          <Input id="neighborhood" value={formData.address?.neighborhood || ''} onChange={(e) => handleJsonFieldChange('address', 'neighborhood', e.target.value)} />
        </FormField>
        <FormField label="Cidade" id="city">
          <Input id="city" value={formData.address?.city || ''} onChange={(e) => handleJsonFieldChange('address', 'city', e.target.value)} />
        </FormField>
        <FormField label="Estado" id="state">
          <Input id="state" value={formData.address?.state || ''} onChange={(e) => handleJsonFieldChange('address', 'state', e.target.value)} />
        </FormField>
        <FormField label="País" id="country">
          <Input id="country" value={formData.address?.country || 'Brasil'} onChange={(e) => handleJsonFieldChange('address', 'country', e.target.value)} />
        </FormField>
      </div>
    </>
  );
};

export default ClientRegistrationData;