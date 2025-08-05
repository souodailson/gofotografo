import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import InputMask from 'react-input-mask';

const fieldConfigurations = {
  // Evento/Ensaio Info
  'ENSAIO_TIPO': { type: 'select', options: ['Newborn', 'Gestante', 'Casamento', 'Formatura', 'Aniversário', 'Corporativo', 'Show', 'Outro'], required: true },
  'TIPO_EVENTO': { type: 'select', options: ['Casamento', 'Aniversário', 'Formatura', 'Corporativo', 'Show', 'Batizado', 'Outro'], required: true },
  'NUM_FOTOGRAFOS': { type: 'select', options: ['1', '2', '3', '4+'], required: true },
  'ENSAIO_DATA_HORARIO': { type: 'datetime-local', required: true },
  'CERIMONIA_DATA_HORARIO': { type: 'datetime-local', required: true },
  'FESTA_DATA_HORARIO_SE_HOUVER': { type: 'datetime-local' },
  'PARTO_DATA_PREVISTA': { type: 'date', required: true },
  'BEBE_DATA_PREVISTA_NASCIMENTO': { type: 'date', required: true },
  'DURACAO_ESTIMADA_COBERTURA_HORAS': { type: 'number', required: true },
  'TEMPO_COBERTURA_HORAS': { type: 'number', required: true },
  'DURACAO_TOTAL_COBERTURA_HORAS': { type: 'number', required: true },
  'LIMITE_TEMPO_COBERTURA_ESTIPULADO': { type: 'number' },
  'ANTECEDENCIA_CHEGADA_CONTRATADA_HORAS': { type: 'number' },
  'SEMANA_GESTAÇÃO_INICIO_SOBREAVISO': { type: 'number' },
  'PARTO_PERIODO_SOBREAVISO_SEMANA_INICIAL': { type: 'number' },
  'DETALHES_COBERTURA': { type: 'textarea' },
  'MOMENTOS_PRINCIPAIS_A_SEREM_COBERTOS': { type: 'textarea' },
  'DETALHES_FIGURINO_ACESSORIOS': { type: 'textarea' },
  'PARTICIPACAO_FAMILIARES': { type: 'textarea' },
  'DESCRICAO_PLANO_PERSONALIZADO': { type: 'textarea' },

  // Acompanhamento
  'PLANO_ACOMPANHAMENTO_SELECAO': { type: 'radio', options: ['Mensal', 'Bimestral', 'Trimestral', 'Personalizado'] },
  'PLANO_MENSAL_NUM_SESSOES': { type: 'number' },
  
  // Especificações de Entrega
  'QUANTIDADE_FOTOS_ENTREGUES': { type: 'number', required: true },
  'NUM_FOTOS_ENTREGUES_MINIMO': { type: 'number' },
  'NUM_FOTOS_ENTREGUES_ESTIMADO': { type: 'number' },
  'FORMATO_ENTREGA': { type: 'select', options: ['Digital', 'Impresso', 'Álbum', 'Outro'], required: true },
  'PRODUTO_FINAL_DESCRICAO': { type: 'textarea' },
  'FORMATO_ENTREGA_DETALHES_ALBUM': { type: 'textarea' },
  'PRAZO_ENTREGA_MATERIAL_DIGITAL_DIAS_CORRIDOS': { type: 'number', required: true },
  'PRAZO_SELECAO_EDICAO_ENTREGA_DIAS_CORRIDOS': { type: 'number' },
  'PRAZO_DOWNLOAD_LINK_DIAS_CORRIDOS': { type: 'number' },
  'PRAZO_DISPONIBILIDADE_LINK_DOWNLOAD_DIAS': { type: 'number' },
  'PRODUTO_FINAL_PRAZO_ENTREGA_DIAS_UTEIS': { type: 'number' },
  'PRAZO_BACKUP_APOS_ENTREGA_DIAS': { type: 'number' },
  'PRAZO_ENTREGA_ARQUIVOS_DIGITAIS_DIAS': { type: 'number' },
  'PRAZO_CONFECCAO_ALBUM_DIAS_UTEIS': { type: 'number' },
  'PRAZO_ENTREGA_ARQUIVOS_DIGITAIS_DIAS_EVENTOS': { type: 'number' },
  'PRAZO_CONFECCAO_ALBUM_DIAS_UTEIS_EVENTOS': { type: 'number' },
  'PRAZO_SELECAO_FOTOS_DIAS': { type: 'number' },
  'PRAZO_SELECAO_ALBUM_PRAZO_DIAS': { type: 'number' },
  'PRAZO_ENTREGA_FOTOS_DIAS_UTEIS': { type: 'number' },
  'PRAZO_ACESSO_LINK_DOWNLOAD_DIAS': { type: 'number' },
  'PRAZO_SOLICITACAO_ALTERACOES_DIAS': { type: 'number', required: true },

  // Taxas e Valores Adicionais
  'VALOR_HORA_EXTRA': { type: 'currency' },
  'AJUDA_CUSTO_ALIMENTACAO_PROFISSIONAL': { type: 'currency' },
  'VALOR_FOTO_DIGITAL_EDITADA_ADICIONAL': { type: 'currency' },
  'TAXA_ADICIONAL_ALTERACAO_EDICAO': { type: 'currency' },
  'VALOR_HORA_EXTRA_ENSAIO': { type: 'currency' },
  'VALOR_ALTERACAO_ADICIONAL_FOTOS': { type: 'currency' },
  'TAXA_RECUPERACAO_ARQUIVOS': { type: 'currency' },
  'VALOR_REVISAO_ADICIONAL': { type: 'currency', required: true },
  'TAXA_EXCLUSIVIDADE_IMAGEM': { type: 'currency' },
  'VALOR_SESSAO_AVULSA': { type: 'currency' },
  'TAXA_RESERVAS_SOBREAVISO_VALOR': { type: 'currency' },
  'MULTA_INADIMPLENCIA_PERCENTUAL': { type: 'percentage', defaultValue: '2', required: true },
  'JUROS_MORA_PERCENTUAL_MES': { type: 'percentage', defaultValue: '1', required: true },
  'ENTRADA_PERCENTUAL': { type: 'percentage', defaultValue: '40' },
  'SALDO_REMANESCENTE_PERCENTUAL': { type: 'percentage' },

  // Cancelamento e Reagendamento
  'CANCELAMENTO_RETENCAO_MAIS_XX_DIAS_ANTECEDENCIA': { type: 'number', defaultValue: '90' },
  'RETENCAO_CANCELAMENTO_MAIS_XX_DIAS_PERCENTUAL': { type: 'percentage', defaultValue: '20' },
  'CANCELAMENTO_RETENCAO_ENTRE_XX_E_YY_DIAS_ANTECEDENCIA_INICIO': { type: 'number', defaultValue: '60' },
  'CANCELAMENTO_RETENCAO_ENTRE_XX_E_YY_DIAS_ANTECEDENCIA_FIM': { type: 'number', defaultValue: '30' },
  'RETENCAO_CANCELAMENTO_ENTRE_XX_E_YY_DIAS_PERCENTUAL': { type: 'percentage', defaultValue: '50' },
  'CANCELAMENTO_RETENCAO_MENOS_XX_DIAS_ANTECEDENCIA': { type: 'number', defaultValue: '30' },
  'RETENCAO_CANCELAMENTO_MENOS_XX_DIAS_PERCENTUAL': { type: 'percentage', defaultValue: '100' },
  'REAGENDAMENTO_AVISO_PREVIO_DIAS': { type: 'number', defaultValue: '15' },
  'TAXA_REAGENDAMENTO_ADICIONAL': { type: 'currency' },
  'AUSENCIA_AVISO_PREVIO_HORAS': { type: 'number', defaultValue: '48' },
  'ATRASO_TOLERANCIA_MINUTOS': { type: 'number', defaultValue: '15' },
  
  // Outros Termos
  'ALBUM_NUM_RODADAS_ALTERACOES': { type: 'number', defaultValue: '1', required: true },
  'REVISOES_ALTERACOES_GRATUITAS_QUANTIDADE': { type: 'number', defaultValue: '1', required: true },

  // Dados do Cliente (com máscaras)
  'CONTRATANTE_TELEFONE': { type: 'mask', mask: '(99) 99999-9999', required: true },
  'CONTRATANTE_2_TELEFONE': { type: 'mask', mask: '(99) 99999-9999' },
  'CONTRATANTE_CPF': { type: 'mask', mask: '999.999.999-99', required: true },
  'CONTRATANTE_2_CPF': { type: 'mask', mask: '999.999.999-99' },
  'REPRESENTANTE_LEGAL_CPF': { type: 'mask', mask: '999.999.999-99' },
  'CONTRATANTE_CNPJ': { type: 'mask', mask: '99.999.999/9999-99' },
  'DATA_NASCIMENTO_CRIANCA': { type: 'date' },
  'DATA_EVENTO': { type: 'date' },
  'HORARIO_EVENTO': { type: 'time' },
};

const DynamicFieldRenderer = ({ fieldKey, value, onChange, label, disabled }) => {
  const upperCaseKey = fieldKey.toUpperCase();
  const cleanKey = upperCaseKey.replace(/{{|}}/g, '');
  const config = fieldConfigurations[cleanKey] || {};
  const inputId = `field-${fieldKey}`;

  const renderInput = () => {
    switch (config.type) {
      case 'currency':
        return (
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">R$</span>
            <Input
              id={inputId}
              type="number"
              step="0.01"
              value={value || ''}
              onChange={(e) => onChange(fieldKey, e.target.value)}
              disabled={disabled}
              className="pl-10"
              required={config.required}
            />
          </div>
        );
      case 'percentage':
        return (
          <div className="relative">
            <Input
              id={inputId}
              type="number"
              step="0.01"
              value={value || config.defaultValue || ''}
              onChange={(e) => onChange(fieldKey, e.target.value)}
              disabled={disabled}
              className="pr-8"
              required={config.required}
            />
            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground">%</span>
          </div>
        );
      case 'number':
        return (
          <Input
            id={inputId}
            type="number"
            value={value || config.defaultValue || ''}
            onChange={(e) => onChange(fieldKey, e.target.value)}
            disabled={disabled}
            className="w-full"
            required={config.required}
          />
        );
      case 'textarea':
        return (
          <Textarea
            id={inputId}
            value={value || ''}
            onChange={(e) => onChange(fieldKey, e.target.value)}
            disabled={disabled}
            rows={4}
            required={config.required}
          />
        );
      case 'select':
        return (
          <Select onValueChange={(val) => onChange(fieldKey, val)} value={value} disabled={disabled} required={config.required}>
            <SelectTrigger id={inputId}>
              <SelectValue placeholder={`Selecione...`} />
            </SelectTrigger>
            <SelectContent>
              {config.options.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
            </SelectContent>
          </Select>
        );
      case 'radio':
        return (
          <RadioGroup
            id={inputId}
            value={value}
            onValueChange={(val) => onChange(fieldKey, val)}
            className="flex items-center space-x-4 pt-2"
            disabled={disabled}
            required={config.required}
          >
            {config.options.map(opt => (
              <div key={opt} className="flex items-center space-x-2">
                <RadioGroupItem value={opt} id={`${inputId}-${opt}`} />
                <Label htmlFor={`${inputId}-${opt}`}>{opt}</Label>
              </div>
            ))}
          </RadioGroup>
        );
      case 'mask':
        return (
          <InputMask
            mask={config.mask}
            value={value || ''}
            onChange={(e) => onChange(fieldKey, e.target.value)}
            disabled={disabled}
            required={config.required}
          >
            {(inputProps) => <Input {...inputProps} id={inputId} />}
          </InputMask>
        );
      case 'date':
        return (
          <Input
            id={inputId}
            type="date"
            value={value || ''}
            onChange={(e) => onChange(fieldKey, e.target.value)}
            disabled={disabled}
            className="w-full"
            required={config.required}
          />
        );
      case 'datetime-local':
          return (
            <Input
              id={inputId}
              type="datetime-local"
              value={value || ''}
              onChange={(e) => onChange(fieldKey, e.target.value)}
              disabled={disabled}
              className="w-full"
              required={config.required}
            />
          );
      case 'time':
        return (
          <Input
            id={inputId}
            type="time"
            value={value || ''}
            onChange={(e) => onChange(fieldKey, e.target.value)}
            disabled={disabled}
            className="w-full"
            required={config.required}
          />
        );
      default:
        return (
          <Input
            id={inputId}
            type="text"
            value={value || ''}
            onChange={(e) => onChange(fieldKey, e.target.value)}
            disabled={disabled}
            required={config.required}
          />
        );
    }
  };

  return (
    <div className="space-y-2 flex flex-col">
      <Label htmlFor={inputId}>
        {label}
        {config.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {renderInput()}
    </div>
  );
};

export default DynamicFieldRenderer;