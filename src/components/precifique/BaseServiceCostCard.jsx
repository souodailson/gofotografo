import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

const solidEntryVariants = {
  hidden: { scale: 0.95, y: 10 },
  visible: { scale: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } }
};

const BaseServiceCostCard = ({ baseServiceCost, costPerHour, totalDedicatedHours, totalVariableCosts, totalSelectedEquipmentsDepreciation, formatCurrency }) => {
  return (
    <motion.div 
      variants={solidEntryVariants} 
      initial="hidden" 
      animate="visible" 
      className="sticky bottom-[80px] sm:bottom-4 z-10" 
    >
      <div className="custo-base-borda-animada">
        <div 
          className={cn(
            "rounded-xl p-6 shadow-lg transition-all duration-300",
            "bg-white/50 dark:bg-gray-900/50 backdrop-blur-md"
          )}
        >
          <div className="pb-4">
            <h3 className="text-2xl font-bold text-customGreen flex items-center">
              <DollarSign className="w-7 h-7 mr-3" />
              Custo Base do Serviço
            </h3>
            <p className="mt-1 text-muted-foreground flex items-center">
              <Info className="w-4 h-4 mr-2 text-blue-400" />
              Este é o valor mínimo para cobrir seus custos, sem lucro.
            </p>
          </div>
          <div className="text-center">
            <p className="text-5xl font-extrabold text-foreground">
              {formatCurrency(baseServiceCost)}
            </p>
            <div className="mt-4 text-sm text-muted-foreground grid grid-cols-1 sm:grid-cols-3 gap-2">
              <p>Custo/Hora: {formatCurrency(costPerHour)}</p>
              <p>Horas Totais: {totalDedicatedHours.toFixed(2)}h</p>
              <p>Custos Variáveis: {formatCurrency(totalVariableCosts)}</p>
              <p className="sm:col-span-3">Depreciação Equip.: {formatCurrency(totalSelectedEquipmentsDepreciation)}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BaseServiceCostCard;