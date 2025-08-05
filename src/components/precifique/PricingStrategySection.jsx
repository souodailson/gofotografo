import React from 'react';
import { motion } from 'framer-motion';
import { Target, Percent, Save, PiggyBank, SmilePlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { parsePercentage } from '@/lib/precifiqueUtils';

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const PricingStrategySection = ({ financialReservePercentage, setFinancialReservePercentage, profitMarginPercentage, setProfitMarginPercentage, baseServiceCost, financialReserveValue, profitMarginValue, finalSuggestedPrice, onSave, isSavingService, formatCurrency }) => {
  return (
    <motion.section variants={sectionVariants} initial="hidden" animate="visible">
      <Card className="precifique-card-standard">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-foreground flex items-center">
            <Target className="w-7 h-7 mr-3 text-customGreen" />
            Passo 6: Sua Estratégia de Preço
          </CardTitle>
          <CardDescription className="mt-1 text-muted-foreground">
            Agora, vamos transformar seu custo em um preço vencedor.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="financialReservePercentage" className="flex items-center text-muted-foreground">
                <PiggyBank className="w-4 h-4 mr-2 text-customPurple"/>Reserva Financeira (%)
              </Label>
              <Input 
                id="financialReservePercentage" 
                type="number" 
                value={financialReservePercentage} 
                onChange={(e) => setFinancialReservePercentage(e.target.value)} 
                placeholder="Ex: 10" 
                className="mt-1 bg-input border-border focus:border-customPurple"
              />
              <p className="text-xs text-muted-foreground mt-1">Sugestão: 5% a 10%. Esta é uma gordurinha para reinvestir ou para emergências.</p>
            </div>
            <div>
              <Label htmlFor="profitMarginPercentage" className="flex items-center text-muted-foreground">
                <SmilePlus className="w-4 h-4 mr-2 text-customGreen"/>Margem de Lucro Desejada (%)
              </Label>
              <Input 
                id="profitMarginPercentage" 
                type="number" 
                value={profitMarginPercentage} 
                onChange={(e) => setProfitMarginPercentage(e.target.value)} 
                placeholder="Ex: 35" 
                className="mt-1 bg-input border-border focus:border-customGreen"
              />
              <p className="text-xs text-muted-foreground mt-1">Sugestão: 20% a 50% ou mais. Esta é a recompensa pelo seu talento e trabalho.</p>
            </div>
          </div>

          <Card className="bg-gradient-to-br from-muted/30 to-muted/10 shadow-inner precifique-card-standard">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-customGreen flex items-center">
                  <Percent className="w-6 h-6 mr-2"/> Preço Final Sugerido
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-3">
              <p className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-customPurple via-customGreen to-purple-600 animate-gradient-x">
                {formatCurrency(finalSuggestedPrice)}
              </p>
              <div className="text-sm text-muted-foreground border-t border-border pt-3 space-y-1">
                <div className="flex justify-between"><span>Custo Base Total:</span> <span>{formatCurrency(baseServiceCost)}</span></div>
                <div className="flex justify-between"><span>Reserva ({parsePercentage(financialReservePercentage).toFixed(1)}%):</span> <span className="text-customPurple">(+) {formatCurrency(financialReserveValue)}</span></div>
                <div className="flex justify-between"><span>Lucro ({parsePercentage(profitMarginPercentage).toFixed(1)}%):</span> <span className="text-customGreen">(+) {formatCurrency(profitMarginValue)}</span></div>
                <div className="flex justify-between font-bold text-lg border-t border-border pt-2 mt-2 text-foreground"><span>Preço Final para Cliente:</span> <span>{formatCurrency(finalSuggestedPrice)}</span></div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end pt-4">
            <Button 
              onClick={onSave} 
              disabled={isSavingService || baseServiceCost <= 0}
              className="btn-custom-accent-gradient shadow-lg text-lg px-8 py-6"
            >
              <Save className="w-5 h-5 mr-2" />
              {isSavingService ? "Salvando Pacote..." : "Salvar Pacote Precificado"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.section>
  );
};

export default PricingStrategySection;