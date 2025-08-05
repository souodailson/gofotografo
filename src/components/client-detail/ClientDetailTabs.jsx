import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ClientRegistrationData from '@/components/client-detail/ClientRegistrationData';
import ClientRelationshipMarketing from '@/components/client-detail/ClientRelationshipMarketing';
import ClientLegalContracts from '@/components/client-detail/ClientLegalContracts';
import ClientHistory from '@/components/client-detail/ClientHistory'; // Nova importação

const ClientDetailTabs = ({
  formData,
  handleChange,
  handleJsonFieldChange,
  handleFamilyInfoArrayChange,
  addFamilyMember,
  removeFamilyMember,
  handleAdditionalPhoneChange,
  addAdditionalPhone,
  removeAdditionalPhone,
}) => {
  return (
    <Tabs defaultValue="dados-cadastrais" className="w-full">
      <TabsList className="grid w-full grid-cols-1 sm:grid-cols-4 mb-6 bg-muted/50"> {/* Ajustado para 4 colunas */}
        <TabsTrigger value="dados-cadastrais">Dados Cadastrais</TabsTrigger>
        <TabsTrigger value="relacionamento-marketing">Relacionamento e Marketing</TabsTrigger>
        <TabsTrigger value="juridico-contratos">Jurídico e Contratos</TabsTrigger>
        <TabsTrigger value="historico-servicos">Histórico</TabsTrigger> {/* Nova Aba */}
      </TabsList>

      <TabsContent value="dados-cadastrais">
        <ClientRegistrationData
          formData={formData}
          handleChange={handleChange}
          handleJsonFieldChange={handleJsonFieldChange}
          handleAdditionalPhoneChange={handleAdditionalPhoneChange}
          addAdditionalPhone={addAdditionalPhone}
          removeAdditionalPhone={removeAdditionalPhone}
        />
      </TabsContent>

      <TabsContent value="relacionamento-marketing">
        <ClientRelationshipMarketing
          formData={formData}
          handleChange={handleChange}
          handleJsonFieldChange={handleJsonFieldChange}
          handleFamilyInfoArrayChange={handleFamilyInfoArrayChange}
          addFamilyMember={addFamilyMember}
          removeFamilyMember={removeFamilyMember}
        />
      </TabsContent>

      <TabsContent value="juridico-contratos">
        <ClientLegalContracts
          formData={formData}
        />
      </TabsContent>

      <TabsContent value="historico-servicos"> {/* Novo Conteúdo da Aba */}
        <ClientHistory clientId={formData.id} />
      </TabsContent>
    </Tabs>
  );
};

export default ClientDetailTabs;