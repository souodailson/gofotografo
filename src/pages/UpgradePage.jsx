import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';
import { ShieldCheck, Gem, Star, Zap, Lock } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';

const plansData = [
  {
    id: 'starter',
    name: 'PLANO STARTER',
    tagline: 'O impulso que você precisa para decolar.',
    priceMonthly: '19,90',
    stripePriceIdMonthly: 'price_1Ra8ilDORq3T75OLnBy3ZCJb',
    icon: Zap,
    features: ['Clientes Ilimitados', 'Funil de Vendas', 'Controle de Caixa'],
  },
  {
    id: 'professional',
    name: 'PLANO PROFISSIONAL',
    tagline: 'Perfeito para otimizar o fluxo de trabalho.',
    priceMonthly: '39,90',
    stripePriceIdMonthly: 'price_1Ra8igDORq3T75OLQuCI0dDO',
    icon: Star,
    features: ['Tudo do Starter', 'Agenda Google', 'Automações', 'Sua Logomarca'],
    recommended: true,
  },
  {
    id: 'studio_pro',
    name: 'PLANO STUDIO PRO',
    tagline: 'A plataforma definitiva para escalar seu negócio.',
    priceMonthly: '99,90',
    stripePriceIdMonthly: 'price_1Ra8iYDORq3T75OLCDN9fPpj',
    icon: Gem,
    features: ['Tudo do Profissional', 'Photocollection', 'Dashboard Completo', 'Gestão de Equipe'],
  },
];

const STRIPE_PUBLISHABLE_KEY = 'pk_live_51Ra7fNDORq3T75OLVpM1IkXngTngB7FSAeOIVU1UAS48EPUqAPMLvxOMoyMBw5P8y9F4MyV8K1VhCRI0lXepLnZD00caLRy39Q';
const stripePromise = STRIPE_PUBLISHABLE_KEY ? loadStripe(STRIPE_PUBLISHABLE_KEY) : null;

const UpgradePage = () => {
  const navigate = useNavigate();
  const { user, refreshData } = useData();
  const { toast } = useToast();
  const [loadingStripe, setLoadingStripe] = React.useState(false);

  const handleChoosePlan = async (planId, priceId) => {
    if (!STRIPE_PUBLISHABLE_KEY || !priceId) {
      toast({
        title: "Pagamento Indisponível",
        description: "A configuração de pagamento para este plano ainda não foi finalizada.",
        variant: "destructive",
      });
      return;
    }
    if (!user || !user.id) {
      toast({ title: "Erro", description: "Usuário não autenticado.", variant: "destructive" });
      navigate('/login');
      return;
    }

    setLoadingStripe(true);
    const stripe = await stripePromise;
    if (!stripe) {
      toast({ title: "Erro no Stripe", description: "Não foi possível carregar o Stripe.", variant: "destructive" });
      setLoadingStripe(false);
      return;
    }

    try {
      const { error } = await stripe.redirectToCheckout({
        lineItems: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
        successUrl: `${window.location.origin}/?payment_status=success&plan_id=${planId}&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/upgrade?payment_status=cancelled&plan_id=${planId}`,
        customerEmail: user.email,
        clientReferenceId: user.id,
      });

      if (error) {
        toast({ title: "Erro no Checkout", description: error.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Erro Inesperado", description: "Ocorreu um problema ao tentar iniciar o pagamento.", variant: "destructive" });
    } finally {
      setLoadingStripe(false);
    }
  };
  
  React.useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get("payment_status") === "success") {
      toast({
        title: "Pagamento Bem-Sucedido!",
        description: "Seu plano foi atualizado. Redirecionando...",
        variant: "success",
        duration: 5000,
      });
      refreshData(user);
      navigate('/'); 
      
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    } else if (query.get("payment_status") === "cancelled") {
      toast({
        title: "Pagamento Cancelado",
        description: "Você cancelou o processo de pagamento. Seu plano não foi alterado.",
        variant: "warning",
        duration: 5000,
      });
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [toast, navigate, refreshData, user]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-customPurple/20 rounded-full filter blur-3xl opacity-50 animate-pulse-slow"></div>
      <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-customGreen/20 rounded-full filter blur-3xl opacity-50 animate-pulse-slower"></div>

      <motion.div 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 text-center bg-slate-800/50 backdrop-blur-md p-8 md:p-12 rounded-xl shadow-2xl max-w-4xl w-full"
      >
        <div className="flex justify-center mb-6">
          <Lock className="w-16 h-16 text-amber-400" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
          Seu Período de Teste Expirou!
        </h1>
        <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
          Não perca o acesso! Faça o upgrade do seu plano para continuar usando todas as funcionalidades e manter sua empresa 100% organizada e eficiente.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {plansData.map((plan) => (
            <motion.div
              key={plan.id}
              whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}
              className={`bg-slate-700/70 p-6 rounded-lg border border-slate-600 flex flex-col items-center text-center transition-all duration-200 ${plan.recommended ? 'border-customGreen shadow-customGreen/30' : ''}`}
            >
              {plan.recommended && (
                <div className="absolute top-3 right-3 bg-customGreen text-white text-xs px-2 py-0.5 rounded-full font-semibold">POPULAR</div>
              )}
              <plan.icon className={`w-10 h-10 mb-3 ${plan.recommended ? 'text-customGreen' : 'text-customPurple'}`} />
              <h3 className="text-xl font-bold text-slate-100 mb-1">{plan.name}</h3>
              <p className="text-3xl font-extrabold text-white my-2">
                R$ {plan.priceMonthly}
                <span className="text-base font-normal text-slate-400">/mês</span>
              </p>
              <ul className="text-sm text-slate-300 space-y-1 mt-3 mb-5 text-left">
                {plan.features.map(feature => (
                  <li key={feature} className="flex items-center">
                    <ShieldCheck className="w-4 h-4 mr-2 text-customGreen shrink-0" /> {feature}
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => handleChoosePlan(plan.id, plan.stripePriceIdMonthly)}
                disabled={loadingStripe || !plan.stripePriceIdMonthly}
                className={`w-full mt-auto btn-custom-gradient text-white font-semibold py-2.5 text-md shadow-lg hover:shadow-xl transition-shadow duration-200 ${plan.recommended ? 'bg-gradient-to-r from-customGreen to-teal-500 hover:from-customGreen/90 hover:to-teal-500/90' : 'bg-gradient-to-r from-customPurple to-indigo-600 hover:from-customPurple/90 hover:to-indigo-600/90'}`}
              >
                {loadingStripe ? 'Aguarde...' : `Escolher ${plan.name.split(' ')[1]}`}
              </Button>
               {!plan.stripePriceIdMonthly && (
                <p className="text-xs text-center mt-2 text-red-400">Configuração pendente.</p>
              )}
            </motion.div>
          ))}
        </div>
        <p className="text-sm text-slate-400">
          Precisa de ajuda ou tem dúvidas? <a href="mailto:suporte@gofotografo.com" className="text-customPurple hover:underline">Fale conosco</a>.
        </p>
      </motion.div>
    </div>
  );
};

export default UpgradePage;