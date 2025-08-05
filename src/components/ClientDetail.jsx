import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';
import GlobalLoadingIndicator from '@/components/GlobalLoadingIndicator';
import ClientDetailHeader from '@/components/client-detail/ClientDetailHeader';
import ClientDetailTabs from '@/components/client-detail/ClientDetailTabs';
import useMobileLayout from '@/hooks/useMobileLayout';

export const initialFormData = {
  name: '',
  email: '',
  phone: '',
  client_type: 'Pessoa Física',
  cpf: '',
  cnpj: '',
  status: 'Ativo',
  birth_date: '',
  contact_person_name: '',
  contact_person_role: '',
  address: { street: '', number: '', complement: '', neighborhood: '', city: '', state: '', zip_code: '', country: 'Brasil' },
  additional_phones: [],
  client_origin: '',
  family_info: { partner_name: '', children_names_birthdays: [{ name: '', birth_date: '' }], wedding_anniversary: '' },
  style_preferences: '',
  image_auth_status: 'Não Solicitado',
  social_media: { instagram: '', facebook: '', linkedin: '', other: '' },
};

const ClientDetail = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { getClientById, updateClient, loading: dataLoading, refreshClientContracts } = useData();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { isMobile } = useMobileLayout();

  useEffect(() => {
    setIsLoading(true);
    const clientSelecionado = getClientById(clientId);

    if (clientSelecionado) {
      const formattedClient = {
        ...initialFormData,
        ...clientSelecionado,
        birth_date: clientSelecionado.birth_date ? clientSelecionado.birth_date.split('T')[0] : '',
        address: { ...initialFormData.address, ...(clientSelecionado.address || {}) },
        family_info: { 
          ...initialFormData.family_info, 
          ...(clientSelecionado.family_info || {}),
          wedding_anniversary: clientSelecionado.family_info?.wedding_anniversary ? clientSelecionado.family_info.wedding_anniversary.split('T')[0] : '',
          children_names_birthdays: (clientSelecionado.family_info?.children_names_birthdays || []).map(child => ({
            ...child,
            birth_date: child.birth_date ? child.birth_date.split('T')[0] : '',
          }))
        },
        social_media: { ...initialFormData.social_media, ...(clientSelecionado.social_media || {}) },
        additional_phones: clientSelecionado.additional_phones || [],
      };
      setFormData(formattedClient);
      if (refreshClientContracts) {
        refreshClientContracts(clientId);
      }
      setIsLoading(false);
    } else if (!dataLoading) {
      toast({ title: "Erro", description: "Cliente não encontrado.", variant: "destructive" });
      navigate('/clients');
      setIsLoading(false);
    }
  }, [clientId, getClientById, dataLoading, navigate, toast, refreshClientContracts]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "client_type") {
      setFormData(prevData => ({
        ...prevData,
        client_type: value,
        cpf: value === 'Pessoa Jurídica' ? '' : prevData.cpf,
        cnpj: value === 'Pessoa Física' ? '' : prevData.cnpj,
        birth_date: value === 'Pessoa Jurídica' ? '' : prevData.birth_date,
        contact_person_name: value === 'Pessoa Física' ? '' : prevData.contact_person_name,
        contact_person_role: value === 'Pessoa Física' ? '' : prevData.contact_person_role,
      }));
    } else {
      setFormData(prevData => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleJsonFieldChange = (field, subField, value) => {
    setFormData(prevData => ({
      ...prevData,
      [field]: {
        ...(prevData[field] || (field === 'address' ? initialFormData.address : field === 'family_info' ? initialFormData.family_info : initialFormData.social_media)),
        [subField]: value,
      },
    }));
  };
  
  const handleFamilyInfoArrayChange = (index, key, value) => {
    setFormData(prevData => {
      const updatedChildren = [...(prevData.family_info?.children_names_birthdays || [])];
      if (!updatedChildren[index]) updatedChildren[index] = { name: '', birth_date: '' };
      updatedChildren[index][key] = value;
      return {
        ...prevData,
        family_info: {
          ...(prevData.family_info || initialFormData.family_info),
          children_names_birthdays: updatedChildren,
        },
      };
    });
  };
  
  const addFamilyMember = () => {
    setFormData(prevData => ({
      ...prevData,
      family_info: {
        ...(prevData.family_info || initialFormData.family_info),
        children_names_birthdays: [
          ...(prevData.family_info?.children_names_birthdays || []),
          { name: '', birth_date: '' }
        ],
      },
    }));
  };

  const removeFamilyMember = (index) => {
    setFormData(prevData => ({
      ...prevData,
      family_info: {
        ...(prevData.family_info || initialFormData.family_info),
        children_names_birthdays: (prevData.family_info?.children_names_birthdays || []).filter((_, i) => i !== index),
      },
    }));
  };

  const handleAdditionalPhoneChange = (index, value) => {
    setFormData(prevData => {
      const updatedPhones = [...(prevData.additional_phones || [])];
      updatedPhones[index] = value;
      return { ...prevData, additional_phones: updatedPhones };
    });
  };

  const addAdditionalPhone = () => {
    setFormData(prevData => ({ ...prevData, additional_phones: [...(prevData.additional_phones || []), ''] }));
  };
  
  const removeAdditionalPhone = (index) => {
    setFormData(prevData => ({ ...prevData, additional_phones: (prevData.additional_phones || []).filter((_, i) => i !== index) }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const dataToSave = {
        ...formData,
        birth_date: formData.birth_date || null,
        family_info: {
          ...formData.family_info,
          wedding_anniversary: formData.family_info?.wedding_anniversary || null,
          children_names_birthdays: (formData.family_info?.children_names_birthdays || []).map(child => ({
            ...child,
            birth_date: child.birth_date || null,
          })).filter(child => child.name || child.birth_date) 
        },
        additional_phones: (formData.additional_phones || []).filter(phone => phone && phone.trim() !== ''),
      };
      
      if (dataToSave.client_type === 'Pessoa Física') {
        dataToSave.cnpj = null;
        dataToSave.contact_person_name = null;
        dataToSave.contact_person_role = null;
      } else if (dataToSave.client_type === 'Pessoa Jurídica') {
        dataToSave.cpf = null;
      }

      await updateClient(clientId, dataToSave);
      toast({ title: "Sucesso!", description: "Dados do cliente atualizados." });
    } catch (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !formData) {
    return <GlobalLoadingIndicator theme="dark" />;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-5xl mx-auto pb-10"
    >
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/clients')} className="text-primary hover:bg-primary/10">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar para Clientes
        </Button>
        <Button onClick={handleSave} disabled={isSaving} className="btn-custom-gradient text-white shadow-lg">
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>

      <div className="bg-card rounded-xl p-6 shadow-xl border border-border">
        <ClientDetailHeader 
          clientType={formData.client_type} 
          clientName={formData.name} 
          clientStatus={formData.status} 
        />
        <ClientDetailTabs
          formData={formData}
          handleChange={handleChange}
          handleJsonFieldChange={handleJsonFieldChange}
          handleFamilyInfoArrayChange={handleFamilyInfoArrayChange}
          addFamilyMember={addFamilyMember}
          removeFamilyMember={removeFamilyMember}
          handleAdditionalPhoneChange={handleAdditionalPhoneChange}
          addAdditionalPhone={addAdditionalPhone}
          removeAdditionalPhone={removeAdditionalPhone}
        />
      </div>
    </motion.div>
  );
};

export default ClientDetail;