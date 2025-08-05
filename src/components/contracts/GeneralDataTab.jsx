import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileSignature } from 'lucide-react';

const GeneralDataTab = ({ templates, selectedTemplate, onTemplateChange, contractTitle, onContractTitleChange }) => {
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileSignature className="w-6 h-6 mr-3 text-primary" />
          Dados Gerais do Contrato
        </CardTitle>
        <CardDescription>Selecione o modelo e defina um título para sua organização.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="template-select">Modelo de Contrato</Label>
          <Select onValueChange={onTemplateChange} value={selectedTemplate?.id || ''}>
            <SelectTrigger id="template-select">
              <SelectValue placeholder="Escolha um modelo..." />
            </SelectTrigger>
            <SelectContent>
              {templates.map(template => (
                <SelectItem key={template.id} value={template.id}>{template.nome_modelo}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="contract-title">Título do Contrato (para sua organização)</Label>
          <Input
            id="contract-title"
            value={contractTitle}
            onChange={(e) => onContractTitleChange(e.target.value)}
            placeholder="Ex: Contrato de Casamento - João e Maria (2025)"
            disabled={!selectedTemplate}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default GeneralDataTab;