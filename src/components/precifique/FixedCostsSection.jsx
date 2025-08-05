import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Receipt, PlusCircle, Edit, Trash2, TrendingUp, Hourglass, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import StatCardPrecifique from './StatCardPrecifique';

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const FixedCostsSection = ({ fixedCosts, dataLoading, onAddNew, onEdit, onDelete, totalMonthlyFixedCost, costPerHour, formatCurrency }) => {
  return (
    <motion.section variants={sectionVariants} initial="hidden" animate="visible">
      <Card className="precifique-card-standard">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <CardTitle className="text-2xl font-bold text-foreground flex items-center">
                <Receipt className="w-7 h-7 mr-3 text-customPurple" />
                Passo 1: Seus Custos Fixos Mensais
              </CardTitle>
              <CardDescription className="mt-1 text-muted-foreground">
                Liste todas as suas despesas mensais recorrentes para entender a base dos seus custos.
              </CardDescription>
            </div>
            <Button onClick={onAddNew} className="btn-custom-gradient mt-4 sm:mt-0 shadow-lg hover:opacity-90 transition-opacity">
              <PlusCircle className="w-5 h-5 mr-2" />
              Adicionar Custo Fixo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {dataLoading && fixedCosts.length === 0 ? (
                <div className="text-center py-8">
                  <Hourglass className="mx-auto h-12 w-12 text-muted-foreground animate-spin mb-3" />
                  <p className="text-muted-foreground">Carregando custos fixos...</p>
                </div>
              ) : fixedCosts.length > 0 ? (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                  <AnimatePresence>
                    {fixedCosts.map(cost => (
                      <motion.div
                        key={cost.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center justify-between p-3 bg-muted/50 dark:bg-muted/20 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                      >
                        <span className="font-medium text-foreground">{cost.nome_custo}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-customGreen font-semibold">{formatCurrency(cost.valor_mensal)}</span>
                          <Button variant="ghost" size="icon" onClick={() => onEdit(cost)} className="text-blue-500 hover:text-blue-700 h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 h-8 w-8">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir o custo "{cost.nome_custo}"?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onDelete(cost.id)} className="bg-red-600 hover:bg-red-700">Excluir</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
                  <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-3" />
                  <p className="text-muted-foreground">Nenhum custo fixo adicionado ainda.</p>
                  <p className="text-xs text-muted-foreground mt-1">Clique em "+ Adicionar Custo Fixo" para começar.</p>
                </div>
              )}
            </div>
            <div className="lg:col-span-1 space-y-6">
              <StatCardPrecifique 
                title="Custo Fixo Total Mensal" 
                value={formatCurrency(totalMonthlyFixedCost)} 
                icon={TrendingUp}
                description="Soma de todos os seus custos fixos mensais."
                colorClass="text-customGreen"
              />
              <StatCardPrecifique 
                title="Seu Custo por Hora" 
                value={`${formatCurrency(costPerHour)} / hora`}
                icon={Hourglass}
                description="Baseado em 160h/mês. Essencial para precificar!"
                colorClass="text-red-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.section>
  );
};

export default FixedCostsSection;