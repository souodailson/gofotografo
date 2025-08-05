import React from 'react';
import { motion } from 'framer-motion';
import { HardDrive, Hourglass, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const EquipmentSelectionSection = ({ equipments, selectedEquipments, onSelect, dataLoading, formatCurrency }) => {
  return (
    <motion.section variants={sectionVariants} initial="hidden" animate="visible">
      <Card className="precifique-card-standard">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-foreground flex items-center">
            <HardDrive className="w-7 h-7 mr-3 text-customPurple" />
            Passo 5: Equipamentos Utilizados
          </CardTitle>
          <CardDescription className="mt-1 text-muted-foreground">
            Selecione os equipamentos que serão usados neste trabalho para contabilizar sua depreciação.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dataLoading && equipments.length === 0 ? (
            <div className="text-center py-8">
              <Hourglass className="mx-auto h-12 w-12 text-muted-foreground animate-spin mb-3" />
              <p className="text-muted-foreground">Carregando equipamentos...</p>
            </div>
          ) : equipments.length > 0 ? (
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
              {equipments.map(eq => (
                <div key={eq.id} className="flex items-center space-x-3 p-3 bg-muted/50 dark:bg-muted/20 rounded-lg">
                  <Checkbox 
                    id={`eq-${eq.id}`} 
                    checked={!!selectedEquipments[eq.id]}
                    onCheckedChange={() => onSelect(eq.id)}
                  />
                  <Label htmlFor={`eq-${eq.id}`} className="flex-grow cursor-pointer">
                    {eq.nome_equipamento} ({eq.marca} {eq.modelo})
                  </Label>
                  <span className="text-sm text-muted-foreground">Depreciação: {formatCurrency(eq.depreciacao_mensal)}/mês</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
              <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-3" />
              <p className="text-muted-foreground">Nenhum equipamento cadastrado em "Meu Setup".</p>
              <p className="text-xs text-muted-foreground mt-1">Adicione seus equipamentos para selecioná-los aqui.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.section>
  );
};

export default EquipmentSelectionSection;