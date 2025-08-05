import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Gavel, ShieldCheck, CalendarClock, FileWarning } from 'lucide-react';
import DynamicFieldRenderer from './DynamicFieldRenderer';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AnimatePresence, motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const LegalTermsTab = ({ placeholders, dynamicFields, onFieldChange, settings }) => {
  const imageAuthOption = dynamicFields['AUTORIZACAO_USO_IMAGEM_SIM_NAO_PARCIAL'];

  useEffect(() => {
    const today = new Date();
    const city = settings?.address?.split(',')[2]?.trim() || '';
    
    if (!dynamicFields['CIDADE_ASSINATURA']) {
      onFieldChange('CIDADE_ASSINATURA', city);
    }
    if (!dynamicFields['DIA_ASSINATURA']) {
      onFieldChange('DIA_ASSINATURA', format(today, 'dd'));
    }
    if (!dynamicFields['MES_ASSINATURA']) {
      onFieldChange('MES_ASSINATURA', format(today, 'MMMM', { locale: ptBR }));
    }
    if (!dynamicFields['ANO_ASSINATURA']) {
      onFieldChange('ANO_ASSINATURA', format(today, 'yyyy'));
    }
  }, [settings, onFieldChange, dynamicFields]);

  const renderField = (key, label, helpText = '') => {
    if (!placeholders.includes(key)) return null;
    return (
      <div>
        <DynamicFieldRenderer fieldKey={key} value={dynamicFields[key]} onChange={onFieldChange} label={label} />
        {helpText && <p className="text-xs text-muted-foreground mt-1">{helpText}</p>}
      </div>
    );
  };

  const renderImageAuthRadio = (key) => {
    if (!placeholders.includes(key)) return null;
    const options = ['Autorizo', 'Não Autorizo', 'Autorizo Parcialmente'];
    return (
      <div className="space-y-2">
        <Label>Autorização de Uso de Imagem</Label>
        <RadioGroup
          value={dynamicFields[key]}
          onValueChange={(val) => onFieldChange(key, val)}
          className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0"
        >
          {options.map(opt => (
            <div key={opt} className="flex items-center space-x-2">
              <RadioGroupItem value={opt} id={`opt-${key}-${opt}`} />
              <Label htmlFor={`opt-${key}-${opt}`}>{opt}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    );
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Gavel className="w-6 h-6 mr-3 text-primary" />
          Termos Legais e Condições
        </CardTitle>
        <CardDescription>Defina as cláusulas legais, autorizações e condições específicas do contrato.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        
        {/* Image Authorization */}
        <div className="p-4 border rounded-lg bg-background shadow-inner">
          <h3 className="text-lg font-semibold mb-4 flex items-center"><ShieldCheck className="w-5 h-5 mr-2" />Autorizações e Restrições</h3>
          <div className="space-y-4">
            {renderImageAuthRadio('AUTORIZACAO_USO_IMAGEM_SIM_NAO_PARCIAL')}
            <AnimatePresence>
              {imageAuthOption === 'Autorizo Parcialmente' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4"
                >
                  {renderField('RESTRICOES_USO_IMAGEM_PARTICULAR', 'Especifique as restrições de uso de imagem')}
                </motion.div>
              )}
            </AnimatePresence>
             {renderField('TAXA_EXCLUSIVIDADE_IMAGEM', 'Taxa de Exclusividade de Imagem (R$)')}
          </div>
        </div>

        {/* Cancellation & Rescheduling */}
        <div className="p-4 border rounded-lg bg-background shadow-inner">
          <h3 className="text-lg font-semibold mb-4 flex items-center"><CalendarClock className="w-5 h-5 mr-2" />Prazos e Condições</h3>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Cancellation */}
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Regras de Cancelamento</h4>
              {renderField('CANCELAMENTO_RETENCAO_MAIS_XX_DIAS_ANTECEDENCIA', 'Dias de antecedência para cancelamento (reembolso maior)')}
              {renderField('RETENCAO_CANCELAMENTO_MAIS_XX_DIAS_PERCENTUAL', '% Retido (cancelamento com antecedência)')}
              {renderField('CANCELAMENTO_RETENCAO_MENOS_XX_DIAS_ANTECEDENCIA', 'Dias de antecedência para cancelamento (reembolso menor)')}
              {renderField('RETENCAO_CANCELAMENTO_MENOS_XX_DIAS_PERCENTUAL', '% Retido (cancelamento próximo à data)')}
            </div>
            {/* Rescheduling */}
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Regras de Reagendamento</h4>
              {renderField('REAGENDAMENTO_AVISO_PREVIO_DIAS', 'Dias de aviso prévio para reagendamento sem taxa')}
              {renderField('TAXA_REAGENDAMENTO_PERCENTUAL', 'Taxa de Reagendamento (%)')}
            </div>
          </div>
        </div>
        
        {/* Other specific conditions */}
        <div className="p-4 border rounded-lg bg-background shadow-inner">
          <h3 className="text-lg font-semibold mb-4 flex items-center"><FileWarning className="w-5 h-5 mr-2" />Outras Condições Específicas</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {renderField('TAXA_ADICIONAL_ALTERACAO_EDICAO', 'Taxa para alteração de edição (R$)')}
            {renderField('REVISOES_ALTERACOES_GRATUITAS_QUANTIDADE', 'Nº de revisões/alterações gratuitas')}
            {renderField('VALOR_REVISAO_ADICIONAL', 'Valor por revisão adicional (R$)')}
            {renderField('PRAZO_SOLICITACAO_ALTERACOES_DIAS', 'Prazo para solicitar alterações (dias)')}
          </div>
        </div>

        {/* Final provisions */}
        <div className="p-4 border rounded-lg bg-background shadow-inner">
          <h3 className="text-lg font-semibold mb-4">Disposições Finais</h3>
           <div className="grid md:grid-cols-2 gap-6">
             {renderField('FORO_CIDADE_ESTADO', 'Foro (Cidade/Estado)')}
           </div>
           <div className="mt-6">
             <Label>Data de Assinatura</Label>
             <div className="flex items-center gap-2 flex-wrap mt-2">
                {renderField('CIDADE_ASSINATURA', 'Cidade')}
                <span>,</span>
                {renderField('DIA_ASSINATURA', 'Dia')}
                <span>de</span>
                {renderField('MES_ASSINATURA', 'Mês')}
                <span>de</span>
                {renderField('ANO_ASSINATURA', 'Ano')}
             </div>
           </div>
        </div>
        
      </CardContent>
    </Card>
  );
};

export default LegalTermsTab;