import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DollarSign, CreditCard, Trash2, PlusCircle } from 'lucide-react';
import DynamicFieldRenderer from './DynamicFieldRenderer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, numberToWords } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';

const PaymentTab = ({ placeholders, dynamicFields, onFieldChange }) => {
  const [tableItems, setTableItems] = useState([{ id: uuidv4(), quantity: 1, description: '', unit_price: 0, discount: 0 }]);

  const paymentOption = dynamicFields['OPCAO_PAGAMENTO_SELECAO'];
  const acceptedPayments = dynamicFields['FORMAS_PAGAMENTO_ACEITAS'] || [];

  const totalServiceValue = useMemo(() => {
    return tableItems.reduce((acc, item) => {
      const itemTotal = (item.quantity || 0) * (item.unit_price || 0) - (item.discount || 0);
      return acc + itemTotal;
    }, 0);
  }, [tableItems]);

  useEffect(() => {
    onFieldChange('VALOR_TOTAL_SERVICO_NUMERICO', totalServiceValue);
    onFieldChange('VALOR_TOTAL_SERVICO_EXTENSO', numberToWords(totalServiceValue));
  }, [totalServiceValue, onFieldChange]);

  const handleTableChange = (id, field, value) => {
    setTableItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const addTableItem = () => {
    setTableItems(prev => [...prev, { id: uuidv4(), quantity: 1, description: '', unit_price: 0, discount: 0 }]);
  };

  const removeTableItem = (id) => {
    setTableItems(prev => prev.filter(item => item.id !== id));
  };

  const handleAcceptedPaymentsChange = (paymentMethod) => {
    const newAcceptedPayments = acceptedPayments.includes(paymentMethod)
      ? acceptedPayments.filter(p => p !== paymentMethod)
      : [...acceptedPayments, paymentMethod];
    onFieldChange('FORMAS_PAGAMENTO_ACEITAS', newAcceptedPayments);
  };

  const renderField = (key, label) => {
    if (!placeholders.includes(key)) return null;
    return <DynamicFieldRenderer key={key} fieldKey={key} value={dynamicFields[key]} onChange={onFieldChange} label={label} />;
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center">
          <DollarSign className="w-6 h-6 mr-3 text-primary" />
          Valores e Pagamento
        </CardTitle>
        <CardDescription>Defina os valores, condições e formas de pagamento do contrato.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        
        {placeholders.includes('TABELA_PRODUTOS_SERVICOS') && (
          <div className="p-4 border rounded-lg bg-background shadow-inner">
            <h3 className="text-lg font-semibold mb-4">Itens do Serviço</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Quant.</TableHead>
                  <TableHead>Discriminação</TableHead>
                  <TableHead className="w-[150px]">Valor Uni.</TableHead>
                  <TableHead className="w-[150px]">Descontos</TableHead>
                  <TableHead className="w-[150px] text-right">Total</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableItems.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Input type="number" value={item.quantity} onChange={e => handleTableChange(item.id, 'quantity', parseFloat(e.target.value))} className="h-9" />
                    </TableCell>
                    <TableCell>
                      <Input value={item.description} onChange={e => handleTableChange(item.id, 'description', e.target.value)} className="h-9" />
                    </TableCell>
                    <TableCell>
                      <Input type="number" step="0.01" value={item.unit_price} onChange={e => handleTableChange(item.id, 'unit_price', parseFloat(e.target.value))} className="h-9" />
                    </TableCell>
                    <TableCell>
                      <Input type="number" step="0.01" value={item.discount} onChange={e => handleTableChange(item.id, 'discount', parseFloat(e.target.value))} className="h-9" />
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency((item.quantity || 0) * (item.unit_price || 0) - (item.discount || 0))}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => removeTableItem(item.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={4} className="text-right font-bold text-lg">TOTAL</TableCell>
                  <TableCell className="text-right font-bold text-lg">{formatCurrency(totalServiceValue)}</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableFooter>
            </Table>
            <Button variant="outline" size="sm" onClick={addTableItem} className="mt-4">
              <PlusCircle className="w-4 h-4 mr-2" />
              Adicionar Item
            </Button>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="valor-total-numerico" className="text-base">Valor Total do Contrato (R$)</Label>
            <Input
              id="valor-total-numerico"
              type="number"
              step="0.01"
              value={dynamicFields['VALOR_TOTAL_SERVICO_NUMERICO'] || ''}
              onChange={(e) => onFieldChange('VALOR_TOTAL_SERVICO_NUMERICO', e.target.value)}
              className="text-2xl font-bold h-12"
              readOnly={placeholders.includes('TABELA_PRODUTOS_SERVICOS')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="valor-total-extenso" className="text-base">Valor por Extenso</Label>
            <Input
              id="valor-total-extenso"
              value={dynamicFields['VALOR_TOTAL_SERVICO_EXTENSO'] || ''}
              readOnly
              className="text-sm h-12 bg-muted"
            />
          </div>
        </div>

        <div className="p-4 border rounded-lg bg-background shadow-inner">
          <h3 className="text-lg font-semibold mb-4">Opções de Pagamento</h3>
          <RadioGroup
            value={paymentOption}
            onValueChange={(val) => onFieldChange('OPCAO_PAGAMENTO_SELECAO', val)}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Pagamento Integral" id="opt-integral" />
              <Label htmlFor="opt-integral">Pagamento Integral</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Pagamento Parcelado" id="opt-parcelado" />
              <Label htmlFor="opt-parcelado">Pagamento Parcelado</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Pagamento por Sessão" id="opt-sessao" />
              <Label htmlFor="opt-sessao">Pagamento por Sessão</Label>
            </div>
          </RadioGroup>

          <AnimatePresence>
            {paymentOption && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-6 p-4 bg-muted/50 rounded-md"
              >
                {paymentOption === 'Pagamento Integral' && (
                  <div className="grid md:grid-cols-2 gap-6">
                    {renderField('DESCONTO_AVISTA_PERCENTUAL', 'Desconto à Vista (%)')}
                    {renderField('VALOR_PAGO_INTEGRAL', 'Valor Final com Desconto')}
                  </div>
                )}
                {paymentOption === 'Pagamento Parcelado' && (
                  <div className="grid md:grid-cols-2 gap-6">
                    {renderField('VALOR_SINAL_ENTRADA', 'Sinal de Entrada (R$)')}
                    {renderField('NUMERO_PARCELAS', 'Nº de Parcelas')}
                    {renderField('VALOR_PARCELA', 'Valor da Parcela (R$)')}
                    {renderField('DIA_VENCIMENTO_PARCELA', 'Dia de Vencimento')}
                    <div className="md:col-span-2">
                      {renderField('OUTRA_FORMA_PARCELAMENTO_DESCRICAO', 'Descrição (outra forma de parcelamento)')}
                    </div>
                  </div>
                )}
                {paymentOption === 'Pagamento por Sessão' && (
                  <div>
                    {renderField('VALOR_POR_SESSAO', 'Valor por Sessão (R$)')}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-4 border rounded-lg bg-background shadow-inner">
          <h3 className="text-lg font-semibold mb-4 flex items-center"><CreditCard className="w-5 h-5 mr-2" />Formas de Pagamento Aceitas</h3>
          <div className="flex flex-wrap gap-x-6 gap-y-4">
            {['PIX', 'TED', 'Cartão de Crédito'].map(method => (
              <div key={method} className="flex items-center space-x-2">
                <Checkbox
                  id={`chk-${method}`}
                  checked={acceptedPayments.includes(method)}
                  onCheckedChange={() => handleAcceptedPaymentsChange(method)}
                />
                <Label htmlFor={`chk-${method}`}>{method}</Label>
              </div>
            ))}
          </div>
          <AnimatePresence>
            {acceptedPayments.includes('Cartão de Crédito') && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-6 p-4 bg-muted/50 rounded-md grid md:grid-cols-2 gap-6"
              >
                {renderField('PARCELAMENTO_CARTAO_MAX_PARCELAS', 'Nº Máximo de Parcelas no Cartão')}
                {renderField('PARCELAMENTO_CARTAO_JUROS_PERCENTUAL_MES', 'Juros ao Mês no Cartão (%)')}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </CardContent>
    </Card>
  );
};

export default PaymentTab;