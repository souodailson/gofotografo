import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Heart, Image as ImageIcon, Link as LinkIcon, PlusCircle, Edit2, Gift } from 'lucide-react'; // Removido Calendar não usado

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

const ClientRelationshipMarketing = ({
  formData,
  handleChange, // Renomeado de handleInputChange para handleChange
  handleJsonFieldChange,
  handleFamilyInfoArrayChange,
  addFamilyMember,
  removeFamilyMember,
}) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField label="Como conheceu seu trabalho?" id="client_origin" icon={Heart}>
          <Input id="client_origin" name="client_origin" value={formData.client_origin || ''} onChange={handleChange} />
        </FormField>
        
        {/* Bloco de Código para Aniversário - Mantido como solicitado */}
        {/* A lógica de exibição condicional (formData.client_type === 'Pessoa Física') foi removida daqui
            pois o campo birth_date no formData será limpo em ClientDetail.jsx se for Pessoa Jurídica.
            Se a intenção é esconder visualmente, a condição deve ser adicionada aqui.
            Por ora, ele sempre será renderizado, mas o valor será controlado pelo client_type.
        */}
        <div className="campo-formulario mb-4"> 
          <Label htmlFor="birth_date_relationship_marketing" className="text-sm font-medium text-muted-foreground flex items-center mb-1">
            <Gift className="w-4 h-4 mr-2 text-primary" />
            Data de Nascimento (Aniversário)
          </Label>
          <Input
            type="date"
            id="birth_date_relationship_marketing" // ID único para este input específico
            name="birth_date" // Nome correto para conectar ao formData
            value={formData.birth_date || ''}
            onChange={handleChange} 
          />
        </div>
      </div>

      <SectionTitle icon={Heart} title="Informações Familiares" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Nome Cônjuge/Parceiro(a)" id="partner_name">
            <Input 
              id="partner_name" 
              name="family_info.partner_name" // Nome para campos aninhados (se fosse usar handleChange genérico)
              value={formData.family_info?.partner_name || ''} 
              onChange={(e) => handleJsonFieldChange('family_info', 'partner_name', e.target.value)} 
            />
          </FormField>
          <FormField label="Aniversário de Casamento" id="wedding_anniversary">
            <Input 
              type="date" 
              id="wedding_anniversary" 
              name="family_info.wedding_anniversary" // Nome para campos aninhados
              value={formData.family_info?.wedding_anniversary || ''} 
              onChange={(e) => handleJsonFieldChange('family_info', 'wedding_anniversary', e.target.value)} 
            />
          </FormField>
      </div>

      <div className="mt-4">
        <Label className="text-sm font-medium text-muted-foreground mb-1">Filhos(as) (Nome e Data de Nascimento)</Label>
        {(formData.family_info?.children_names_birthdays || []).map((child, index) => (
          <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center mb-2 p-3 border rounded-md bg-muted/20">
            <Input 
              placeholder="Nome do Filho(a)" 
              value={child.name || ''} 
              onChange={(e) => handleFamilyInfoArrayChange(index, 'name', e.target.value)}
              className="bg-background"
            />
            <Input 
              type="date" 
              value={child.birth_date || ''} 
              onChange={(e) => handleFamilyInfoArrayChange(index, 'birth_date', e.target.value)}
              className="bg-background"
            />
            <Button variant="ghost" size="icon" onClick={() => removeFamilyMember(index)} className="text-destructive/70 hover:text-destructive sm:ml-auto">
                <Edit2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={addFamilyMember} className="mt-2">
          <PlusCircle className="w-4 h-4 mr-2" /> Adicionar Filho(a)
        </Button>
      </div>

      <FormField label="Preferências de Estilo" id="style_preferences" icon={ImageIcon}>
        <Textarea 
          id="style_preferences" 
          name="style_preferences" 
          value={formData.style_preferences || ''} 
          onChange={handleChange} 
          rows={4} 
        />
      </FormField>

      <SectionTitle icon={LinkIcon} title="Redes Sociais" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField label="Instagram" id="instagram">
          <Input 
            id="instagram" 
            name="social_media.instagram" // Nome para campos aninhados
            value={formData.social_media?.instagram || ''} 
            onChange={(e) => handleJsonFieldChange('social_media', 'instagram', e.target.value)} 
            placeholder="ex: @usuario" 
          />
        </FormField>
        <FormField label="Facebook" id="facebook">
          <Input 
            id="facebook" 
            name="social_media.facebook" // Nome para campos aninhados
            value={formData.social_media?.facebook || ''} 
            onChange={(e) => handleJsonFieldChange('social_media', 'facebook', e.target.value)} 
            placeholder="ex: facebook.com/usuario"
          />
        </FormField>
        <FormField label="LinkedIn" id="linkedin">
          <Input 
            id="linkedin" 
            name="social_media.linkedin" // Nome para campos aninhados
            value={formData.social_media?.linkedin || ''} 
            onChange={(e) => handleJsonFieldChange('social_media', 'linkedin', e.target.value)} 
          />
        </FormField>
        <FormField label="Outra Rede" id="other_social">
          <Input 
            id="other_social" 
            name="social_media.other" // Nome para campos aninhados
            value={formData.social_media?.other || ''} 
            onChange={(e) => handleJsonFieldChange('social_media', 'other', e.target.value)} 
          />
        </FormField>
      </div>
    </>
  );
};

export default ClientRelationshipMarketing;