import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Gem, Zap, ShieldCheck, Star, Percent, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useData } from '@/contexts/DataContext';
import { supabase } from '@/lib/supabaseClient';
import { loadStripe } from '@stripe/stripe-js';

const plansData = [
  {
    id: 'starter',
    name: 'PLANO STARTER',
    tagline: 'O impulso que você precisa para decolar.',
    description: 'Ideal para fotógrafos que estão começando e querem transformar o talento em um negócio organizado desde o primeiro dia.',
    priceMonthly: '19,90',
    priceYearlyOriginal: '199,00', 
    priceYearlyDiscounted: '199,00', 
    yearlySavings: 'Pague por 10 meses e use por 12. São 2 meses de presente!',
    stripePriceIdMonthly: 'price_1Ra8ilDORq3T75OLnBy3ZCJb', 
    stripePriceIdYearly: 'price_1Ra8ilDORq3T75OLPRPssWYq', 
    features: [
      'Agenda de Clientes Ilimitada',
      'Gestão de Oportunidades (Funil de Vendas)',
      'Controle de Caixa Simplificado',
      'Suporte dedicado via e-mail',
      'Teste grátis por 7 dias, sem pedir seu cartão',
    ],
    tier: 1,
    promoActive: false,
    exclusiveBonuses: []
  },
  {
    id: 'professional',
    name: 'PLANO PROFISSIONAL',
    tagline: 'Perfeito para otimizar o fluxo de trabalho.',
    description: 'Para fotógrafos que buscam economizar horas preciosas com automações e apresentar uma imagem mais profissional.',
    priceMonthly: '39,90',
    priceYearlyOriginal: '479,88', 
    priceYearlyDiscounted: '239,94', 
    yearlySavings: 'Economize mais de 50% e tenha suporte prioritário.',
    stripePriceIdMonthly: 'price_1Ra8igDORq3T75OLQuCI0dDO', 
    stripePriceIdYearly: 'price_1RanKjDORq3T75OL58V0uwpl', 
    recommended: true,
    features: [
      'Tudo do plano Starter, e mais:',
      'Controle Financeiro Avançado',
      'Agenda Inteligente com Google Calendar',
      'Automações e Lembretes',
      'Faça o upload da sua logomarca',
      'Subdomínio exclusivo (ex: seuestudio.dominio.com)',
      'Anotações Rápidas nos cards',
      'Precifique - sistema inteligente para criar pacotes, serviços e produtos',
      'Reserva Inteligente - Crie reservas inteligentes e tenha mais dinheiro',
      'Suporte prioritário via e-mail e chat',
    ],
    tier: 2,
    promoActive: true,
    exclusiveBonuses: []
  },
  {
    id: 'studio_pro',
    name: 'PLANO STUDIO PRO',
    tagline: 'A plataforma definitiva para escalar seu negócio.',
    description: 'Para estúdios e fotógrafos de alto volume que precisam de ferramentas robustas para gerenciar equipes e encantar clientes.',
    priceMonthly: '99,90',
    priceYearlyOriginal: '1198,80', 
    priceYearlyDiscounted: '599,40', 
    yearlySavings: 'A melhor oferta para o seu estúdio, com 50% de desconto e atendimento prioritario.',
    stripePriceIdMonthly: 'price_1Ra8iYDORq3T75OLCDN9fPpj', 
    stripePriceIdYearly: 'price_1RanLoDORq3T75OLacBvLO9R', 
    features: [
      'Tudo do plano Profissional, e mais:',
      'Dashboard Financeiro Completo',
      'Análise de Desempenho (Analytics)',
      'Gestão de Equipe e Colaboradores',
      'Precifique - sistema inteligente para criar pacotes, serviços e produtos',
      'Reserva Inteligente - Crie reservas inteligentes e tenha mais dinheiro',
      'Suporte Premium 7 dias por semana',
    ],
    tier: 3,
    promoActive: true,
    exclusiveBonuses: [
      'Scripts de atendimento persuasivos',
      '+10 Contratos blindados para vários nichos'
    ]
  },
];

const STRIPE_PUBLISHABLE_KEY = 'pk_live_51Ra7fNDORq3T75OLVpM1IkXngTngB7FSAeOIVU1UAS48EPUqAPMLvxOMoyMBw5P8y9F4MyV8K1VhCRI0lXepLnZD00caLRy39Q';
const stripePromise = STRIPE_PUBLISHABLE_KEY ? loadStripe(STRIPE_PUBLISHABLE_KEY) : null;

const PlansPage = ({ setActiveTab }) => {
  const [billingCycle, setBillingCycle] = useState('monthly'); 
  const { toast } = useToast();
  const { settings, user, refreshData, planStatus: contextPlanStatus } = useData();
  const [loadingStripe, setLoadingStripe] = useState(false);

  useEffect(() => {
    if (!stripePromise && !STRIPE_PUBLISHABLE_KEY) {
      toast({
        title: "Configuração do Stripe Pendente",
        description: "A chave publicável do Stripe ainda não foi configurada. Pagamentos não podem ser processados.",
        variant: "destructive",
        duration: 10000,
      });
    }
    
    const query = new URLSearchParams(window.location.search);
    if (query.get("status") === "success" && query.get("session_id")) {
      toast({
        title: "Pagamento Bem-Sucedido!",
        description: "Seu plano foi atualizado. Obrigado!",
        variant: "success",
        duration: 7000,
      });
      refreshData(); 
      
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    } else if (query.get("status") === "cancelled") {
      toast({
        title: "Pagamento Cancelado",
        description: "Você cancelou o processo de pagamento. Seu plano não foi alterado.",
        variant: "warning",
        duration: 7000,
      });
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }

  }, [toast, refreshData]);

  const handleChoosePlan = async (planId, priceId) => {
    if (!STRIPE_PUBLISHABLE_KEY || !priceId) {
      toast({
        title: "Integração com Pagamento Incompleta",
        description: "A configuração de pagamento para este plano ainda não foi finalizada.",
        variant: "destructive",
        duration: 7000,
      });
      console.error("Stripe Publishable Key or Price ID is missing.");
      return;
    }

    if (!user || !user.id) {
        toast({ title: "Erro", description: "Usuário não autenticado.", variant: "destructive"});
        return;
    }

    setLoadingStripe(true);
    const stripe = await stripePromise;
    if (!stripe) {
        toast({ title: "Erro no Stripe", description: "Não foi possível carregar o Stripe.", variant: "destructive"});
        setLoadingStripe(false);
        return;
    }

    try {
      const { error } = await stripe.redirectToCheckout({
        lineItems: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
        successUrl: `${window.location.origin}${window.location.pathname}?session_id={CHECKOUT_SESSION_ID}&plan_id=${planId}&status=success`,
        cancelUrl: `${window.location.origin}${window.location.pathname}?plan_id=${planId}&status=cancelled`,
        customerEmail: user.email,
        clientReferenceId: user.id, 
      });

      if (error) {
        console.error("Stripe Checkout error:", error);
        toast({ title: "Erro no Checkout", description: error.message, variant: "destructive" });
      }
    } catch (error) {
      console.error("Error redirecting to Stripe Checkout:", error);
      toast({ title: "Erro Inesperado", description: "Ocorreu um problema ao tentar iniciar o pagamento.", variant: "destructive" });
    } finally {
      setLoadingStripe(false);
    }
  };

  const userCurrentPlanId = contextPlanStatus ? contextPlanStatus.toLowerCase() : (settings?.current_plan_id ? settings.current_plan_id.toLowerCase() : 'trial');

  const currentPlanDetails = plansData.find(p => p.id === userCurrentPlanId);
  const currentPlanTier = currentPlanDetails ? currentPlanDetails.tier : 0;
  
  const getPlanIdFromContextStatus = (status) => {
    if (!status) return 'trial';
    return status.toLowerCase();
  }
  
  const normalizedUserPlanId = getPlanIdFromContextStatus(contextPlanStatus);

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <motion.div 
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-customPurple to-customGreen mb-3">
          PLANOS
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          Da sua primeira cliente ao seu estúdio de sucesso, temos o plano perfeito para cada etapa da sua carreira. Organize-se, profissionalize-se e ganhe mais tempo!
        </p>
      </motion.div>

      <div className="flex justify-center mb-10">
        <div className="inline-flex rounded-lg shadow-sm bg-background border border-border p-1">
          <Button
            onClick={() => setBillingCycle('monthly')}
            variant={billingCycle === 'monthly' ? 'default' : 'ghost'}
            className={`px-6 py-2 rounded-md transition-all duration-200 ease-in-out ${billingCycle === 'monthly' ? 'btn-custom-gradient text-white' : 'text-muted-foreground hover:bg-muted/50'}`}
          >
            Mensal
          </Button>
          <Button
            onClick={() => setBillingCycle('yearly')}
            variant={billingCycle === 'yearly' ? 'default' : 'ghost'}
            className={`px-6 py-2 rounded-md transition-all duration-200 ease-in-out relative ${billingCycle === 'yearly' ? 'btn-custom-gradient text-white' : 'text-muted-foreground hover:bg-muted/50'}`}
          >
            Anual
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full transform rotate-12">
              ECONOMIZE!
            </span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {plansData.map((plan, index) => {
          const isCurrentPlan = plan.id === normalizedUserPlanId;
          const isUpgrade = plan.tier > currentPlanTier;
          const isDowngrade = plan.tier < currentPlanTier;
          const priceId = billingCycle === 'monthly' ? plan.stripePriceIdMonthly : plan.stripePriceIdYearly;
          
          const displayPrice = billingCycle === 'monthly' 
            ? plan.priceMonthly 
            : (plan.promoActive ? (parseFloat(plan.priceYearlyDiscounted) / 12).toFixed(2).replace('.',',') : (parseFloat(plan.priceYearlyOriginal) / 12).toFixed(2).replace('.',','));
          
          const yearlyPriceText = billingCycle === 'yearly' 
            ? (plan.promoActive ? `R$ ${plan.priceYearlyDiscounted}` : `R$ ${plan.priceYearlyOriginal}`)
            : '';


          let buttonText = "Escolher Plano";
          let buttonAction = () => handleChoosePlan(plan.id, priceId);
          let buttonDisabled = loadingStripe || !priceId;
          let buttonVariant = "default";

          if (isCurrentPlan) {
            buttonText = "Seu Plano Atual";
            buttonDisabled = true;
            buttonVariant = "outline";
          } else if (isUpgrade) {
            buttonText = "Fazer Upgrade";
          } else if (isDowngrade) {
            buttonText = "Fazer Downgrade";
            buttonDisabled = true; 
          }
          
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
              className={`bg-card rounded-2xl shadow-2xl border ${isCurrentPlan ? 'border-customPurple dark:border-customGreen ring-2 ring-customPurple dark:ring-customGreen' : (plan.recommended ? 'border-customGreen' : 'border-border')} p-8 flex flex-col relative overflow-hidden`}
            >
              {plan.recommended && !isCurrentPlan && (
                <div className="absolute top-0 right-0 bg-customGreen text-white text-xs font-bold px-4 py-1 rounded-bl-lg flex items-center">
                  <Star className="w-3 h-3 mr-1 fill-current" /> RECOMENDADO
                </div>
              )}
              {isCurrentPlan && (
                 <div className="absolute top-0 right-0 bg-customPurple dark:bg-customGreen text-white text-xs font-bold px-4 py-1 rounded-bl-lg flex items-center">
                  <ShieldCheck className="w-3 h-3 mr-1 fill-current" /> PLANO ATUAL
                </div>
              )}
              {billingCycle === 'yearly' && plan.promoActive && (
                 <Badge variant="destructive" className="absolute top-10 right-3 transform -translate-y-1/2 bg-red-500 text-white py-1 px-2.5">
                   <Percent className="w-3 h-3 mr-1" /> 50% OFF
                 </Badge>
              )}

              <div className="flex-grow">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-customPurple dark:text-customGreen mb-1">{plan.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">{plan.tagline}</p>
                
                <div className="mb-6">
                  {billingCycle === 'yearly' && plan.promoActive && (
                    <del className="text-xl text-muted-foreground/70 block">
                      R$ {(parseFloat(plan.priceYearlyOriginal) / 12).toFixed(2).replace('.',',')}
                    </del>
                  )}
                  <span className="text-4xl font-extrabold text-foreground">
                    R$ {displayPrice}
                  </span>
                  <span className="text-muted-foreground"> /mês</span>

                  {billingCycle === 'yearly' && (
                    <p className="text-xs text-customGreen font-medium mt-1">
                      Cobrado {yearlyPriceText} anualmente
                      {plan.promoActive && <span className="ml-1 text-muted-foreground">(Preço original: R$ {plan.priceYearlyOriginal})</span>}
                    </p>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground mb-6 h-16">{plan.description}</p>

                <ul className="space-y-3 text-sm mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-customGreen mr-3 mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.id === 'studio_pro' && billingCycle === 'yearly' && plan.exclusiveBonuses && plan.exclusiveBonuses.length > 0 && (
                  <div className="my-6 pt-4 border-t border-border">
                    <h4 className="text-sm font-semibold text-customPurple dark:text-customGreen mb-3 flex items-center">
                      <Gift className="w-4 h-4 mr-2"/> Bônus Exclusivos Inclusos:
                    </h4>
                    <ul className="space-y-2 text-sm">
                      {plan.exclusiveBonuses.map((bonus, i) => (
                        <li key={i} className="flex items-start">
                          <CheckCircle className="w-4 h-4 text-yellow-500 mr-2 mt-0.5 shrink-0" />
                          <span className="text-muted-foreground">{bonus}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <Button 
                onClick={buttonAction} 
                disabled={buttonDisabled}
                className={`w-full py-3 text-base font-semibold shadow-lg transition-transform duration-150 ease-in-out hover:scale-105 
                  ${isCurrentPlan ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'btn-custom-gradient text-white'} 
                  ${buttonVariant === "outline" && !isCurrentPlan ? 'border-primary text-primary hover:bg-primary/10' : ''}
                `}
              >
                {loadingStripe && !isCurrentPlan ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                  />
                ) : (
                  plan.id === 'starter' ? <Zap className="w-5 h-5 mr-2" /> : <Gem className="w-5 h-5 mr-2" />
                )}
                {buttonText}
              </Button>
              {billingCycle === 'yearly' && plan.yearlySavings && (
                <p className="text-xs text-center mt-4 text-customGreen">{plan.yearlySavings}</p>
              )}
               {(!STRIPE_PUBLISHABLE_KEY || !priceId) && !isCurrentPlan && (
                <p className="text-xs text-center mt-3 text-red-500">Configuração de pagamento pendente para este plano/ciclo.</p>
              )}
            </motion.div>
          );
        })}
      </div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-16 text-center"
      >
        <p className="text-muted-foreground">Dúvidas? <a href="mailto:suporte@gofotografo.com" className="text-customPurple dark:text-customGreen font-medium hover:underline">Fale conosco</a>.</p>
        <p className="text-xs text-muted-foreground mt-2">Todos os planos incluem atualizações contínuas e acesso a novas funcionalidades conforme são lançadas.</p>
      </motion.div>
    </div>
  );
};

export default PlansPage;