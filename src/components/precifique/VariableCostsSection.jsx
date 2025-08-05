import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, PlusCircle, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const VariableCostsSection = ({ variableCosts, onAdd, onChange, onRemove }) => {
  return (
    <motion.section variants={sectionVariants} initial="hidden" animate="visible">
      <Card className="precifique-card-standard">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-foreground flex items-center">
            <Briefcase className="w-7 h-7 mr-3 text-customPurple" />
            Passo 4: Custos Variáveis do Projeto
          </CardTitle>
          <CardDescription className="mt-1 text-muted-foreground">
            Quais são os custos que só existem para este trabalho específico? (Ex: álbum, taxas, frete)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {variableCosts.map((cost) => (
              <motion.div 
                key={cost.id} 
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex items-center space-x-2 p-3 bg-muted/50 dark:bg-muted/20 rounded-lg"
              >
                <Input 
                  type="text" 
                  placeholder="Descrição do Custo (Ex: Álbum 20x20)" 
                  value={cost.description}
                  onChange={(e) => onChange(cost.id, 'description', e.target.value)}
                  className="flex-grow bg-input border-border focus:border-customPurple"
                />
                <Input 
                  type="number" 
                  placeholder="Valor (R$)" 
                  value={cost.value}
                  onChange={(e) => onChange(cost.id, 'value', e.target.value)}
                  className="w-32 bg-input border-border focus:border-customPurple"
                />
                <Button variant="ghost" size="icon" onClick={() => onRemove(cost.id)} className="text-red-500 hover:text-red-700">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </motion.div>
            ))}
          </div>
          <Button onClick={onAdd} variant="outline" className="mt-4 border-customPurple text-customPurple hover:bg-customPurple/10">
            <PlusCircle className="w-4 h-4 mr-2" /> Adicionar Custo Variável
          </Button>
        </CardContent>
      </Card>
    </motion.section>
  );
};

export default VariableCostsSection;