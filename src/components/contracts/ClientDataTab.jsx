import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { User, ChevronsUpDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import DynamicFieldRenderer from './DynamicFieldRenderer';

const ClientDataTab = ({
  clients,
  selectedClient,
  onClientChange,
  dynamicFields,
  onFieldChange,
  placeholders,
  selectedTemplate
}) => {
  const [openClientSelector, setOpenClientSelector] = useState(false);

  const handleSelectClient = (clientId) => {
    onClientChange(clientId);
    setOpenClientSelector(false);
  };
  
  const renderConditionalFields = () => {
    if (!selectedTemplate) return null;
    const templateName = selectedTemplate.nome_modelo.toLowerCase();
    
    const isWedding = templateName.includes('casamento');
    const isBusiness = templateName.includes('empresarial');
    const isKidsParty = templateName.includes('infantil') || templateName.includes('aniversário');

    const renderFieldIfNeeded = (key, label) => {
        if (!placeholders.includes(key)) return null;
        return <DynamicFieldRenderer fieldKey={key} value={dynamicFields[key]} onChange={onFieldChange} label={label} />;
    }

    return (
      <>
        {isWedding && (
          <div className="mt-6 p-4 border rounded-lg bg-muted/50">
            <h3 className="text-lg font-semibold mb-4">Dados do Noivo(a) 2</h3>
            <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
              {renderFieldIfNeeded('CONTRATANTE_2_NOME_COMPLETO', 'Nome Completo')}
              {renderFieldIfNeeded('CONTRATANTE_2_CPF', 'CPF')}
              {renderFieldIfNeeded('CONTRATANTE_2_RG', 'RG')}
              {renderFieldIfNeeded('CONTRATANTE_2_TELEFONE', 'Telefone')}
            </div>
          </div>
        )}
        {isBusiness && (
          <div className="mt-6 p-4 border rounded-lg bg-muted/50">
            <h3 className="text-lg font-semibold mb-4">Dados do Representante Legal</h3>
            <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
              {renderFieldIfNeeded('REPRESENTANTE_LEGAL_NOME', 'Nome do Representante')}
              {renderFieldIfNeeded('REPRESENTANTE_LEGAL_CPF', 'CPF do Representante')}
            </div>
          </div>
        )}
        {isKidsParty && (
          <div className="mt-6 p-4 border rounded-lg bg-muted/50">
            <h3 className="text-lg font-semibold mb-4">Informações do Aniversariante/Criança</h3>
            <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
              {renderFieldIfNeeded('NOME_CRIANCA', 'Nome da Criança')}
              {renderFieldIfNeeded('DATA_NASCIMENTO_CRIANCA', 'Data de Nascimento')}
            </div>
          </div>
        )}
      </>
    );
  };


  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="w-6 h-6 mr-3 text-primary" />
          Dados do Cliente
        </CardTitle>
        <CardDescription>Selecione um cliente existente ou preencha os dados manualmente.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Selecionar Cliente Existente</Label>
          <Popover open={openClientSelector} onOpenChange={setOpenClientSelector}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openClientSelector}
                className="w-full justify-between"
              >
                {selectedClient ? selectedClient.name : "Selecione um cliente..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
              <Command>
                <CommandInput placeholder="Buscar cliente..." />
                <CommandList>
                  <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                  <CommandGroup>
                    {clients.map((client) => (
                      <CommandItem
                        key={client.id}
                        value={client.name}
                        onSelect={() => handleSelectClient(client.id)}
                      >
                        {client.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
          <DynamicFieldRenderer fieldKey="CONTRATANTE_NOME_COMPLETO" value={dynamicFields['CONTRATANTE_NOME_COMPLETO']} onChange={onFieldChange} label="Nome Completo" />
          <DynamicFieldRenderer fieldKey="CONTRATANTE_EMAIL" value={dynamicFields['CONTRATANTE_EMAIL']} onChange={onFieldChange} label="E-mail" />
          <DynamicFieldRenderer fieldKey="CONTRATANTE_TELEFONE" value={dynamicFields['CONTRATANTE_TELEFONE']} onChange={onFieldChange} label="Telefone" />
          <DynamicFieldRenderer fieldKey="CONTRATANTE_CPF" value={dynamicFields['CONTRATANTE_CPF']} onChange={onFieldChange} label="CPF" />
          <DynamicFieldRenderer fieldKey="CONTRATANTE_CNPJ" value={dynamicFields['CONTRATANTE_CNPJ']} onChange={onFieldChange} label="CNPJ" />
          <DynamicFieldRenderer fieldKey="CONTRATANTE_RG" value={dynamicFields['CONTRATANTE_RG']} onChange={onFieldChange} label="RG" />
        </div>
        <div className="space-y-2">
          <DynamicFieldRenderer fieldKey="CONTRATANTE_ENDERECO_COMPLETO" value={dynamicFields['CONTRATANTE_ENDERECO_COMPLETO']} onChange={onFieldChange} label="Endereço Completo" />
        </div>
        
        {renderConditionalFields()}
      </CardContent>
    </Card>
  );
};

export default ClientDataTab;