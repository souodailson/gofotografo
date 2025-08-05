import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Lock, ShieldCheck, Gem, Star, Zap } from 'lucide-react';

const plansData = [
  {
    id: 'starter',
    name: 'PLANO STARTER',
    priceMonthly: '19,90',
    icon: Zap,
    features: ['Clientes Ilimitados', 'Funil de Vendas', 'Controle de Caixa'],
  },
  {
    id: 'professional',
    name: 'PLANO PROFISSIONAL',
    priceMonthly: '39,90',
    icon: Star,
    features: ['Tudo do Starter', 'Agenda Google', 'Automações', 'Sua Logomarca'],
    recommended: true,
  },
  {
    id: 'studio_pro',
    name: 'PLANO STUDIO PRO',
    priceMonthly: '99,90',
    icon: Gem,
    features: ['Tudo do Profissional', 'Photocollection', 'Dashboard Completo', 'Gestão de Equipe'],
  },
];

const TrialExpiredModal = ({ isOpen, onClose, onUpgrade }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay-unified z-[9999]">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 50 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="bg-card text-card-foreground rounded-xl shadow-2xl w-full max-w-3xl p-6 md:p-8 overflow-hidden relative"
      >
        <div className="absolute -top-16 -left-16 w-48 h-48 bg-gradient-to-br from-customPurple/30 to-customGreen/30 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-gradient-to-tl from-customBlue/30 to-customPurple/30 rounded-full blur-3xl opacity-40"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="p-3 bg-destructive/20 rounded-full mb-4">
              <Lock className="w-10 h-10 text-destructive" />
            </div>
            <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 mb-2">
              Seu período de teste expirou!
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl">
              Faça o upgrade do seu plano para continuar usando todas as funcionalidades e manter sua empresa 100% organizada.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {plansData.map((plan) => (
              <div 
                key={plan.id} 
                className={`border rounded-lg p-4 flex flex-col items-center text-center transition-all duration-200 hover:shadow-xl hover:scale-105 cursor-pointer
                  ${plan.recommended ? 'border-customGreen bg-customGreen/5' : 'border-border bg-background/30'}`}
                onClick={onUpgrade}
              >
                {plan.recommended && (
                  <div className="absolute top-2 right-2 bg-customGreen text-white text-xs px-2 py-0.5 rounded-full font-semibold">POPULAR</div>
                )}
                <plan.icon className={`w-8 h-8 mb-2 ${plan.recommended ? 'text-customGreen' : 'text-primary'}`} />
                <h3 className="text-md font-bold text-foreground">{plan.name}</h3>
                <p className="text-2xl font-extrabold text-primary my-1">
                  R$ {plan.priceMonthly}
                  <span className="text-sm font-normal text-muted-foreground">/mês</span>
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 mt-2 mb-3">
                  {plan.features.slice(0,3).map(feature => <li key={feature}>{feature}</li>)}
                </ul>
              </div>
            ))}
          </div>

          <Button 
            onClick={onUpgrade} 
            size="lg" 
            className="w-full btn-custom-gradient text-white font-bold py-3 text-lg shadow-lg hover:shadow-xl transition-shadow duration-200"
          >
            <ShieldCheck className="w-6 h-6 mr-2" />
            Ver Planos e Fazer Upgrade
          </Button>
          
          {/* <Button variant="link" onClick={onClose} className="mt-4 text-muted-foreground text-sm w-full">
            Talvez mais tarde (acesso limitado)
          </Button> */}
        </div>
      </motion.div>
    </div>
  );
};

export default TrialExpiredModal;