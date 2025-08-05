import React from 'react';
import { motion } from 'framer-motion';
import { User, Briefcase, Camera, FileText, Phone, Mail, Link2, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

const selectBaseClasses = "w-[120px] px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-customPurple focus:border-transparent";


const renderInput = (label, id, value, onChange, placeholder = '', type = 'text', icon) => {
  const Icon = icon;
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-muted-foreground mb-1">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />}
        <Input id={id} type={type} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={Icon ? "pl-10" : ""} />
      </div>
    </div>
  );
};

const ProfileSettings = ({ formData, handleInputChange, handleNestedInputChange, addNestedItem, removeNestedItem }) => {
  const websiteSocialTypes = [
    { value: "website", label: "Site" },
    { value: "instagram", label: "Instagram" },
    { value: "facebook", label: "Facebook" },
    { value: "linkedin", label: "LinkedIn" },
    { value: "other", label: "Outro" },
  ];

  if (!formData) {
    return (
      <motion.div className="bg-card rounded-xl p-6 shadow-lg border border-border lg:col-span-1">
        Carregando...
      </motion.div>
    );
  }

  const phones = Array.isArray(formData.phones) ? formData.phones : [];
  const websiteSocial = Array.isArray(formData.website_social) ? formData.website_social : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0 * 0.05 }}
      className="bg-card rounded-xl p-6 shadow-lg border border-border lg:col-span-1"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-customPurple to-customGreen rounded-lg flex items-center justify-center">
          <User className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-xl font-semibold text-card-foreground">Informações Pessoais e da Empresa</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderInput('Nome Completo', 'user_name', formData.user_name, (val) => handleInputChange('user_name', val), 'Seu nome completo', 'text', User)}
        {renderInput('Nome da Empresa (Fantasia)', 'business_name', formData.business_name, (val) => handleInputChange('business_name', val), 'Nome da sua empresa', 'text', Briefcase)}
        {renderInput('Tipo de Fotografia Principal', 'photography_type', formData.photography_type, (val) => handleInputChange('photography_type', val), 'Ex: Casamentos, Ensaios', 'text', Camera)}
        {renderInput('CNPJ (se aplicável)', 'cnpj', formData.cnpj, (val) => handleInputChange('cnpj', val), '00.000.000/0000-00', 'text', FileText)}
        {renderInput('CPF (para MEI/Autônomo)', 'cpf', formData.cpf, (val) => handleInputChange('cpf', val), '000.000.000-00', 'text', FileText)}
        {renderInput('E-mail Principal de Contato', 'contact_email', formData.contact_email, (val) => handleInputChange('contact_email', val), 'seu@email.com', 'email', Mail)}
        {renderInput('Endereço Comercial', 'address', formData.address, (val) => handleInputChange('address', val), 'Rua, Número, Bairro, Cidade - Estado', 'text', MapPin)}
        
        <div className="md:col-span-2 space-y-3">
          <label className="block text-sm font-medium text-muted-foreground">Telefone(s)</label>
          {phones.map((phone, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
              <Input 
                type="tel" 
                value={phone?.number || ''} 
                onChange={e => handleNestedInputChange('phones', index, 'number', e.target.value)} 
                placeholder="(99) 99999-9999"
                className="flex-grow"
              />
              {phones.length > 1 && <Button variant="ghost" size="icon" onClick={() => removeNestedItem('phones', index)}><Trash2 className="w-4 h-4 text-red-500"/></Button>}
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => addNestedItem('phones', { number: '' })}>Adicionar Telefone</Button>
        </div>

        <div className="md:col-span-2 space-y-3">
          <label className="block text-sm font-medium text-muted-foreground">Site / Redes Sociais</label>
          {websiteSocial.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Link2 className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
              <select 
                value={item?.type || 'website'} 
                onChange={e => handleNestedInputChange('website_social', index, 'type', e.target.value)}
                className={selectBaseClasses}
              >
                {websiteSocialTypes.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <Input 
                type="url" 
                value={item?.url || ''} 
                onChange={e => handleNestedInputChange('website_social', index, 'url', e.target.value)} 
                placeholder="https://..."
                className="flex-grow"
              />
              {websiteSocial.length > 1 && <Button variant="ghost" size="icon" onClick={() => removeNestedItem('website_social', index)}><Trash2 className="w-4 h-4 text-red-500"/></Button>}
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => addNestedItem('website_social', { type: 'website', url: '' })}>Adicionar Link</Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileSettings;