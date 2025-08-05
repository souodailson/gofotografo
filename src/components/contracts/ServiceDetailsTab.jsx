import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText, Briefcase, Truck, FileSignature, Info, DollarSign, AlertTriangle } from 'lucide-react';
import DynamicFieldRenderer from './DynamicFieldRenderer';
import { AnimatePresence, motion } from 'framer-motion';

const placeholderToLabel = (placeholder) => {
  if (!placeholder) return '';
  
  const specificLabels = {
    'CANCELAMENTO_RETENCAO_MAIS_XX_DIAS_ANTECEDENCIA': 'Dias de antecedência para retenção menor',
    'RETENCAO_CANCELAMENTO_MAIS_XX_DIAS_PERCENTUAL': 'Percentual de retenção (%) para antecedência maior',
    'CANCELAMENTO_RETENCAO_ENTRE_XX_E_YY_DIAS_ANTECEDENCIA_INICIO': 'Início do prazo intermediário (dias)',
    'CANCELAMENTO_RETENCAO_ENTRE_XX_E_YY_DIAS_ANTECEDENCIA_FIM': 'Fim do prazo intermediário (dias)',
    'RETENCAO_CANCELAMENTO_ENTRE_XX_E_YY_DIAS_PERCENTUAL': 'Percentual de retenção (%) para prazo intermediário',
    'CANCELAMENTO_RETENCAO_MENOS_XX_DIAS_ANTECEDENCIA': 'Dias de antecedência para retenção maior',
    'RETENCAO_CANCELAMENTO_MENOS_XX_DIAS_PERCENTUAL': 'Percentual de retenção (%) para antecedência menor',
    'REAGENDAMENTO_AVISO_PREVIO_DIAS': 'Aviso prévio para reagendamento (dias)',
    'TAXA_REAGENDAMENTO_ADICIONAL': 'Taxa de reagendamento adicional (R$)',
    'AUSENCIA_AVISO_PREVIO_HORAS': 'Horas de aviso prévio para ausência',
    'ATRASO_TOLERANCIA_MINUTOS': 'Tolerância de atraso (minutos)',
    'ALBUM_NUM_RODADAS_ALTERACOES': 'Nº de rodadas de alterações do álbum',
    'REVISOES_ALTERACOES_GRATUITAS_QUANTIDADE': 'Quantidade de alterações gratuitas',
  };

  const key = placeholder.toUpperCase().replace(/{{|}}/g, '');
  if (specificLabels[key]) return specificLabels[key];

  return placeholder
    .replace(/_/g, ' ')
    .replace(/{{|}}/g, '')
    .replace(/\b(CONTRATANTE|ENSAIO|EVENTO|SERVICO|CLIENTE|PLANO|ACOMPANHAMENTO)\b/gi, '')
    .trim()
    .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

const EVENT_INFO_KEYS = ['EVENTO', 'ENSAIO', 'DATA', 'HORARIO', 'LOCAL', 'DURACAO', 'TIPO', 'FOTOGRAFOS', 'NUM_FOTOGRAFOS', 'MAKING_OF', 'CERIMONIA', 'RECEPÇÃO', 'FESTA', 'PARTO', 'BEBE', 'GESTAÇÃO', 'SOBREAVISO', 'HOSPITAL', 'MATERNIDADE', 'MEDICO', 'FORMATURA', 'INSTITUICAO', 'CURSO', 'ANIVERSARIO'];
const DELIVERY_KEYS = ['ENTREGA', 'FOTOS', 'FORMATO', 'PRAZO', 'DOWNLOAD', 'LINK', 'GALERIA', 'PENDRIVE', 'SELECAO'];
const FINANCIAL_KEYS = ['VALOR', 'TAXA', 'CUSTO', 'MULTA', 'JUROS', 'ENTRADA', 'SALDO', 'RESERVA'];
const CANCELLATION_KEYS = ['CANCELAMENTO', 'REAGENDAMENTO', 'RETENCAO', 'AUSENCIA', 'ATRASO'];
const DETAILS_KEYS = ['DETALHAMENTO', 'DETALHES', 'FIGURINO', 'ACESSORIOS', 'PARTICIPACAO', 'FAMILIARES', 'MOMENTOS', 'COBERTURA', 'DESCRICAO', 'PLANO', 'RAIO_COBERTURA'];
const OTHER_TERMS_KEYS = ['ALBUM', 'REVISOES', 'ALTERACOES'];

const categorizePlaceholder = (p) => {
  const key = p.toUpperCase();
  if (EVENT_INFO_KEYS.some(k => key.includes(k))) return 'eventInfo';
  if (DELIVERY_KEYS.some(k => key.includes(k))) return 'delivery';
  if (FINANCIAL_KEYS.some(k => key.includes(k))) return 'financial';
  if (CANCELLATION_KEYS.some(k => key.includes(k))) return 'cancellation';
  if (DETAILS_KEYS.some(k => key.includes(k))) return 'details';
  if (OTHER_TERMS_KEYS.some(k => key.includes(k))) return 'otherTerms';
  return 'other';
};

const Section = ({ title, icon, fields, dynamicFields, onFieldChange, selectedTemplate }) => {
  if (fields.length === 0) return null;

  const planoSelecionado = dynamicFields['PLANO_ACOMPANHAMENTO_SELECAO'];
  const templateNome = selectedTemplate?.nome_modelo?.toLowerCase() || '';

  const renderConditionalFields = (key) => {
    const keyUpper = key.toUpperCase();
    
    if (keyUpper.includes('_EXTENSO') || keyUpper.includes('TABELA_PRODUTOS_SERVICOS')) return null;

    if (templateNome.includes('acompanhamento')) {
      if (keyUpper.includes('MENSAL') && planoSelecionado !== 'Mensal') return null;
      if (keyUpper.includes('BIMESTRAL') && planoSelecionado !== 'Bimestral') return null;
      if (keyUpper.includes('TRIMESTRAL') && planoSelecionado !== 'Trimestral') return null;
      if (keyUpper.includes('PERSONALIZADO') && planoSelecionado !== 'Personalizado') return null;
    }
    
    if (templateNome.includes('parto') && !keyUpper.includes('PARTO') && !keyUpper.includes('BEBE') && !keyUpper.includes('GESTAÇÃO') && !keyUpper.includes('SOBREAVISO') && !keyUpper.includes('HOSPITAL') && !keyUpper.includes('MEDICO')) return null;
    if (templateNome.includes('formatura') && !keyUpper.includes('FORMATURA') && !keyUpper.includes('INSTITUICAO') && !keyUpper.includes('CURSO')) return null;

    return (
        <motion.div
            key={key}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            layout
        >
            <DynamicFieldRenderer
                fieldKey={key}
                value={dynamicFields[key]}
                onChange={onFieldChange}
                label={placeholderToLabel(key)}
            />
        </motion.div>
    );
  };

  return (
    <div className="p-6 border rounded-lg bg-card shadow-lg hover:shadow-xl transition-shadow duration-300">
      <h3 className="text-xl font-bold mb-6 flex items-center text-primary">{icon}{title}</h3>
      <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
        <AnimatePresence>
            {fields.map(renderConditionalFields)}
        </AnimatePresence>
      </div>
    </div>
  );
};

const ServiceDetailsTab = ({ placeholders, dynamicFields, onFieldChange, selectedTemplate }) => {
  const groupedPlaceholders = useMemo(() => {
    const allServicePlaceholders = placeholders.filter(p =>
      !p.startsWith('CONTRATANTE_') &&
      !p.startsWith('REPRESENTANTE_LEGAL_') &&
      !p.startsWith('NOME_CRIANCA') &&
      !p.startsWith('DATA_NASCIMENTO_CRIANCA') &&
      !p.toUpperCase().startsWith('VALOR_TOTAL') &&
      !p.toUpperCase().startsWith('OPCAO_') &&
      !p.toUpperCase().startsWith('DESCONTO_') &&
      !p.toUpperCase().startsWith('SINAL_') &&
      !p.toUpperCase().startsWith('NUMERO_PARCELAS') &&
      !p.toUpperCase().startsWith('DIA_VENCIMENTO_') &&
      !p.toUpperCase().startsWith('OUTRA_FORMA_') &&
      !p.toUpperCase().startsWith('FORMAS_PAGAMENTO_') &&
      !p.toUpperCase().startsWith('PARCELAMENTO_CARTAO_') &&
      !p.toUpperCase().startsWith('AUTORIZACAO_') &&
      !p.toUpperCase().startsWith('RESTRICOES_') &&
      !p.toUpperCase().startsWith('FORO_') &&
      !p.toUpperCase().startsWith('CIDADE_') &&
      !p.toUpperCase().startsWith('DIA_') &&
      !p.toUpperCase().startsWith('MES_') &&
      !p.toUpperCase().startsWith('ANO_')
    );

    return allServicePlaceholders.reduce((acc, placeholder) => {
      const category = categorizePlaceholder(placeholder);
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(placeholder);
      return acc;
    }, { eventInfo: [], delivery: [], financial: [], cancellation: [], details: [], otherTerms: [], other: [] });
  }, [placeholders]);

  const sections = [
    { id: 'eventInfo', title: 'Informações Principais do Evento/Ensaio', icon: <Briefcase className="w-5 h-5 mr-3" />, fields: groupedPlaceholders.eventInfo },
    { id: 'delivery', title: 'Especificações de Entrega', icon: <Truck className="w-5 h-5 mr-3" />, fields: groupedPlaceholders.delivery },
    { id: 'financial', title: 'Taxas, Valores Adicionais e Condições Financeiras', icon: <DollarSign className="w-5 h-5 mr-3" />, fields: groupedPlaceholders.financial },
    { id: 'cancellation', title: 'Regras de Cancelamento e Reagendamento', icon: <AlertTriangle className="w-5 h-5 mr-3" />, fields: groupedPlaceholders.cancellation },
    { id: 'details', title: 'Detalhes Adicionais do Serviço', icon: <FileSignature className="w-5 h-5 mr-3" />, fields: groupedPlaceholders.details },
    { id: 'otherTerms', title: 'Outras Condições e Termos', icon: <Info className="w-5 h-5 mr-3" />, fields: groupedPlaceholders.otherTerms },
    { id: 'other', title: 'Campos Diversos', icon: <Info className="w-5 h-5 mr-3" />, fields: groupedPlaceholders.other },
  ];

  return (
    <Card className="mt-4 border-none shadow-none bg-transparent">
      <CardHeader className="px-2">
        <CardTitle className="flex items-center text-2xl">
          <FileText className="w-7 h-7 mr-3 text-primary" />
          Detalhes do Serviço Contratado
        </CardTitle>
        <CardDescription>Preencha as informações que serão inseridas no contrato. Campos com * são obrigatórios.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8 px-2">
        {sections.map(section => (
          section.fields.length > 0 &&
          <Section
            key={section.id}
            title={section.title}
            icon={section.icon}
            fields={section.fields}
            dynamicFields={dynamicFields}
            onFieldChange={onFieldChange}
            selectedTemplate={selectedTemplate}
          />
        ))}
      </CardContent>
    </Card>
  );
};

export default ServiceDetailsTab;